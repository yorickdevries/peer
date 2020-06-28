import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../../enum/HttpStatusCode";
import User from "../../models/User";

const checkAuthentication = async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.isAuthenticated() && req.user?.netid) {
    // set req.user to the User object
    const netid = req.user.netid;
    const user = await User.findOneOrFail(netid);
    req.user = user;
    next();
  } else {
    res.status(HttpStatusCode.UNAUTHORIZED).send("Please log in and try again");
  }
};

export default checkAuthentication;
