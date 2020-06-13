// Mock the login of an user for development purposes
import MockStrategy from "passport-mock-strategy";
import ParseNetId from "./parseNetId";

const mockPassportConfiguration = function(passport: any, netid: string, affiliation: any) {
  const userobject: any = {
    netid: ParseNetId.parseNetId(netid),
    studentNumber: 1234567,
    firstName: "First",
    prefix: "and",
    lastName: "Last",
    email: "mail@mail.com",
    affiliation: affiliation,
    displayName: netid,
    study: "M Computer Science",
    organisationUnit: "Electrical Engineering, Mathematics and Computer Science"
  };

  const strategy = new MockStrategy({
    name: "mock_old",
    user: userobject
    }, (profile: any, done: any) => {
      return done(undefined, profile);
    });
    passport.use(strategy);

    passport.serializeUser((user: any, done: any) => {
      done(undefined, user);
    });

    passport.deserializeUser((user: any, done: any) => {
      done(undefined, user);
    });
};

export default mockPassportConfiguration;
