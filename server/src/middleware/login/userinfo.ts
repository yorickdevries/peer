import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
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
  // check whether userinfo exists
  if (!userinfo) {
    // no user logged in
    next();
  } else {
    // Save user to database
    // Overwrites existing entry with the same NetID if present
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
    // Validation before save
    const errors = await validate(user, { skipMissingProperties: true });
    if (errors.length > 0) {
      console.error("User validation failed: ", errors);
    }
    // still save as we dont want to block users from using the app
    await user.save();
    next();
  }
};

export default saveUserinfo;
