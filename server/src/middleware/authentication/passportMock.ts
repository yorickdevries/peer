// Mock the login of an user for development purposes
import MockStrategy from "passport-mock-strategy";
import parseNetId from "../../util/parseNetId";
import { PassportStatic } from "passport";

const mockPassportConfiguration = function (
  passport: PassportStatic,
  netid: string,
  affiliation: string | string[]
): void {
  const userObject: Express.User = {
    netid: parseNetId(netid), // parsed as this is the primary key
    studentNumber: 1234567,
    firstName: "First",
    lastName: "Last",
    email: "mail@mail.com",
    displayName: netid,
    affiliation: affiliation,
    study: "M Computer Science",
    organisationUnit: [
      "EWI-ST-CSETT",
      "Electrical Engineering, Mathematics and Computer Science",
      "Software Technology",
    ],
  };

  const strategy = new MockStrategy({
    name: "mock",
    user: userObject as any, // Added any as MockStrategy asks for a specific User type
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
