// Mock the login of an user for development purposes
import passportCustom from "passport-custom";
import saveUserFromSSO from "../../util/saveUserFromSSO";
import { PassportStatic } from "passport";
import User from "../../models/User";

const mockPassportConfiguration = async function (
  passport: PassportStatic,
  netid: string,
  affiliation: string | string[],
  admin: boolean
): Promise<void> {
  const CustomStrategy = passportCustom.Strategy;
  // save the user to the database
  const userNetid = await saveUserFromSSO(
    netid,
    "1234567",
    "First",
    undefined,
    "Last",
    "mail@mail.com",
    netid,
    affiliation,
    "M Computer Science",
    [
      "EWI-ST-CSETT",
      "Electrical Engineering, Mathematics and Computer Science",
      "Software Technology",
    ]
  );

  const tempUser = await User.findOneOrFail(userNetid);
  tempUser.admin = admin;
  await User.save(tempUser);

  const user = { netid: userNetid };

  passport.use(
    "mock",
    new CustomStrategy((_req, callback) => {
      // Do your custom user finding logic here, or set to false based on req object
      callback(null, user);
    })
  );

  passport.serializeUser((user, done) => {
    done(undefined, user);
  });

  passport.deserializeUser((user, done) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    done(undefined, <any>user);
  });
};

export default mockPassportConfiguration;
