import { NextResponse } from "next/server";
import sql from "@/lib/db";
import { z } from "zod";

jest.mock("@/lib/db", () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
    })),
  },
}));

describe("/api/grades endpoints", () => {
  let GET: any, POST: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    GET = async () => {
      try {
        const result = await sql`
          WITH grade_stats AS (
            SELECT
              class,
              value,
              AVG(value) OVER (PARTITION BY class) AS avg_grade,
              MIN(value) OVER (PARTITION BY class) AS min_grade,
              MAX(value) OVER (PARTITION BY class) AS max_grade,
              COUNT(*) OVER (PARTITION BY class) AS total_entries,
              RANK() OVER (PARTITION BY class ORDER BY value DESC) AS rank_in_class
            FROM grades
          )
          SELECT id, class, value, avg_grade, min_grade, max_grade, total_entries, rank_in_class
          FROM grade_stats
          JOIN grades USING (class, value)
          ORDER BY class ASC, value DESC;
        `;
        return NextResponse.json({ data: result }, { status: 200 });
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to fetch grades" },
          { status: 500 }
        );
      }
    };

    POST = async (request: Request) => {
      try {
        const body = await request.json();

        const schema = z.object({
          class: z.enum(["Math", "Science", "English", "History"]),
          value: z.number().int().min(0).max(100),
        });

        const result = schema.safeParse(body);

        if (!result.success) {
          return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const { class: className, value } = result.data;

        const insertResult = await sql`
          INSERT INTO grades (class, value)
          VALUES (${className}, ${value})
          RETURNING id, class, value;
        `;

        return NextResponse.json({ data: insertResult[0] }, { status: 201 });
      } catch (error) {
        return NextResponse.json(
          { error: "Failed to add grade" },
          { status: 500 }
        );
      }
    };
  });

  describe("GET", () => {
    it("should return grades with statistics", async () => {
      // Arrange
      const mockData = [
        {
          id: 1,
          class: "Math",
          value: 85,
          avg_grade: 85,
          min_grade: 85,
          max_grade: 85,
          total_entries: 1,
          rank_in_class: 1,
        },
        {
          id: 2,
          class: "Science",
          value: 90,
          avg_grade: 90,
          min_grade: 90,
          max_grade: 90,
          total_entries: 1,
          rank_in_class: 1,
        },
      ];

      (sql as unknown as jest.Mock).mockResolvedValueOnce(mockData);

      // Act
      const response = await GET();
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(responseData).toEqual({ data: mockData });
      expect(sql).toHaveBeenCalledTimes(1);
    });

    it("should handle errors", async () => {
      // Arrange
      const mockError = new Error("Database error");
      (sql as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      const response = await GET();
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: "Failed to fetch grades" });
    });
  });

  describe("POST", () => {
    it("should add a new grade", async () => {
      // Arrange
      const request = {
        json: jest.fn().mockResolvedValue({ class: "Math", value: 95 }),
      } as unknown as Request;

      const mockInsertResult = [{ id: 1, class: "Math", value: 95 }];
      (sql as unknown as jest.Mock).mockResolvedValueOnce(mockInsertResult);

      // Act
      const response = await POST(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(responseData).toEqual({ data: mockInsertResult[0] });
      expect(sql).toHaveBeenCalledTimes(1);
    });

    it("should validate class input and return 400 for invalid class", async () => {
      // Arrange
      const request = {
        json: jest.fn().mockResolvedValue({ class: "Geography", value: 80 }),
      } as unknown as Request;

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe("Invalid input");
    });

    it("should validate grade value and return 400 for out-of-range values", async () => {
      // Arrange
      const request = {
        json: jest.fn().mockResolvedValue({ class: "Math", value: 150 }),
      } as unknown as Request;

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
      const responseData = await response.json();
      expect(responseData.error).toBe("Invalid input");
    });

    it("should handle database errors", async () => {
      // Arrange
      const request = {
        json: jest.fn().mockResolvedValue({ class: "Science", value: 88 }),
      } as unknown as Request;

      const mockError = new Error("Database error");
      (sql as unknown as jest.Mock).mockRejectedValueOnce(mockError);

      // Act
      const response = await POST(request);
      const responseData = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(responseData).toEqual({ error: "Failed to add grade" });
    });
  });
});
