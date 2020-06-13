import { Request, Response, NextFunction } from "express";

// This route checks the user and updates it in the database
const saveUserinfo = async function (
  req: Request,
  _: Response,
  next: NextFunction
): Promise<void> {
  const userinfo = req.user;
  // check whether userinfo exists
  if (userinfo == undefined || userinfo.netid == undefined) {
    // no user logged in
    next();
  } else {
    // TODO: save to database
    console.log(`Saving ${userinfo}`);
    next();
  }
};

export default saveUserinfo;
