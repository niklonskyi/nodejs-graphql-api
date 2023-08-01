import bodyParser from "body-parser";
import User from "../models/user.js";

export default class StatusController {
  getStatus(req, res, next) {
    let status;
    const userId = req.userId;
    User.findById(userId)
      .then((user) => {
        status = user.status;
        res
          .status(200)
          .json({ message: "Got status succesfully", status: status });
      })
      .catch((err) => {
        console.log(err);
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }

  setStatus(req, res, next) {
    const userId = req.userId;
    const newStatus = req.body.status;
    console.log(req.body);
    User.findById(userId)
      .then((user) => {
        if (!user) {
          const error = new Error("Could not find the user.");
          error.statusCode = 404;
          throw error;
        }
        console.log(newStatus);
        console.log(user);
        user.status = newStatus; 
        return user.save();
      })
      .then((result) => {
        console.log(result);
        res
          .status(200)
          .json({ message: "Status set succesfully."});
      })
      .catch((err) => {
        console.log(err);
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }
}
