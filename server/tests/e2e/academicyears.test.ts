import http from "http";
import request from "supertest";
import app from "../../src/app";
import AcademicYear from "../../src/models/AcademicYear";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";
import { dataSource } from "../../src/databaseConnection";

describe("Academic Years", () => {
  let server: http.Server;

  beforeAll(async () => {
    await dataSource.initialize();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
  });

  afterAll(async () => {
    server.close();
    await dataSource.destroy();
  });

  test("Get active academic years", async () => {
    const existingAcademicYears = await AcademicYear.find();
    for (const existingAcademicYear of existingAcademicYears) {
      await existingAcademicYear.remove();
    }

    //insert some academic years
    await new AcademicYear().init({ name: "2018/2019", active: false }).save();
    await new AcademicYear().init({ name: "2019/2020", active: true }).save();
    await new AcademicYear().init({ name: "2020/2021", active: true }).save();
    await new AcademicYear().init({ name: "2021/2022", active: false }).save();

    const sessionCookie = await mockLoginCookie(server, "user123");
    const res = await request(server)
      .get("/api/academicyears?active=true")
      .set("cookie", sessionCookie);
    expect(res.status).toBe(HttpStatusCode.OK);
    expect(JSON.parse(res.text)).toMatchObject([
      { name: "2019/2020", active: true },
      { name: "2020/2021", active: true },
    ]);
  });
});
