console.clear();

import Debug from "debug";
const debug = Debug("sf-api:app");

/** load and validate environment
 */
import ENV from "./environment.js";
// ----------------------------------------

/** load database
 */
import mongoose from "mongoose";
let db;
try {
  db = await mongoose.connect(`mongodb://localhost:27017/${ENV.DB_NAME}`);
  debug("db connected");
} catch (e) {
  debug("db connection failed", e);
}
// ----------------------------------------

import createError from "http-errors";
import path from "path";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import _ from "lodash";

/** import routes
 */
import { router as indexRoute } from "./routes/index.route.js";
import { router as showsRoute } from "./routes/shows.route.js";
import { router as spotifyRoute } from "./routes/spotify.route.js";
// ----------------------------------------

const app = express();
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

/** load routes
 */
app.use("/", indexRoute);
app.use("/api", showsRoute);
app.use("/spotify", spotifyRoute);
// ----------------------------------------

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  debug(`NOT FOUND 404: ${req.url}`);
  next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  const error: any = {};
  error.name = err.name || undefined;
  error.message = err.message || undefined;

  // render the error page
  res.status(err.status || 500).json(error);
});

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(ENV.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val: string | number) {
  const port = parseInt(val as string, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: { syscall: string; code: any }) {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  const addr = server.address();
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + addr?.port;

  debug("Listening on " + bind);
}
