import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { SSOUserSchema } from "../../models/SSOUser";
import parseNetId from "../../util/parseNetId";
import parseAndSaveSSOFields from "../../util/parseAndSaveSSOFields";
import { User } from "../../models/User";
import { Affiliation } from "../../models/Affiliation";
import { Study } from "../../models/Study";
import { OrganisationUnit } from "../../models/OrganisationUnit";

// This route checks the user and updates it in the database
const saveUserinfo = async function (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const userinfo = req.user;
  try {
    if (userinfo === undefined) {
      throw new Error("req.user is undefined");
    }
    // check whether the schema is compliant with what is expected
    const joiError = SSOUserSchema.validate(userinfo).error;
    if (joiError) {
      throw joiError;
    }
    // Try to save the user to database
    const user = new User(
      parseNetId(userinfo.netid),
      userinfo.studentNumber,
      userinfo.firstName,
      userinfo.prefix,
      userinfo.lastName,
      userinfo.email,
      userinfo.displayName,
      await parseAndSaveSSOFields(userinfo.affiliation, Affiliation),
      await parseAndSaveSSOFields(userinfo.study, Study),
      await parseAndSaveSSOFields(userinfo.organisationUnit, OrganisationUnit)
    );
    // Class Validation before saving to database
    const errors = await validate(user, { skipMissingProperties: true });
    if (errors.length > 0) {
      throw errors;
    }
    // Overwrites existing entry with the same NetID if present
    // Does however not delete values if undefined values are passed
    await user.save();
  } catch (error) {
    console.error("Problem while saving user: ", error);
    // Alternatively, try to just save the NetID to the database
    try {
      if (typeof userinfo?.netid !== "string") {
        throw new Error("NetID is not a string");
      }
      const user = new User(parseNetId(userinfo.netid));
      await user.save();
    } catch (error2) {
      console.error(`Cannot save: ${userinfo}, Error: ${error2}`);
    }
  } finally {
    // call next route anyhow
    next();
  }
};

export default saveUserinfo;
