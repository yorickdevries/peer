/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import _ from "lodash";

/**
 * This function changes a submission object so that a test that doesn't know about
 * automatic submission flagging can work with it.
 * @param submission The submission object that needs to be patched.
 * @param flag The expected flag status to set for the submission object.
 * @returns A patched submission object.
 */
export default function flagged(submission: any, flag: boolean): any {
  const copy = _.cloneDeep(submission);
  copy.flaggedByServer = flag;
  delete copy.updatedAt;
  return copy;
}
