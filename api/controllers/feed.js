import { validationResult } from "express-validator";
import Post from "../models/post.js";
import fs from 'fs';
import path from "path";

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
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imageUrl: req.file.path.replace(/\\/g, "/"),
    creator: {
      name: "Artem",
    },
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

function updatePost(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;

  let imageUrl = req.body.image;
  if (req.file) imageUrl = req.file.path;
  if (!imageUrl) {
    const error = new Error("No file picked.");
    error.statusCode = 422;

    throw error;
  }

  Post.findById(postId)
  .then(post => {
    if (!post) {
      const error = new Error("Could not find the post.");
      error.statusCode = 404;
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl.replace(/\\/g, "/");
    post.content = content;
    return post.save();
  })
  .then(result => {
    res.status(200).json({ message: 'Post updated!', post: result});
  })
  .catch(catchError); 
}

function clearImage(filePath) {
  filePath = path.join(path.dirname(filePath), '..', '..', filePath);
  fs.unlink(filePath, err => console.log(err));
}

function catchError(err) {
  console.log(err);
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}

export { getPosts, createPost, getPost, updatePost };
