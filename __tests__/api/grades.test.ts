import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/grades/route';
import sql from '@/lib/db';

// Mock the SQL module
jest.mock('@/lib/db', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('/api/grades endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return grades with statistics', async () => {
      // Mock data for the SQL query result
      const mockData = [
        { 
          id: 1,
          class: 'Math',
          value: 85,
          avg_grade: 85,
          min_grade: 85,
          max_grade: 85,
          total_entries: 1,
          rank_in_class: 1
        },
        {
          id: 2,
          class: 'Science',
          value: 90,
          avg_grade: 90,
          min_grade: 90,
          max_grade: 90,
          total_entries: 1,
          rank_in_class: 1
        }
      ];

      // Mock the SQL query response
      (sql as jest.Mock).mockResolvedValueOnce(mockData);

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
      (sql as jest.Mock).mockRejectedValueOnce(mockError);

      // Call the GET handler
      const response = await GET();
      const responseData = await response.json();

      // Verify error handling
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to fetch grades' });
    });
  });

  describe('POST', () => {
    it('should add a new grade', async () => {
      // Mock request with a valid grade
      const request = {
        json: jest.fn().mockResolvedValue({ class: 'Math', value: 95 }),
      } as unknown as NextRequest;

      // Mock the SQL query response for insertion
      const mockInsertResult = [{ id: 1, class: 'Math', value: 95 }];
      (sql as jest.Mock).mockResolvedValueOnce(mockInsertResult);

      // Call the POST handler
      const response = await POST(request);
      const responseData = await response.json();

      // Verify the response
      expect(response.status).toBe(201);
      expect(responseData).toEqual({ data: mockInsertResult[0] });
      expect(sql).toHaveBeenCalledTimes(1);
    });

    it('should validate class input and return 400 for invalid class', async () => {
      // Mock request with invalid class
      const request = {
        json: jest.fn().mockResolvedValue({ class: 'Geography', value: 80 }),
      } as unknown as NextRequest;

      // Call the POST handler
      const response = await POST(request);

      // Verify validation error
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe('Invalid input');
    });

    it('should validate grade value and return 400 for out-of-range values', async () => {
      // Mock request with out-of-range grade value
      const request = {
        json: jest.fn().mockResolvedValue({ class: 'Math', value: 150 }),
      } as unknown as NextRequest;

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
        json: jest.fn().mockResolvedValue({ class: 'Science', value: 88 }),
      } as unknown as NextRequest;

      // Mock a database error
      const mockError = new Error('Database error');
      (sql as jest.Mock).mockRejectedValueOnce(mockError);

      // Call the POST handler
      const response = await POST(request);
      const responseData = await response.json();

      // Verify error handling
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: 'Failed to add grade' });
    });
  });
});
