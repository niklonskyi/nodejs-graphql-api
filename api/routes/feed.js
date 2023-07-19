import express from "express";

import * as feedController from "../controllers/feed.js";

const feedRouter = express.Router();

// GET /feed/posts
feedRouter.get("/posts", feedController.getPosts);

feedRouter.post('/post', feedController.createPost)

export default feedRouter;
