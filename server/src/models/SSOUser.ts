import Joi from "@hapi/joi";
// The way the user is returned from TU Delft Single Sign On
// Some fields are optional depending on whether the user is student/employee
interface SSOUser {
  netid: string;
  studentNumber?: number;
  firstName: string;
  prefix?: string;
  lastName: string;
  email: string;
  displayName: string;
  affiliation: string | string[];
  study?: string | string[];
  organisationUnit?: string | string[];
}

// Joi Schema
const SSOUserSchema = Joi.object({
  netid: Joi.string().required(),
  studentNumber: Joi.number(),
  firstName: Joi.string(),
  prefix: Joi.string(),
  lastName: Joi.string(),
  email: Joi.string(),
  displayName: Joi.string(),
  affiliation: [Joi.string(), Joi.array().items(Joi.string())],
  study: [Joi.string(), Joi.array().items(Joi.string())],
  organisationUnit: [Joi.string(), Joi.array().items(Joi.string())],
});

export { SSOUser, SSOUserSchema };
