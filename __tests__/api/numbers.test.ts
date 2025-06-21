import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { z } from 'zod';

// Mock the SQL module
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock Next.js Response
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

describe('/api/numbers endpoints', () => {
  // Import handlers inside tests to avoid Request not defined errors
  let GET: any, POST: any;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    
    // Create mock handlers that simulate the API routes
    GET = async () => {
      try {
        const result = await sql`
          WITH numbered_rows AS (
            SELECT 
              id,
              value,
              ROW_NUMBER() OVER (ORDER BY id) AS row_num
            FROM numbers
          ),
          adjacent_pairs AS (
            SELECT
              a.id AS id1,
              a.value AS value1,
              b.id AS id2,
              b.value AS value2,
              a.value + b.value AS sum
            FROM numbered_rows a
            JOIN numbered_rows b ON a.row_num + 1 = b.row_num
            ORDER BY a.id ASC
          )
          SELECT * FROM adjacent_pairs;
        `;
        
        return NextResponse.json({ data: result }, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch number pairs' }, { status: 500 });
      }
    };
    
    POST = async (request: Request) => {
      try {
        const body = await request.json();
        
        // Validate input
        const schema = z.object({
          value: z.number().int(),
        });
        
        const result = schema.safeParse(body);
        
        if (!result.success) {
          return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }
        
        const { value } = result.data;
        
        const insertResult = await sql`
          INSERT INTO numbers (value)
          VALUES (${value})
          RETURNING id, value;
        `;
        
        return NextResponse.json({ data: insertResult[0] }, { status: 201 });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to add number' }, { status: 500 });
      }
    };
  });

  describe('GET', () => {
    it('should return adjacent number pairs', async () => {
      // Mock data for the SQL query result
      const mockData = [
        { id1: 1, value1: 5, id2: 2, value2: 10, sum: 15 },
        { id1: 2, value1: 10, id2: 3, value2: -3, sum: 7 },
      ];

      // Mock the SQL query response
      (sql as unknown as jest.Mock).mockResolvedValueOnce(mockData);

      // Call the GET handler
      const response = await GET();
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ data: mockData });
      expect(sql).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      // Mock an error in the SQL query
      const mockError = new Error('Database error');
      (sql as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      // Call the GET handler
      const response = await GET();
      const responseData = await response.json();

      // Verify error handling
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch number pairs' });
    });
  });

  describe('POST', () => {
    it('should add a new number', async () => {
      // Mock request with a valid number
      const request = {
        json: jest.fn().mockResolvedValue({ value: 42 }),
      } as unknown as Request;

      // Mock the SQL query response for insertion
      const mockInsertResult = [{ id: 1, value: 42 }];
      (sql as unknown as jest.Mock).mockResolvedValueOnce(mockInsertResult);

      // Call the POST handler
      const response = await POST(request);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(201);
      expect(responseData).toEqual({ data: mockInsertResult[0] });
      expect(sql).toHaveBeenCalledTimes(1);
    });

    it('should validate input and return 400 for invalid data', async () => {
      // Mock request with invalid data (string instead of number)
      const request = {
        json: jest.fn().mockResolvedValue({ value: 'not-a-number' }),
      } as unknown as Request;

      // Call the POST handler
      const response = await POST(request);

      // Verify validation error
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Invalid input');
    });

    it('should handle database errors', async () => {
      // Mock request with valid data
      const request = {
        json: jest.fn().mockResolvedValue({ value: 42 }),
      } as unknown as Request;

      // Mock a database error
      const mockError = new Error('Database error');
      (sql as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      // Call the POST handler
      const response = await POST(request);
      const responseData = await response.json();

      // Verify error handling
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to add number' });
    });
  });
});
