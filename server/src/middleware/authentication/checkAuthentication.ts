import { Request, Response, NextFunction } from "express";
import { getConnection } from "typeorm";
import HttpStatusCode from "../../enum/HttpStatusCode";
import User from "../../models/User";

const checkAndSetAuthentication = async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.isAuthenticated() && req.user?.netid) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const connection = getConnection().driver as any;
    const pool = connection.pool;
    const connectionLimit = pool.config.connectionLimit;
    const allConnectionsLength = pool._allConnections.length;
    const freeConnectionsLength = pool._freeConnections.length;
    const queueConnectionsLength = pool._connectionQueue.length;
    // debug info:
    console.log(
      `Connection info: Limit: ${connectionLimit}, All: ${allConnectionsLength}, Free: ${freeConnectionsLength} Queue: ${queueConnectionsLength}`
    );
    // set req.user to the User object
    const netid = req.user.netid;
    const user = await User.findOneOrFail(netid);
    req.user = user;
    next();
  } else {
    res.status(HttpStatusCode.UNAUTHORIZED).send("Please log in and try again");
  }
};

export default checkAndSetAuthentication;
