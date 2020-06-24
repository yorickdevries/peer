// Makes sure that the type of res.user is correct
import UserModel from "../models/User";

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends UserModel {}
  }
}
