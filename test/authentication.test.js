const { setupDB } = require("../helper/test_setup");
const User = require("../models/user");
const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);

// Setup a Test Database
setupDB;

describe("Testing User model", () => {
  describe("POST User registration/account creation", () => {
    test("Successful creation should respond with status code 200", async () => {
      const res = await request.post("/api/bank/createUser").send({
        email: "testing@gmail.com",
        first_name: "Joseph",
        last_name: "Oko",
        middle_name: "M",
        username: "username1",
        password: "passwordone",
        phone_number: "09087764543",
        address: "20 brown drive Lagos",
      });
      expect(res.status).toBe(200);
    });
    test("Check if user is saved to the database", async () => {
      const user = await User.findOne({ email: "testing@gmail.com" });
      expect(user.first_name).toBeTruthy();
      expect(user.last_name).toBeTruthy();
      expect(user.username).toBe("USERNAME1");
      expect(user.phone_number).toBe("09087764543");
    });

    test("Registering with existing email should respond with status code 400", async () => {
      const res = await request.post("/api/bank/createUser").send({
        email: "testing@gmail.com",
        first_name: "Joseph",
        last_name: "Oko",
        middle_name: "M",
        username: "username2",
        password: "passwordtwo",
        phone_number: "09087764511",
        address: "20 brown drive Lagos",
      });
      expect(res.status).toBe(400);
    });

    test("Registering with phone number less than 11 digits should respond with status code 400", async () => {
      const res = await request.post("/api/bank/createUser").send({
        email: "testingtwo@gmail.com",
        first_name: "Joseph",
        last_name: "Oko",
        middle_name: "M",
        username: "username2",
        password: "passwordtwo",
        phone_number: "090877645",
        address: "20 brown drive Lagos",
      });
      expect(res.status).toBe(400);
    });
    test("Registering without required fields should respond with status code 400", async () => {
      const res = await request.post("/api/bank/createUser").send({
        email: "",
        first_name: "Joseph",
        last_name: "Oko",
        middle_name: "M",
        username: "",
        password: "passwordtwo",
        phone_number: "98090909765",
        address: "20 brown drive Lagos",
      });
      expect(res.status).toBe(400);
    });
    test("Registering with existing username should respond with status code 400", async () => {
      const res = await request.post("/api/bank/createUser").send({
        email: "testingtwo@gmail.com",
        first_name: "Joseph",
        last_name: "Oko",
        middle_name: "M",
        username: "username1",
        password: "passwordtwo",
        phone_number: "98090909765",
        address: "20 brown drive Lagos",
      });
      expect(res.status).toBe(400);
    });
    test("Registering with username not in the range 8-15 characters should respond with status code 400", async () => {
      const res = await request.post("/api/bank/createUser").send({
        email: "testingtwo@gmail.com",
        first_name: "Joseph",
        last_name: "Oko",
        middle_name: "M",
        username: "usern",
        password: "passwordtwo",
        phone_number: "98090909765",
        address: "20 brown drive Lagos",
      });
      expect(res.status).toBe(400);
    });
    test("Registering with existing phone number should respond with status code 400", async () => {
      const res = await request.post("/api/bank/createUser").send({
        email: "testingtwo@gmail.com",
        first_name: "Joseph",
        last_name: "Oko",
        middle_name: "M",
        username: "username2",
        password: "passwordtwo",
        phone_number: "09087764543",
        address: "20 brown drive Lagos",
      });
      expect(res.status).toBe(400);
    });

    test("Logging in without required field should respond with status code 400", async () => {
      const res = await request.post("/api/bank/loginUser").send({
        username: "username1",
        password: "",
      });
      expect(res.status).toBe(400);
    });

    test("Logging in with wrong password should respond with status code 400", async () => {
      const res = await request.post("/api/bank/loginUser").send({
        username: "username1",
        password: "password",
      });
      expect(res.status).toBe(400);
    });

    test("Successful login should respond with status code 200", async () => {
      const res = await request.post("/api/bank/loginUser").send({
        username: "username1",
        password: "passwordone",
      });
      expect(res.status).toBe(200);
    });
  });
});
