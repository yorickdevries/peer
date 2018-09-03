import MockStrategy from "passport-mock-strategy";

const mockPassportConfiguration = function(passport: any, name: string, userFunction: string) {
  const userobject: any = {
    netid: name,
    studentNumber: 1234567,
    firstName: "givenName",
    prefix: "tudPrefix",
    lastName: "sn",
    email: "mail",
    function: userFunction,
    displayName: name,
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
