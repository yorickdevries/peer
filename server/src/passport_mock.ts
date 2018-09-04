// Mock the login of an user for development purposes
import MockStrategy from "passport-mock-strategy";

const mockPassportConfiguration = function(passport: any, netid: string, userFunction: string) {
  const userobject: any = {
    netid: netid.toLowerCase(),
    studentNumber: 1234567,
    firstName: "First",
    prefix: "and",
    lastName: "Last",
    email: "mail@mail.com",
    function: userFunction,
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
