import { Request, Response, NextFunction } from "express";

const authenticationCheck = function (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.sendStatus(401);
  }
};

export default authenticationCheck;
