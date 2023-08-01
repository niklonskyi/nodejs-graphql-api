import express from "express";
import { body } from "express-validator";

import StatusController from "../controllers/status.js";
import isAuth from "../middleware/is-auth.js";

const statusRouter = express.Router();
const statusController = new StatusController();

statusRouter.get("/get", isAuth, statusController.getStatus);

statusRouter.patch("/set", isAuth, statusController.setStatus);

export default statusRouter;
