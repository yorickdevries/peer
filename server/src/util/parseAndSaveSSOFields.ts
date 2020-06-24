import NamedModel from "../models/NamedModel";

const parseAndSaveSSOFields = async function <T extends NamedModel>(
  input: string | string[] | undefined,
  constructor: new (_: string) => T
): Promise<T[]> {
  const ssoFields: T[] = [];
  // skip if input is undefined
  if (input !== undefined) {
    // inputNames array
    let inputNames;
    if (input instanceof Array) {
      inputNames = input;
    } else {
      inputNames = [input];
    }
    // Parse all strings to ssoFields
    for (const name of inputNames) {
      const ssoField = new constructor(name);
      // validate before saving
      const errors = await ssoField.validate();
      if (errors) {
        // Log error and skip SSOField
        console.error("SSOField validation failed: ", errors);
      } else {
        // save the ssoField to the database
        await ssoField.save();
        ssoFields.push(ssoField);
      }
    }
  }
  return ssoFields;
};

export default parseAndSaveSSOFields;
