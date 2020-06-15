import { validate } from "class-validator";
import { SSOField } from "../models/SSOField";

const parseAndSaveSSOFields = async function <T extends SSOField>(
  input: string | string[] | undefined,
  constructor: new (_: string) => T
): Promise<T[]> {
  const ssoFields: T[] = [];
  // skip if undefined
  if (input !== undefined) {
    // inputNames array
    let inputNames: string[];
    if (typeof input === "string") {
      inputNames = [input];
    } else {
      inputNames = input;
    }
    // Parse all strings to ssoFields
    for (const name of inputNames) {
      const ssoField = new constructor(name);
      validate(ssoField).then((errors) => {
        if (errors.length > 0) {
          // Log error and skip SSOField
          console.error("SSOField validation failed: ", errors);
        } else {
          ssoFields.push(ssoField);
        }
      });
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
