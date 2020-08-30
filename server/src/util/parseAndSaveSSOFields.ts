import { getManager } from "typeorm";
import Affiliation from "../models/Affiliation";
import Study from "../models/Study";
import OrganisationUnit from "../models/OrganisationUnit";

// Quite some duplication here, but I don't know how to make it shorter in a good way

const parseAndSaveAffiliation = async function (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  input: any
): Promise<Affiliation[]> {
  const ssoFields: Affiliation[] = [];
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
      try {
        // skip if not a string or empty string
        if (typeof name !== "string" || !name) {
          throw new Error(`Invalid name: ${name}`);
        }
        let ssoField = await Affiliation.findOne({ where: { name: name } });
        if (!ssoField) {
          await getManager().transaction(
            "SERIALIZABLE",
            async (transactionalEntityManager) => {
              // fetch existing answer if present
              ssoField = await transactionalEntityManager.findOne(Affiliation, {
                where: { name: name },
              });
              if (!ssoField) {
                ssoField = new Affiliation(name);
                await transactionalEntityManager.save(ssoField);
              }
            }
          );
        }
        // should be defined now as its made in transaction
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ssoFields.push(ssoField!);
      } catch (error) {
        // Log error and skip SSOField
        console.error("SSOField save failed: ", error);
      }
    }
  }
  return ssoFields;
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
const parseAndSaveStudy = async function (input: any): Promise<Study[]> {
  const ssoFields: Study[] = [];
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
      try {
        // skip if not a string or empty string
        if (typeof name !== "string" || !name) {
          throw new Error(`Invalid name: ${name}`);
        }
        let ssoField = await Study.findOne({ where: { name: name } });
        if (!ssoField) {
          await getManager().transaction(
            "SERIALIZABLE",
            async (transactionalEntityManager) => {
              // fetch existing answer if present
              ssoField = await transactionalEntityManager.findOne(Study, {
                where: { name: name },
              });
              if (!ssoField) {
                ssoField = new Study(name);
                await transactionalEntityManager.save(ssoField);
              }
            }
          );
        }
        // should be defined now as its made in transaction
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ssoFields.push(ssoField!);
      } catch (error) {
        // Log error and skip SSOField
        console.error("SSOField save failed: ", error);
      }
    }
  }
  return ssoFields;
};

const parseAndSaveOrganisationUnit = async function (
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
  input: any
): Promise<OrganisationUnit[]> {
  const ssoFields: OrganisationUnit[] = [];
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
      try {
        // skip if not a string or empty string
        if (typeof name !== "string" || !name) {
          throw new Error(`Invalid name: ${name}`);
        }
        let ssoField = await OrganisationUnit.findOne({
          where: { name: name },
        });
        if (!ssoField) {
          await getManager().transaction(
            "SERIALIZABLE",
            async (transactionalEntityManager) => {
              // fetch existing answer if present
              ssoField = await transactionalEntityManager.findOne(
                OrganisationUnit,
                {
                  where: { name: name },
                }
              );
              if (!ssoField) {
                ssoField = new OrganisationUnit(name);
                await transactionalEntityManager.save(ssoField);
              }
            }
          );
        }
        // should be defined now as its made in transaction
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        ssoFields.push(ssoField!);
      } catch (error) {
        // Log error and skip SSOField
        console.error("SSOField save failed: ", error);
      }
    }
  }
  return ssoFields;
};

export {
  parseAndSaveAffiliation,
  parseAndSaveStudy,
  parseAndSaveOrganisationUnit,
};
