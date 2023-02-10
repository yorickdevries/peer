import Joi from "@hapi/joi";
import { NextFunction, Request, RequestHandler, Response } from "express";
import HttpStatusCode from "../enum/HttpStatusCode";
import _ from "lodash";

// default idSchema used throughout routes
const idSchema = Joi.object({
  id: Joi.number().integer().required(),
});

const idStringSchema = Joi.object({
  id: Joi.string().required(),
});

const validate = (
  schema: Joi.ObjectSchema,
  field: "body" | "query" | "params"
) => {
  return function (req: Request, res: Response, next: NextFunction): void {
    const nullConverted = convertNullStrings(req[field]);
    const { error, value } = schema.validate(nullConverted);
    if (error) {
      // Send the user why the validation failed
      res.status(HttpStatusCode.BAD_REQUEST).send(String(error));
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

const validateParams = (schema: Joi.ObjectSchema): RequestHandler => {
  return validate(schema, "params");
};

export {
  idSchema,
  idStringSchema,
  validateBody,
  validateQuery,
  validateParams,
};
