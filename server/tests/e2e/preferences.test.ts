import http from "http";
import request from "supertest";
import app from "../../src/app";
import HttpStatusCode from "../../src/enum/HttpStatusCode";
import mockLoginCookie from "../helpers/mockLoginCookie";
import initializeData from "../../src/util/initializeData";
import User from "../../src/models/User";
import { dataSource } from "../../src/databaseConnection";

describe("Preferences", () => {
  let server: http.Server;
  let user: User;

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

  test("disable settings", async () => {
    const sessionCookie = await mockLoginCookie(server, "user123");

    user = await User.findOneByOrFail({ netid: "user123" });
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

    user = await User.findOneByOrFail({ netid: "user123" });
    expect(user.preferences).toMatchObject({
      stRemLateSubmission: false,
      stRemStageNotSubmitted: false,
    });
  });
});
