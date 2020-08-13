import express from "express";
import User from "../models/User";
import { validateParams } from "../middleware/validation";
import Joi from "@hapi/joi";
import HttpStatusCode from "../enum/HttpStatusCode";
import _ from "lodash";
const router = express.Router();

// Joi inputvalidation
const netidSchema = Joi.object({ netid: Joi.string().required() });
router.get("/:netid", validateParams(netidSchema), async (req, res) => {
  const user = await User.findOne(req.params.netid);
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
});

export default router;
