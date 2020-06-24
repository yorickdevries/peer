import Joi from "@hapi/joi";
import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../enum/HttpStatusCode";

const validate = (schema: Joi.ObjectSchema, field: "body" | "query") => {
  return function (req: Request, res: Response, next: NextFunction): void {
    const error = schema.validate(req[field]).error;
    if (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    } else {
      next();
    }
  };
};

const validateBody = (
  schema: Joi.ObjectSchema
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return validate(schema, "body");
};

const validateQuery = (
  schema: Joi.ObjectSchema
): ((req: Request, res: Response, next: NextFunction) => void) => {
  return validate(schema, "query");
};

export { validateBody, validateQuery };
