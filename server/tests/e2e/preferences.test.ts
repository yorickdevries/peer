import http from "http";
import request from "supertest";
import { Connection } from "typeorm";
import app from "../../src/app";
import createDatabaseConnection from "../../src/databaseConnection";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";
import User from "../../src/models/User";

describe("Preferences", () => {
  let connection: Connection;
  let server: http.Server;
  let user: User;

  beforeAll(async () => {
    connection = await createDatabaseConnection();
    server = http.createServer(app);
    // initialize faculties and academic years
    await initializeData();
  });

  afterAll(async () => {
    server.close();
    await connection.close();
  });

  test("disable settings", async () => {
    const sessionCookie = await mockLoginCookie(server, "user123");

    user = await User.findOneOrFail("user123");
    expect(user.preferences).toMatchObject({
      stRemLateSubmission: true,
      stRemStageNotSubmitted: true,
    });

    const res = await request(server)
      .post("/api/preferences?active=true")
      .send({
        items: [
          {
            name: "stRemStageNotSubmitted",
            value: false,
          },
          {
            name: "stRemLateSubmission",
            value: false,
          },
        ],
      })
      .set("cookie", sessionCookie);
    expect(res.status).toBe(HttpStatusCode.OK);

    user = await User.findOneOrFail("user123");
    expect(user.preferences).toMatchObject({
      stRemLateSubmission: false,
      stRemStageNotSubmitted: false,
    });
  });
});
