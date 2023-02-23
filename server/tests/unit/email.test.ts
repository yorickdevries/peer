import { Connection } from "typeorm";
import AcademicYear from "../../src/models/AcademicYear";
import { ConfigureOption, runSeeder, useSeeding } from "typeorm-seeding";
import InitialDatabaseSeed from "../../src/seeds/initial.seed";
import createDatabaseConnection from "../../src/databaseConnection";

describe("Email notifications", () => {
  // will be initialized and closed in beforeAll / afterAll
  let connection: Connection;

  beforeAll(async (done) => {
    // For the in memory test database, the schema is automatically dropped upon connect
    connection = await createDatabaseConnection();

    const options: ConfigureOption = {
      root: "src/../../src",
      configName: "ormconfig.ts",
    };

    await useSeeding(options);

    await runSeeder(InitialDatabaseSeed);
    done();
  });

  afterAll(async () => {
    await connection.close();
  });

  test("t1", async () => {
    // academic year
    const group_submission = await AcademicYear.find();
    expect(academicYears).toBeNull();
  });
});
