import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../enum/HttpStatusCode";

const authenticationCheck = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(HttpStatusCode.UNAUTHORIZED);
  }
};

export default authenticationCheck;
