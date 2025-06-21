// Import postgres for raw SQL queries (primary database access method)
import postgres from "postgres";

// Note: Prisma is only used for schema/migrations
// All runtime queries use postgres client

// Connection options
const connectionOptions = {
  host: "localhost",
  port: 5432,
  database: "postgres",
  username: "postgres",
  password: "postgres",
  max: 10, // Connection pool size
  idle_timeout: 20, // Close idle connections after 20 seconds
  connect_timeout: 10, // Attempt to connect for 10 seconds
};

// Create a connection pool
const sql = postgres({
  host: connectionOptions.host,
  port: connectionOptions.port,
  database: connectionOptions.database,
  username: connectionOptions.username,
  password: connectionOptions.password,
  max: connectionOptions.max,
  idle_timeout: connectionOptions.idle_timeout,
  connect_timeout: connectionOptions.connect_timeout,
  ssl: false, // Disable SSL for local development
});

export default sql;
