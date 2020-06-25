import Joi from "@hapi/joi";
import { Request, Response, NextFunction, RequestHandler } from "express";
import HttpStatusCode from "../enum/HttpStatusCode";
import _ from "lodash";

const validate = (schema: Joi.ObjectSchema, field: "body" | "query") => {
  return function (req: Request, res: Response, next: NextFunction): void {
    const nullConverted = convertNullStrings(req[field]);
    const { error, value } = schema.validate(nullConverted);
    if (error) {
      res.status(HttpStatusCode.BAD_REQUEST).send(error);
    } else {
      // replace the value with converted version
      req[field] = value;
      next();
    }
  };
};

// convert all null strings to null objects
const convertNullStrings = (obj: unknown) => {
  if (typeof obj === "object") {
    return _.mapValues(obj, (o) => {
      if (o === "null") {
        return null;
      } else {
        return o;
      }
    });
  } else {
    return obj;
  }
};

const validateBody = (schema: Joi.ObjectSchema): RequestHandler => {
  return validate(schema, "body");
};

const validateQuery = (schema: Joi.ObjectSchema): RequestHandler => {
  return validate(schema, "query");
};

export { validateBody, validateQuery };
