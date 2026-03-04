#!/usr/bin/env node

const app = require("./src/main.js");
const { APP_PORT } = require("./src/config/config.default.js");

const port = normalizePort(APP_PORT || "3000");
const server = app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});

server.on("error", onError);

function normalizePort(val) {
  const parsedPort = parseInt(val, 10);
  if (Number.isNaN(parsedPort)) {
    return val;
  }
  if (parsedPort >= 0) {
    return parsedPort;
  }
  return false;
}

function onError(error) {
  if (error.syscall !== "listen") {
    console.error(error);
    return;
  }

  const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
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
      console.error(error);
      process.exit(1);
  }
}
