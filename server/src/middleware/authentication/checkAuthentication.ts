import { Request, Response, NextFunction } from "express";
import HttpStatusCode from "../../enum/HttpStatusCode";
import User from "../../models/User";

import mysql from "mysql2";
import config from "config";

const databaseConfig: {
  type: string;
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
  connectionUrl?: string;
} = config.get("database");

const connection = mysql.createConnection({
  host: databaseConfig.host,
  user: databaseConfig.username,
  password: databaseConfig.password,
  database: databaseConfig.database,
});

const checkAndSetAuthentication = async function (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (req.isAuthenticated() && req.user?.netid) {
    // set req.user to the User object
    const netid = req.user.netid;

    console.log("start0", req.originalUrl, netid, new Date());
    connection.query(
      `SELECT * FROM \`user\` WHERE \`netid\` = '${netid}'`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
      (error: any, results: any, _fields: any) => {
        if (error) {
          console.log("error0", req.originalUrl, netid, new Date(), error);
        } else {
          console.log(results);
          console.log("end0", req.originalUrl, netid, new Date());
        }
      }
    );

    let user;
    console.log("start1", req.originalUrl, netid, new Date());
    try {
      user = await User.findOneOrFail(netid);
    } catch (error) {
      console.log("error1", req.originalUrl, netid, new Date(), error);
    }
    console.log("end1", req.originalUrl, netid, new Date());
    req.user = user;
    next();
  } else {
    res.status(HttpStatusCode.UNAUTHORIZED).send("Please log in and try again");
  }
};

export default checkAndSetAuthentication;
