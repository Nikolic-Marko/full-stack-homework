import { NextRequest, NextResponse } from "next/server";
import sql from "@/lib/db";
import { z } from "zod";

const numberSchema = z.object({
  value: z.number().int(),
});

export async function GET() {
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
    console.error("Error fetching number pairs:", error);
    return NextResponse.json(
      { error: "Failed to fetch number pairs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { value } = numberSchema.parse(body);

    const result = await sql`
      INSERT INTO numbers (value)
      VALUES (${value})
      RETURNING id, value;
    `;

    return NextResponse.json({ data: result[0] }, { status: 201 });
  } catch (error) {
    console.error("Error adding number:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to add number" },
      { status: 500 }
    );
  }
}
