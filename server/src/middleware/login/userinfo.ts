import { Request, Response, NextFunction } from "express";
import { User } from "../../models/User";

// This route checks the user and updates it in the database
const saveUserinfo = async function (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const userinfo = req.user;
  // check whether userinfo exists
  if (!userinfo || !userinfo.netid) {
    // no user logged in
    next();
  } else {
    // Save user to database
    const user = new User();
    user.netid = userinfo.netid;
    user.studentNumber = userinfo.studentNumber;
    user.firstName = userinfo.firstName;
    user.prefix = userinfo.prefix;
    user.lastName = userinfo.lastName;
    user.email = userinfo.email;
    user.affiliation = userinfo.affiliation;
    user.displayName = userinfo.displayName;
    user.study = userinfo.study;
    user.organisationUnit = userinfo.organisationUnit;
    await user.save();
    console.log(`Saved ${user.netid}`);
    next();
  }
};

export default saveUserinfo;
