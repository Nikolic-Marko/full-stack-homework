# Full Stack Application Implementation

This document describes the implementation details of the Full Stack Assessment project.

## Implementation Overview

This application uses the following technologies:

- **Frontend**: Next.js (App Router), React, Material UI (MUI v5)
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with raw SQL queries
- **Data Fetching**: SWR for client-side data fetching with auto-revalidation
- **Form Validation**: Zod for schema validation
- **Testing**: Jest with React Testing Library

## Architecture

The application follows a modern full-stack architecture:

1. PostgreSQL database with tables for numbers and grades
2. Raw SQL queries for all data operations
3. Next.js API Routes as a thin REST layer
4. React components using SWR for data fetching
5. Material UI for consistent and responsive UI design

## Database Schema

The database schema is defined using Prisma (for schema only):

```prisma
// Number model
model Number {
  id        Int      @id @default(autoincrement())
  value     Int
  createdAt DateTime @default(now()) @map("created_at")

  @@map("numbers")
}

// Grade model
model Grade {
  id        Int      @id @default(autoincrement())
  class     String   // Math, Science, History
  value     Int      // Between 0 and 100
  createdAt DateTime @default(now()) @map("created_at")

  @@map("grades")
}
```

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd full-stack-homework
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up the database:
   ```bash
   # Start PostgreSQL container
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   
   # Configure the database connection
   # Create an .env file with:
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
   
   # Set up the database schema
   pnpm prisma migrate reset --force
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Features

### 1. Numbers Page

- Form for submitting integers with validation
- Table display of adjacent number pairs with automatic sums
- Auto-refresh using SWR when new data is added

The SQL query for fetching adjacent pairs uses a Common Table Expression (CTE) with window functions:
```sql
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
```

### 2. Grades Page

- Form with class dropdown and numeric grade input
- Input validation (0-100 range for grades)
- Grade statistics display with averages, min/max values
- Class-based grouping of grades with rankings

The SQL query for grade statistics uses window functions:
```sql
WITH grade_stats AS (
  SELECT
    class,
    value,
    AVG(value) OVER (PARTITION BY class) AS avg_grade,
    MIN(value) OVER (PARTITION BY class) AS min_grade,
    MAX(value) OVER (PARTITION BY class) AS max_grade,
    COUNT(*) OVER (PARTITION BY class) AS total_entries,
    RANK() OVER (PARTITION BY class ORDER BY value DESC) as rank_in_class
  FROM grades
  ORDER BY class, value DESC
)
SELECT 
  g.id,
  g.class,
  g.value,
  gs.avg_grade,
  gs.min_grade,
  gs.max_grade,
  gs.total_entries,
  gs.rank_in_class
FROM grades g
JOIN grade_stats gs ON g.class = gs.class AND g.value = gs.value
ORDER BY g.class, gs.rank_in_class;
```

## Testing

The application includes unit and integration tests:

- API endpoint tests for validation and error handling
- Component tests for UI elements

Run tests with:
```bash
pnpm test
```

## Optimization Features

- Connection pooling for database operations
- SWR for efficient data fetching and caching
- Responsive design with MUI components
- Error boundaries for graceful error handling
- Loading skeletons for better UX during data loading

## Design Decisions

1. **Raw SQL**: All data operations use raw SQL queries as required, with the Prisma ORM used only for schema definition and migrations.

2. **API Routes**: RESTful API endpoints were chosen over React Server Components to allow for clear separation of concerns and easier testing.

3. **Material UI**: Provides a comprehensive set of pre-designed components that follow the Material Design guidelines.

4. **Responsive Design**: The application is fully responsive and works on both desktop and mobile devices.

5. **Error Handling**: Comprehensive error handling is implemented at both the API and UI levels.
