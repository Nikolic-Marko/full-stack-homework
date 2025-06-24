import postgres from "postgres";

const connectionOptions = {
  host: "localhost",
  port: 5432,
  database: "postgres",
  username: "postgres",
  password: "postgres",
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
};

const sql = postgres({
  host: connectionOptions.host,
  port: connectionOptions.port,
  database: connectionOptions.database,
  username: connectionOptions.username,
  password: connectionOptions.password,
  max: connectionOptions.max,
  idle_timeout: connectionOptions.idle_timeout,
  connect_timeout: connectionOptions.connect_timeout,
  ssl: false,
});

export default sql;
