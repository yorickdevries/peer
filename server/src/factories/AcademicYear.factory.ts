import AcademicYear from "../models/AcademicYear";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";

const yearList: [string, boolean][] = [
  ["2017/2018", false],
  ["2018/2019", false],
  ["2019/2020", true],
  ["2020/2021", true],
];
const listLength = yearList.length;

async function createDefaultAcademicYears(): Promise<AcademicYear[]> {
  const years = await new AcademicYearFactory().makeMany(listLength);

  years.map(async (year: AcademicYear) => {
    const tempYear = yearList.pop();
    if (tempYear) {
      year.name = tempYear[0];
      year.active = tempYear[1];
    }
    return year;
  });

  return await AcademicYear.save(years);
}

export { createDefaultAcademicYears };

export class AcademicYearFactory extends Factory<AcademicYear> {
  protected entity = AcademicYear;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<AcademicYear> {
    return new AcademicYear().init({ name: "name", active: false });
  }
}
