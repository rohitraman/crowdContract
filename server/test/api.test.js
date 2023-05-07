const request = require("supertest");
const app = require("../index");

let jwtToken; // Variable to store the JWT token

describe("API Test Suite", () => {
  beforeAll(async () => {
    // Perform login API request and obtain the JWT token
    const loginData = {
      name: "Prathviraj B N",
      password: "1234",
    };

    const response = await request(app)
      .post("/api/users/login")
      .send(loginData);
    jwtToken = response.body.jwt;
    expect(response.status).toBe(200);
    expect(jwtToken).toBeDefined();
  });

  test("Another API Using JWT Token", async () => {
    const response = await request(app)
      .get("/api/")
      .set("Authorization", `Bearer ${jwtToken}`);
    expect(response.status).toBe(200);
    expect(response.body.msg).toBe("hello crowdContract user");
  });
});
