import { Request, Response, NextFunction } from "express";
import User from "../../models/User";
import HttpStatusCode from "../../enum/HttpStatusCode";

const checkEmployee = async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const netid = req.user?.netid;
  if (netid !== undefined) {
    const user = await User.findOne(netid, { relations: ["affiliation"] });
    if (user?.affiliation) {
      const employeeAffiliation = user.affiliation.find((elem) => {
        return elem.name === "employee";
      });
      if (employeeAffiliation) {
        next();
      } else {
        res.status(HttpStatusCode.FORBIDDEN).send("User is not an employee");
      }
    } else {
      res.status(HttpStatusCode.FORBIDDEN).send("User is not in the database");
    }
  } else {
    res.status(HttpStatusCode.FORBIDDEN).send("User is not logged in");
  }
};

export default checkEmployee;
