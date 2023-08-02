import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import multer from "multer";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import { Server } from "socket.io";
import { createServer } from "http";

import feedRouter from "./routes/feed.js";
import authRouter from "./routes/auth.js";
import statusRouter from "./routes/status.js";

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./api/images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else cb(null, false);
};

app.use(bodyParser.json()); //aplication/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(
  "/api/images",
  express.static(path.join(path.dirname("app.js"), "api", "images"))
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRouter);
app.use("/auth", authRouter);
app.use("/status", statusRouter);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

const httpServer = createServer(app);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then((res) => {
    // const server = app.listen(8080);
    const io = new Server(httpServer, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    io.on('connection', socket => {
      console.log('Client connected');
    });

    httpServer.listen(8080);
  })
  .catch((err) => console.log(err));
