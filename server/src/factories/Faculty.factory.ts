import Faculty from "../models/Faculty";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";

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

async function createDefaultFaculties(): Promise<Faculty[]> {
  const entities = await new FacultyFactory().makeMany(listLength);

  entities.map(async (faculty: Faculty) => {
    const tempFaculty = facultyList.pop();
    if (tempFaculty) {
      faculty.name = tempFaculty[0];
      faculty.longName = tempFaculty[1];
    }
    return faculty;
  });

  return await Faculty.save(entities);
}

export { createDefaultFaculties };

export class FacultyFactory extends Factory<Faculty> {
  protected entity = Faculty;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<Faculty> {
    return new Faculty().init({ name: "name", longName: "longName" });
  }
}
