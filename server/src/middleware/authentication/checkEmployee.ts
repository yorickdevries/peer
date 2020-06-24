import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../../enum/HttpStatusCode";
import _ from "lodash";

const checkEmployee = async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const user = req.user!;
  if (
    _.some(user.affiliation, (elem) => {
      return elem.name === "employee";
    })
  ) {
    next();
  } else {
    res.status(HttpStatusCode.FORBIDDEN).send("User is not an employee");
  }
};

export default checkEmployee;
