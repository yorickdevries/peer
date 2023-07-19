import http from "http";
import request from "supertest";
import app from "../../src/app";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";
import { dataSource } from "../../src/databaseConnection";

describe("Faculties", () => {
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

  test("Get all faculties", async () => {
    const sessionCookie = await mockLoginCookie(server, "user123");
    const res = await request(server)
      .get("/api/faculties")
      .set("cookie", sessionCookie);
    // assertions
    expect(res.status).toBe(HttpStatusCode.OK);
    // are always alphabetically sorted
    expect(JSON.parse(res.text)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "3mE" }),
        expect.objectContaining({ name: "EEMCS" }),
      ])
    );
  });
});
