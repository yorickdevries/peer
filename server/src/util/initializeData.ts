import Faculty from "../models/Faculty";
import AcademicYear from "../models/AcademicYear";

const initializeData = async function (): Promise<void> {
  // Faculties
  await new Faculty("ABE").save();
  await new Faculty("CEG").save();
  await new Faculty("EEMCS").save();
  await new Faculty("IDE").save();
  await new Faculty("AE").save();
  await new Faculty("TPM").save();
  await new Faculty("AS").save();
  await new Faculty("3mE").save();

  // Academic Years
  await new AcademicYear("2017/2018", false).save();
  await new AcademicYear("2018/2019", false).save();
  await new AcademicYear("2019/2020", true).save();
  await new AcademicYear("2020/2021", true).save();
  console.log("Initialized Faculties and Academic Years");
  return;
};

export default initializeData;
