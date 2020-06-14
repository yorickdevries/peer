import { OrganisationUnit } from "../models/OrganisationUnit";

const parseAndSaveOrganisationUnits = async function (
  input: string | string[] | undefined
): Promise<OrganisationUnit[]> {
  const organisationUnits = [];
  if (input !== undefined) {
    // skip if undefined
    if (typeof input === "string") {
      // one element array in case the input is just a string
      const organisationUnit = new OrganisationUnit(input);
      organisationUnits.push(organisationUnit);
    } else {
      // otherwise, parse all strings to OrganisationUnits
      for (const name of input) {
        const organisationUnit = new OrganisationUnit(name);
        organisationUnits.push(organisationUnit);
      }
    }
  }
  // save all the organisationUnits to the database
  for (const organisationUnit of organisationUnits) {
    // TODO: add validation
    await organisationUnit.save();
  }
  return organisationUnits;
};

export default parseAndSaveOrganisationUnits;
