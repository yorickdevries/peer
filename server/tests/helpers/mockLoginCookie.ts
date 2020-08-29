import request from "supertest";
import http from "http";

// performs a mockLogin and returns the sessioncookie
export default async function mockLoginCookie(
  server: http.Server,
  netid: string,
  affiliation: "student" | "employee" = "employee"
): Promise<string> {
  // perform a mocklogin
  const res = await request(server).post("/api/mocklogin").send({
    netid: netid,
    affiliation: affiliation,
  });
  //return the session cookie
  return res.header["set-cookie"];
}
