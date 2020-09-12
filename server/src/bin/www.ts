#!/usr/bin/env node

// Module dependencies.
import http from "http";
import createDatabaseConnection from "../databaseConnection";
import app from "../app";
import isTSNode from "../util/isTSNode";

if (isTSNode) {
  console.log("Running under TS Node");
} else {
  console.log("Running under Node.JS");
}

console.log("Currently running in: " + app.get("env"));

// Normalize a port into a number, string, or false.
function normalizePort(val: number | string) {
  const port: number = typeof val === "string" ? parseInt(val, 10) : val;
  if (isNaN(port)) return val;
  else if (port >= 0) return port;
  else return false;
}

// Get port from environment and store in Express.
const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

// Create HTTP server.
const server = http.createServer(app);

createDatabaseConnection()
  .then((connection) => {
    console.log(
      `Connected to ${connection.options.type} database: ${connection.options.database}`
    );

    // Listen on provided port, on all network interfaces.
    server.listen(port);
    server.on("error", onError);
    server.on("listening", onListening);

    // Print time info on start of the script
    const startMessage = `Started server at ${new Date()}`;
    console.log(startMessage);
    console.error(startMessage);

    // Event listener for HTTP server "error" event.
    function onError(error: NodeJS.ErrnoException) {
      if (error.syscall !== "listen") throw error;
      const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
      switch (error.code) {
        case "EACCES":
          console.error(`${bind} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(`${bind} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    }

    // Event listener for HTTP server "listening" event.
    function onListening() {
      const addr = server.address();
      const bind =
        typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
      console.log(`Listening on ${bind}`);
    }
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
