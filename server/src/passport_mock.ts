// Mock the login of an user for development purposes
import MockStrategy from "passport-mock-strategy";
import ParseNetId from "./parseNetId";

const mockPassportConfiguration = function(passport: any, netid: string, affiliation: string) {
  const userobject: any = {
    netid: ParseNetId.parseNetId(netid),
    studentNumber: 1234567,
    firstName: "First",
    prefix: "and",
    lastName: "Last",
    email: "mail@mail.com",
    affiliation: affiliation,
    displayName: netid,
    nameID: "nameID",
    nameIDFormat: "nameIDFormat"
  };

  const strategy = new MockStrategy({
    name: "mock",
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
