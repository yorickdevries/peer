import express from "express";
import User from "../models/User";
import { validateParams, idStringSchema } from "../middleware/validation";
import HttpStatusCode from "../enum/HttpStatusCode";
import _ from "lodash";
import checkEmployee from "../middleware/authentication/checkEmployee";
const router = express.Router();

router.get(
  "/:id",
  checkEmployee,
  validateParams(idStringSchema),
  async (req, res) => {
    const user = await User.findOne(req.params.id);
    if (!user) {
      res.status(HttpStatusCode.NOT_FOUND).send("User not found");
    } else {
      res.send(
        _.pick(user, [
          "netid",
          "displayName",
          "email",
          "affiliation",
          "study",
          "organisationUnit",
        ])
      );
    }
  }
);

export default router;
