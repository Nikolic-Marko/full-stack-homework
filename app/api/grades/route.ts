import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { z } from "zod";

const gradeSchema = z.object({
  class: z.enum(["Math", "Science", "History"]),
  value: z.number().int().min(0).max(100),
});

export async function GET() {
  try {
    const result = await sql`
      WITH grade_stats AS (
        SELECT
          id,
          class,
          value,
          AVG(value) OVER (PARTITION BY class) AS avg_grade,
          MIN(value) OVER (PARTITION BY class) AS min_grade,
          MAX(value) OVER (PARTITION BY class) AS max_grade,
          COUNT(*) OVER (PARTITION BY class) AS total_entries,
          RANK() OVER (PARTITION BY class ORDER BY value DESC) as rank_in_class
        FROM grades
      )
      SELECT 
        id,
        class,
        value,
        avg_grade,
        min_grade,
        max_grade,
        total_entries,
        rank_in_class
      FROM grade_stats
      ORDER BY class, rank_in_class;
    `;

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { class: className, value } = gradeSchema.parse(body);

    const result = await sql`
      INSERT INTO grades (class, value)
      VALUES (${className}, ${value})
      RETURNING id, class, value;
    `;

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error adding grade:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: "Failed to add grade" }, { status: 500 });
  }
}
