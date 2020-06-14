// Makes sure that the type of res.user is correct
import { User as UserModel } from "../models/user";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserModel {}
  }
}
