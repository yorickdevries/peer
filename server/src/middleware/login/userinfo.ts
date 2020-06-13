import { Request, Response, NextFunction } from "express";

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
    // TODO: save to new database
    console.log(`Saving ${userinfo.netid}`);
    next();
  }
};

export default saveUserinfo;
