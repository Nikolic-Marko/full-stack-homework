# Next.js Full-Stack Application

A modern full-stack web application built with Next.js (App Router), React, and PostgreSQL with raw SQL queries. This application demonstrates database integration, form handling, data visualization, and efficient client-side data fetching.

## Overview

This application demonstrates:

- Next.js App Router with client and server components
- Raw SQL database operations with the `postgres` npm package
- Prisma for schema management (migrations only)
- Material UI for component styling
- Client-side data fetching with SWR
- Form handling and validation with Zod

## Features

- **Numbers Page**: Add numbers and view adjacent pairs with their sums
- **Grades Page**: Record student grades and view statistics by class
- **Comprehensive Testing**: Unit and integration tests for API endpoints and UI components

## Technology Stack

- **Frontend**: React 19, Material UI v5, SWR
- **Backend**: Next.js API Routes, PostgreSQL
- **Database Access**: `postgres` npm package with raw SQL
- **Schema Management**: Prisma (for migrations only)
- **Testing**: Jest, React Testing Library
- **Validation**: Zod
- **Package Manager**: pnpm

### Project Requirements

You will need to create a Single Page Application (SPA) with the following technical requirements:

The application should implement client-side routing with two main pages accessible via these routes:

- `/numbers` - For number pair calculations
- `/grades` - For grade management and analysis

Include a top navigation bar that provides navigation between pages

The application can utilize a modern UI component library for consistent design and enhanced user experience. While you have flexibility in choosing any UI library, [Material UI](https://mui.com/) is preferred.

For data fetching and database communication, implement one of these approaches:

- [API Routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) - Create RESTful endpoints in Next.js to handle client-side data fetching with proper error handling and loading states

- [React Server Components (RSC)](https://nextjs.org/docs/app/getting-started/fetching-data) - Leverage server-side rendering for optimal performance, with streaming capabilities and selective hydration

Ensure your implementation includes proper error boundaries, loading indicators, and responsive design principles regardless of your chosen approach.

#### numbers Page

Form for submitting integers:
- Include a number input field that accepts both positive and negative integers.
- On submit, save the value into the numbers table using raw SQL.
 
Display adjacent number pairs:
- Below the form, show a table of adjacent numbers and their sums.
- The format should be as follows:
 
| ID 1 | Number 1 | ID 2 | Number 2 | Sum |
| ---- | -------- | ---- | -------- | --- |
| 1    | 3        | 2    | 5        | 8   |
| 2    | 5        | 3    | 7        | 12  |
| 3    | 7        | 4    | 2        | 9   |

- Auto-refresh the table when a new number is added.
 
#### grades Page

Create a form with:

- A dropdown for class selection with options: Math, Science, and History
- A numeric grade input field (must be between 0 and 100)
- A submit button that inserts the entry into the grades table using raw SQL

## Technical Constraints

- Must use **raw SQL** queries for database operations
- ORM usage is allowed only for schema creation and seeding, but all data operations must use raw SQL queries

## Bonus Points

- Unit and integration tests
- Performance optimizations
- Input validation
- Error boundary implementation

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
