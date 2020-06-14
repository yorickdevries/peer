import { Request, Response, NextFunction } from "express";
import parseNetId from "../../util/parseNetId";
import parseAndSaveSSOFields from "../../util/parseAndSaveSSOFields";
import { User } from "../../models/User";
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
      // needs to be improved with affiliation table
      String(userinfo.affiliation),
      userinfo.displayName,
      // needs to be improved with study table
      // in addition this will result in a undefined string in the database
      String(userinfo.study),
      await parseAndSaveSSOFields(userinfo.organisationUnit, OrganisationUnit)
    );
    // TODO: Add class validation before save
    await user.save();
    next();
  }
};

export default saveUserinfo;
