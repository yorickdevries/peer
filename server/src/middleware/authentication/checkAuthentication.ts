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
    res.sendStatus(HttpStatusCode.UNAUTHORIZED);
  }
};

export default checkAuthentication;
