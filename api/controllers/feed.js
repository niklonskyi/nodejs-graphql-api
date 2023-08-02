import { validationResult } from "express-validator";
import fs from "fs";
import path from "path";

import { getIO } from "../socket.js";
import Post from "../models/post.js";
import User from "../models/user.js";

function getPosts(req, res, next) {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  let totalItems;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .populate('creator')
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((posts) => {
      res.status(200).json({ message: "Fetched posts", posts: posts, totalItems: totalItems });
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

  let creator;
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imageUrl: req.file.path.replace(/\\/g, "/"),
    creator: req.userId,
  });

  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      user.posts.push(post);
      getIO().emit('posts', { action: 'create', post: {...post._doc, creator: {_id: req.userId, name: user.name} }});
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: post,
        creator: { _id: creator._id, name: creator.name },
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
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
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

function deletePost(req, res, next) {
  const postId = req.params.postId;
  Post.findById(postId)
  .then(post => {
    if (!post) {
      const error = new Error("Could not find the post.");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    clearImage(post.imageUrl);
    return Post.findByIdAndRemove(postId);
  })
  .then(result => {
    return User.findById(req.userId);}
  )
  .then(user => {
    user.posts.pull(postId);
    return user.save();
  })
  .then(result => {
    res.status(200).json({message: 'Post deleted succesfully.'});
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

export { getPosts, createPost, getPost, updatePost, deletePost };
