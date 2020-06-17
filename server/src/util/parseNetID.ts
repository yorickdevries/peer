// Class which takes care of NetID parsing
const parseNetID = function (netid: string): string {
  // extra check in case SSO sends something weird
  if (typeof netid !== "string") {
    throw new Error("NetID isn't a string");
  }
  // in case the student doesnt have a Username field
  if (netid == "") {
    throw new Error("NetID is an empty string");
  }
  const parsedNetid = netid.split("@")[0].toLowerCase();
  if (!/^[a-z0-9]+$/.test(parsedNetid)) {
    throw new Error("NetID contains an invalid character: " + parsedNetid);
  }
  return parsedNetid;
};

export default parseNetID;
