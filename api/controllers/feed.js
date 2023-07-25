import { validationResult } from "express-validator";
import Post from "../models/post.js";

function getPosts(req, res, next) {
  Post.find()
    .then((posts) => {
      res.status(200).json({ message: "Fetched posts", posts: posts });
    })
    .catch(catchError);
}

function createPost(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }

  const post = new Post({ 
    title: req.body.title,
    content: req.body.content, 
    imageUrl: req.file.path.replace(/\\/g, '/'),
    creator: {
      name: "Artem",
    }
  });

  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch(catchError);
}

function getPost(req, res, next) {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find the post.");
        error.statusCode = 404;
        throw error;
      }

      res.status(200).json({ message: "Post fetched.", post: post });
    })
    .catch(catchError);
}

function catchError(err) {
  console.log(err);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}

export { getPosts, createPost, getPost };
