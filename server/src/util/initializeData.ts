import Faculty from "../models/Faculty";
import AcademicYear from "../models/AcademicYear";
import config from "config";
import fs from "fs";
import path from "path";

const initializeData = async function (): Promise<void> {
  if (!["development", "test", undefined].includes(process.env.NODE_ENV)) {
    throw new Error(`NODE_ENV is set to ${process.env.NODE_ENV}`);
  }

  const faculties: [string, string][] = [
    ["ABE", "Architecture and the Built Environment"],
    ["CEG", "Civil Engineering and Geosciences"],
    ["EEMCS", "Electrical Engineering, Mathematics & Computer Science"],
    ["IDE", "Industrial Design Engineering"],
    ["AE", "Aerospace Engineering"],
    ["TPM", "Technology, Policy and Management"],
    ["AS", "Applied Sciences"],
    ["3mE", "Mechanical, Maritime and Materials Engineering"],
  ];
  for (const faculty of faculties) {
    await new Faculty(faculty[0], faculty[1]).save();
  }

  // Academic Years
  const academicYears: [string, boolean][] = [
    ["2017/2018", false],
    ["2018/2019", false],
    ["2019/2020", true],
    ["2020/2021", true],
  ];
  for (const academicYear of academicYears) {
    await new AcademicYear(academicYear[0], academicYear[1]).save();
  }
  console.log("Initialized Faculties and Academic Years");

  // file folder
  const uploadFolder = path.resolve(config.get("uploadFolder") as string);
  await fs.promises.mkdir(uploadFolder, { recursive: true });
  console.log("Created upload folder");

  return;
};

export default initializeData;
