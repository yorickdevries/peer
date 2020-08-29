import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../../enum/HttpStatusCode";
import _ from "lodash";
import ResponseMessage from "../../enum/ResponseMessage";

const checkEmployee = async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  if (
    _.some(user.affiliation, (o) => {
      return o.name === "employee";
    })
  ) {
    next();
  } else {
    res.status(HttpStatusCode.FORBIDDEN).send(ResponseMessage.NO_EMPLOYEE);
  }
};

export default checkEmployee;
