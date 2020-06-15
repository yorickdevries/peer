import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../../enum/HttpStatusCode";

const checkAuthentication = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(HttpStatusCode.UNAUTHORIZED).send("Please log in and try again");
  }
};

export default checkAuthentication;
