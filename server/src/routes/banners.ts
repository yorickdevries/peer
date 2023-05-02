import {
  idSchema,
  validateBody,
  validateParams,
} from "../middleware/validation";
import Banner from "../models/Banner";
import HttpStatusCode from "../enum/HttpStatusCode";
import Joi from "joi";

import express from "express";

const router = express.Router();

const schema = Joi.object({
  title: Joi.string().required(),
  text: Joi.string().required(),
  active: Joi.boolean().required(),
});

// get all banners (admin only)
router.get("/", async (_req, res) => {
  // get all banners
  const banners = await Banner.find();
  res.send(banners);
});

router.get("/:id", validateParams(idSchema), async (req, res) => {
  const banner = await Banner.findOne({ where: { id: req.params.id } });
  if (!banner) {
    res.status(HttpStatusCode.NOT_FOUND).send();
    return;
  }
  res.send(banner);
});

router.post("/", validateBody(schema), async (req, res) => {
  const banner = new Banner(req.body.title, req.body.text, req.body.active);
  await banner.save();
  res.send(banner);
});

router.patch(
  "/:id",
  validateParams(idSchema),
  validateBody(schema),
  async (req, res) => {
    const banner = await Banner.findOne({ where: { id: req.params.id } });
    if (!banner) {
      res.status(HttpStatusCode.NOT_FOUND).send();
      return;
    }

    banner.title = req.body.title;
    banner.text = req.body.text;
    banner.active = req.body.active;
    await banner.save();
    res.send(banner);
  }
);

router.delete("/:id", validateParams(idSchema), async (req, res) => {
  const banner = await Banner.findOne({ where: { id: req.params.id } });

  if (!banner) {
    res.status(HttpStatusCode.NOT_FOUND).send();
    return;
  }

  await banner.remove();
  res.send(banner);
});

export default router;
