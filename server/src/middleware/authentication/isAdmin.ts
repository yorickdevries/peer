import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../../enum/HttpStatusCode";
import ResponseMessage from "../../enum/ResponseMessage";

/**
 * Checks if a user is admin.
 *
 * @param req - The express request
 * @param res - The express response
 * @param next - The express next function
 * @returns if the user is admin
 */
const isAdmin = async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const user = req.user!;
  if (user.admin) {
    next();
  } else {
    res.status(HttpStatusCode.FORBIDDEN).send(ResponseMessage.NO_ADMIN);
  }
};

export default isAdmin;
