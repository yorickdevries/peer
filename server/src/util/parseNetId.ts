/**
 * Class which takes care of NetId parsing
 */
const parseNetId = function (netId: string): string {
  if (netId == undefined) {
    throw new Error("NetId is undefined");
  }
  // in case the student doesnt have a Username field
  if (netId == "") {
    throw new Error("NetId is an empty string");
  }
  const parsedNetId = netId.split("@")[0].toLowerCase();
  if (!/^[a-z0-9]+$/.test(parsedNetId)) {
    throw new Error("NetId contains an invalid character: " + parsedNetId);
  }
  return parsedNetId;
};

export default parseNetId;
