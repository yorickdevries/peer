import { OrganisationUnit } from "../models/OrganisationUnit";

const parseAndSaveOrganisationUnits = async function (
  input: string | string[] | undefined
): Promise<OrganisationUnit[]> {
  const organisationUnits = [];
  if (input !== undefined) {
    // skip if undefined
    if (typeof input === "string") {
      // one element array in case the input is just a string
      // TODO: use constructor
      const organisationUnit = new OrganisationUnit();
      organisationUnit.name = input;
      organisationUnits.push(organisationUnit);
    } else {
      // otherwise, parse all strings to OrganisationUnits
      for (const name of input) {
        // TODO: use constructor
        const organisationUnit = new OrganisationUnit();
        organisationUnit.name = name;
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
