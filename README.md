# Full-Stack App

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up PostgreSQL using Docker:
   ```bash
   docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres
   ```
4. Generate Prisma client (important!):
   ```bash
   pnpm prisma generate
   ```
5. Apply database migrations:
   ```bash
   pnpm prisma migrate dev
   ```
6. Start the development server:
   ```bash
   pnpm dev
   ```
7. Access the application at [http://localhost:3000](http://localhost:3000)

## Database Schema

### Numbers Table

```sql
CREATE TABLE numbers (
  id SERIAL PRIMARY KEY,
  value INTEGER NOT NULL
);
```

### Grades Table

```sql
CREATE TABLE grades (
  id SERIAL PRIMARY KEY,
  class VARCHAR(255) NOT NULL,
  value INTEGER NOT NULL CHECK (value >= 0 AND value <= 100)
);
```

## Testing

To run the test suite:

```bash
pnpm test
```

Tests include:

- API route unit tests for `/api/numbers` and `/api/grades` endpoints
- Component tests for UI elements

## Project Structure

- `app/` - Next.js App Router pages and components
- `app/api/` - API routes for data operations
- `app/components/` - Shared React components
- `lib/` - Utility functions and database connection
- `prisma/` - Database schema and migrations
- `__tests__/` - Test files

## Implementation Notes

- Raw SQL is used for all runtime database operations
- Prisma is only used for schema definition and migrations
- The application uses a client-side data fetching strategy with SWR
- All forms include proper validation and error handling
- See IMPLEMENTATION.md for more detailed architecture decisions
