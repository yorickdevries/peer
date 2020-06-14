import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
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
    console.log("No user saved");
    next();
  } else {
    // TODO: save to new database
    const userRepository = getRepository(User);
    const user = new User();
    user.netid = userinfo.netid;
    userRepository.save(user);
    console.log(`Saved ${userinfo.netid}`);
    next();
  }
};

export default saveUserinfo;
