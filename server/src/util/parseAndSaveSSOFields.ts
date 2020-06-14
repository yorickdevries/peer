import { SSOField } from "../models/SSOField";

const parseAndSaveSSOFields = async function <T extends SSOField>(
  input: string | string[] | undefined,
  constructor: new (_: string) => T
): Promise<T[]> {
  const ssoFields: T[] = [];
  if (input !== undefined) {
    // skip if undefined
    if (typeof input === "string") {
      // one element array in case the input is just a string
      const ssoField = new constructor(input);
      ssoFields.push(ssoField);
    } else {
      // otherwise, parse all strings to ssoFields
      for (const name of input) {
        const ssoField = new constructor(name);
        ssoFields.push(ssoField);
      }
    }
  }
  // save all the ssoFields to the database
  for (const ssoField of ssoFields) {
    // TODO: add validation
    await ssoField.save();
  }
  return ssoFields;
};

export default parseAndSaveSSOFields;
