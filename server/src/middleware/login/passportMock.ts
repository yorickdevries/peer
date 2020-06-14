// Mock the login of an user for development purposes
import MockStrategy from "passport-mock-strategy";
import { PassportStatic } from "passport";

const mockPassportConfiguration = function (
  passport: PassportStatic,
  netid: string,
  affiliation: string
): void {
  const userObject: Express.User = {
    netid: netid,
    studentNumber: 1234567,
    firstName: "First",
    prefix: "and",
    lastName: "Last",
    email: "mail@mail.com",
    affiliation: affiliation,
    displayName: netid,
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
