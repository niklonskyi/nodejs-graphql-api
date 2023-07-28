import express from "express";
import { body } from "express-validator";

import User from "../models/user.js";
import AuthController from "../controllers/auth.js";

const authRouter = express.Router();
const authController = new AuthController();

authRouter.put("/signup", [
  body("email")
    .isEmail()
    .withMessage("Enter a valid emai")
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("E-Mail adress already exists.");
        }
      });
    })
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 5 }),
  body("name")
    .trim()
    .not()
    .isEmpty(),
], authController.signUp);

authRouter.post('/login', authController.login);

export default authRouter;
