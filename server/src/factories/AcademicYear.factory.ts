import { define, factory } from "typeorm-seeding";
import AcademicYear from "../models/AcademicYear";

const yearList: [string, boolean][] = [
  ["2017/2018", false],
  ["2018/2019", false],
  ["2019/2020", true],
  ["2020/2021", true],
];
const listLength = yearList.length;

async function createAcademicYears(): Promise<AcademicYear[]> {
  return await factory(AcademicYear)()
    .map(async (year: AcademicYear) => {
      const tempYear = yearList.pop();
      if (tempYear) {
        year.name = tempYear[0];
        year.active = tempYear[1];
      }
      return year;
    })
    .createMany(listLength);
}

define(AcademicYear, () => {
  return new AcademicYear("name", false);
});

export { createAcademicYears };
