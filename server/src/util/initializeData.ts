import Faculty from "../models/Faculty";
import AcademicYear from "../models/AcademicYear";
import config from "config";
import fs from "fs";
import path from "path";

const initializeData = async function (): Promise<void> {
  // Faculties
  await new Faculty("ABE", "Architecture and the Built Environment").save();
  await new Faculty("CEG", "Civil Engineering and Geosciences").save();
  await new Faculty(
    "EEMCS",
    "Electrical Engineering, Mathematics & Computer Science"
  ).save();
  await new Faculty("IDE", "Industrial Design Engineering").save();
  await new Faculty("AE", "Aerospace Engineering").save();
  await new Faculty("TPM", "Technology, Policy and Management").save();
  await new Faculty("AS", "Applied Sciences").save();
  await new Faculty(
    "3mE",
    "Mechanical, Maritime and Materials Engineering"
  ).save();

  // Academic Years
  await new AcademicYear("2017/2018", false).save();
  await new AcademicYear("2018/2019", false).save();
  await new AcademicYear("2019/2020", true).save();
  await new AcademicYear("2020/2021", true).save();
  console.log("Initialized Faculties and Academic Years");

  // file folder
  const uploadFolder = path.resolve(config.get("uploadFolder") as string);
  await fs.promises.mkdir(uploadFolder, { recursive: true });
  console.log("Created upload folder");

  return;
};

export default initializeData;
