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
      // save the ssoField to the database
      try {
        await ssoField.save();
        ssoFields.push(ssoField);
      } catch (error) {
        // Log error and skip SSOField
        console.error("SSOField save failed: ", error);
      }
    }
  }
  return ssoFields;
};

export default parseAndSaveSSOFields;
