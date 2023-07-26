import express from "express";
import { body } from "express-validator";

import * as feedController from "../controllers/feed.js";

const feedRouter = express.Router();

// GET /feed/posts
feedRouter.get("/posts", feedController.getPosts);

// POST /feed/post
feedRouter.post(
  "/post",
  [
    body("title")
      .trim()
      .isLength({ min: 5 }),
    body("content")
      .trim() 
      .isLength({ min: 5 }),
  ],
  feedController.createPost
);

feedRouter.get("/post/:postId", feedController.getPost);

feedRouter.put(
  "/post/:postId",
  [
    body("title")
      .trim()
      .isLength({ min: 5 }),
    body("content")
      .trim()
      .isLength({ min: 5 }),
  ],
  feedController.updatePost
);

feedRouter.delete('/post/:postId', feedController.deletePost);

export default feedRouter;
