import { Request, Response, NextFunction } from "express";
import { validateSSOUser } from "../../models/SSOUser";
import parseNetID from "../../util/parseNetID";
import parseAndSaveSSOFields from "../../util/parseAndSaveSSOFields";
import { User } from "../../models/User";
import { Affiliation } from "../../models/Affiliation";
import { Study } from "../../models/Study";
import { OrganisationUnit } from "../../models/OrganisationUnit";

// This route checks the user and updates it in the database
const saveUserinfo = async function (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // the userinfo comes from the TU Delft SSO provider, so it needs to be validated
  const userinfo = req.user;
  try {
    if (userinfo === undefined) {
      throw new Error("req.user is undefined");
    }
    // check whether the schema is compliant with what is expected
    const joiError = validateSSOUser(userinfo);
    if (joiError) {
      throw joiError;
    }
    // Try to save the user to database
    const user = new User(
      parseNetID(userinfo.netid),
      userinfo.studentNumber,
      userinfo.firstName,
      userinfo.prefix,
      userinfo.lastName,
      userinfo.email,
      userinfo.displayName,
      await parseAndSaveSSOFields(userinfo.affiliation, Affiliation),
      await parseAndSaveSSOFields(userinfo.study, Study),
      await parseAndSaveSSOFields(userinfo.organisationUnit, OrganisationUnit)
    );
    // Overwrites existing entry with the same NetID if present
    // Does however not delete values if undefined values are passed
    // might throw an error if the object is not valid
    await user.save();
  } catch (error) {
    console.error("Problem while saving user: ", error);
    // Alternatively, try to just save the NetID to the database
    try {
      if (typeof userinfo?.netid !== "string") {
        throw new Error("NetID is not a string");
      }
      const user = new User(parseNetID(userinfo.netid));
      await user.save();
      console.error(`Saved with only NetID: ${userinfo}`);
    } catch (error2) {
      console.error(`Cannot save: ${userinfo}, Error: ${error2}`);
    }
  } finally {
    // call next route anyhow
    next();
  }
};

export default saveUserinfo;
