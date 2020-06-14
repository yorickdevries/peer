import { Request, Response, NextFunction } from "express";
import parseNetId from "../../util/parseNetId";
import { User } from "../../models/User";

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
    const user = new User();
    user.netid = parseNetId(userinfo.netid);
    user.studentNumber = userinfo.studentNumber;
    user.firstName = userinfo.firstName;
    user.prefix = userinfo.prefix;
    user.lastName = userinfo.lastName;
    user.email = userinfo.email;
    // needs to be improved with affiliation table
    user.affiliation = String(userinfo.affiliation);
    user.displayName = userinfo.displayName;
    user.study = userinfo.study;
    // needs to be improved with organisationUnit table
    user.organisationUnit = String(userinfo.organisationUnit);
    // TODO: Add class validation before save
    await user.save();
    next();
  }
};

export default saveUserinfo;
