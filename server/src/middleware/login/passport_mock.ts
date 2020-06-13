// Mock the login of an user for development purposes
import MockStrategy, {
  setupSerializeAndDeserialize,
} from "passport-mock-strategy";
import parseNetId from "../../util/parseNetId";
import { PassportStatic } from "passport";
import { UserModel } from "../../models/user";

const mockPassportConfiguration = function (
  passport: PassportStatic,
  netid: string,
  affiliation: string
): void {
  const userObject: UserModel = {
    netid: parseNetId(netid),
    studentNumber: 1234567,
    firstName: "First",
    prefix: "and",
    lastName: "Last",
    email: "mail@mail.com",
    affiliation: affiliation,
    displayName: netid,
    study: "M Computer Science",
    organisationUnit: [
      "Electrical Engineering, Mathematics and Computer Science",
    ],
  };

  const strategy = new MockStrategy({
    name: "mock",
    user: userObject as any, // Added any as MockStrategy asks for a specific User type
  });
  passport.use(strategy);

  setupSerializeAndDeserialize(passport, undefined, undefined);
};

export default mockPassportConfiguration;
