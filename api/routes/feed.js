import express from "express";
import { body } from "express-validator";

import * as feedController from "../controllers/feed.js";
import isAuth from "../middleware/is-auth.js";

const feedRouter = express.Router();

// GET /feed/posts
feedRouter.get("/posts", isAuth, feedController.getPosts);

// POST /feed/post
feedRouter.post(
  "/post",
  isAuth,
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

feedRouter.get("/post/:postId", isAuth, feedController.getPost);

feedRouter.put(
  "/post/:postId",
  isAuth,
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

feedRouter.delete("/post/:postId", isAuth, feedController.deletePost);

export default feedRouter;
