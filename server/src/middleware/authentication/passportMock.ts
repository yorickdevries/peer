// Mock the login of an user for development purposes
import MockStrategy from "passport-mock-strategy";
import saveUserFromSSO from "../../util/saveUserFromSSO";
import { PassportStatic } from "passport";
import User from "../../models/User";

const mockPassportConfiguration = async function (
  passport: PassportStatic,
  netid: string,
  affiliation: string | string[],
  admin: boolean
): Promise<void> {
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
  const strategy = new MockStrategy({
    name: "mock",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: user as any, // Added any as MockStrategy asks for a specific User type
  });
  passport.use(strategy);

  passport.serializeUser((user, done) => {
    done(undefined, user);
  });

  passport.deserializeUser((user, done) => {
    done(undefined, user);
  });
};

export default mockPassportConfiguration;
