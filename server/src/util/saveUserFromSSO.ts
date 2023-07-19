import parseNetID from "./parseNetID";
import {
  parseAndSaveAffiliation,
  parseAndSaveOrganisationUnit,
  parseAndSaveStudy,
} from "./parseAndSaveSSOFields";
import User from "../models/User";

// This route checks the user and updates it in the database
const saveUserFromSSO = async function (
  netid: string,
  studentNumber?: string,
  firstName?: string,
  prefix?: string,
  lastName?: string,
  email?: string,
  displayName?: string,
  affiliation?: string | string[],
  study?: string | string[],
  organisationUnit?: string | string[]
): Promise<string | undefined> {
  try {
    // Try to save the user to database
    const user = new User().init({
      netid: parseNetID(netid),
      affiliation: await parseAndSaveAffiliation(affiliation),
      study: await parseAndSaveStudy(study),
      organisationUnit: await parseAndSaveOrganisationUnit(organisationUnit),
      studentNumber: studentNumber ? parseInt(studentNumber) : null,
      firstName: firstName ? firstName : null,
      prefix: prefix ? prefix : null,
      lastName: lastName ? lastName : null,
      email: email ? email : null,
      displayName: displayName ? displayName : null,
    });
    // Overwrites existing entry with the same NetID if present
    // might throw an error if the object is not valid
    await user.save();
    return user.netid;
  } catch (error) {
    console.error("Problem while saving user: ", error);
    // Alternatively, try to just save the NetID to the database
    try {
      const parsedNetid = parseNetID(netid);
      // save the user to the database with only the netid
      const user = await new User().init({ netid: parsedNetid }).save();
      console.error(`Saved with only NetID: ${user}`);
      return user.netid;
    } catch (error2) {
      console.error(`Cannot save: ${netid}, Error: ${error2}`);
      return undefined;
    }
  }
};

export default saveUserFromSSO;
