import neatCsv from "neat-csv";
import stripBomBuffer from "strip-bom-buf";
import parseNetID from "./parseNetID";
import * as CSV from "csv-string";

interface netidWithGroupName {
  netid: string;
  groupName: string;
}

interface groupNameWithNetidList {
  groupName: string;
  netids: string[];
}

// Enables parsing of Group files in CSV format.
const parseGroupCSV = async function (
  csvFilebuffer: Buffer
): Promise<groupNameWithNetidList[]> {
  // parse the file to rows
  const csvFileString = stripBomBuffer(csvFilebuffer).toString("utf8");
  const studentList = await neatCsv(csvFileString, {
    separator: CSV.detect(csvFileString),
  });

  // check and convert it to netidWithGroupNames
  const netidWithGroupNames = getNetidWithGroupNames(studentList);
  // convert to groupNameWithNetidLists
  const groupNameWithNetidLists =
    getGroupNameWithNetidLists(netidWithGroupNames);
  return groupNameWithNetidLists;
};

const getNetidWithGroupNames = function (studentList: neatCsv.Row[]) {
  // keeps track of all netids so en error is thrown in case of a duplicate
  const allNetids: string[] = [];
  const netidWithGroupNames: netidWithGroupName[] = [];
  for (const studentRow of studentList) {
    // Skip empty rows
    if (isEmptyRow(studentRow)) {
      continue;
    }
    const netid = parseNetID(studentRow["Username"]);
    if (allNetids.includes(netid)) {
      throw new Error(`Duplicate netid: ${netid}`);
    }
    const groupName = studentRow["GroupName"];
    // in case the student doesnt have a groupName field
    if (!groupName) {
      throw netid + " does not have a group";
    }
    allNetids.push(netid);
    netidWithGroupNames.push({ netid: netid, groupName: groupName });
  }
  return netidWithGroupNames;
};

const isEmptyRow = function (studentRow: neatCsv.Row): boolean {
  const studentNumber = studentRow["OrgDefinedId"];
  const netId = studentRow["Username"];
  const lastName = studentRow["LastName"];
  const firstName = studentRow["FirstName"];
  const email = studentRow["Email"];
  return (
    studentNumber === "" &&
    netId === "" &&
    lastName === "" &&
    firstName === "" &&
    email === ""
  );
};

// Maps the groups to the students
const getGroupNameWithNetidLists = function (
  netidWithGroupNames: netidWithGroupName[]
): groupNameWithNetidList[] {
  // initialize result map
  // Map<groupName, netid[]>
  const groupMapping: Map<string, string[]> = new Map<string, string[]>();
  netidWithGroupNames.forEach((netidWithGroupName) => {
    const netid = netidWithGroupName.netid;
    const group = netidWithGroupName.groupName;

    // fill the map
    const netidsForGroup = groupMapping.get(group);
    // In case there is already a list in the map
    if (netidsForGroup !== undefined) {
      netidsForGroup.push(netid);
    } else {
      // initialize list with this netid
      groupMapping.set(group, [netid]);
    }
  });

  // convert the groupMapping to a list
  const groupNameWithNetidLists: groupNameWithNetidList[] = [];
  // Iterate over all groups
  for (const groupName of groupMapping.keys()) {
    const groupNameWithNetidList = {
      groupName: groupName,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      netids: groupMapping.get(groupName)!, // defined as we map over the keys
    };
    groupNameWithNetidLists.push(groupNameWithNetidList);
  }

  return groupNameWithNetidLists;
};

export default parseGroupCSV;
