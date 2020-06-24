import parseNetID from "./parseNetID";
import parseAndSaveSSOFields from "./parseAndSaveSSOFields";
import User from "../models/User";
import Affiliation from "../models/Affiliation";
import Study from "../models/Study";
import OrganisationUnit from "../models/OrganisationUnit";

// This route checks the user and updates it in the database
const saveUserFromSSO = async function (
  netid: string,
  studentNumber?: number,
  firstName?: string,
  prefix?: string,
  lastName?: string,
  email?: string,
  displayName?: string,
  affiliation?: string | string[],
  study?: string | string[],
  organisationUnit?: string | string[]
): Promise<User | undefined> {
  try {
    // Try to save the user to database
    const user = new User(
      parseNetID(netid),
      studentNumber ? studentNumber : null,
      firstName ? firstName : null,
      prefix ? prefix : null,
      lastName ? lastName : null,
      email ? email : null,
      displayName ? displayName : null,
      await parseAndSaveSSOFields(affiliation, Affiliation),
      await parseAndSaveSSOFields(study, Study),
      await parseAndSaveSSOFields(organisationUnit, OrganisationUnit)
    );
    // Overwrites existing entry with the same NetID if present
    // might throw an error if the object is not valid
    await user.save();
    return user;
  } catch (error) {
    console.error("Problem while saving user: ", error);
    // Alternatively, try to just save the NetID to the database
    try {
      const parsedNetid = parseNetID(netid);
      // save the user to the database with only the netid
      await new User(parsedNetid).save();
      // get the user from the database
      const user = await User.findOneOrFail(parsedNetid, {
        relations: ["affiliation", "study", "organisationUnit"],
      });
      console.error(`Saved with only NetID: ${user}`);
      return user;
    } catch (error2) {
      console.error(`Cannot save: ${netid}, Error: ${error2}`);
      return undefined;
    }
  }
};

export default saveUserFromSSO;
