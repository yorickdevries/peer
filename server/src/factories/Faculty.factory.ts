import { define, factory } from "typeorm-seeding";
import Faculty from "../models/Faculty";

const facultyList: [string, string][] = [
  ["ABE", "Architecture and the Built Environment"],
  ["CEG", "Civil Engineering and Geosciences"],
  ["EEMCS", "Electrical Engineering, Mathematics & Computer Science"],
  ["IDE", "Industrial Design Engineering"],
  ["AE", "Aerospace Engineering"],
  ["TPM", "Technology, Policy and Management"],
  ["AS", "Applied Sciences"],
  ["3mE", "Mechanical, Maritime and Materials Engineering"],
];
const listLength = facultyList.length;

async function createFaculties(): Promise<Faculty[]> {
  return await factory(Faculty)()
    .map(async (faculty: Faculty) => {
      const tempFaculty = facultyList.pop();
      if (tempFaculty) {
        faculty.name = tempFaculty[0];
        faculty.longName = tempFaculty[1];
      }
      return faculty;
    })
    .createMany(listLength);
}

define(Faculty, () => {
  return new Faculty("name", "longName");
});

export { createFaculties };
