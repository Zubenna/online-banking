const { setupDB } = require("../helper/test_setup");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const app = require("../app");
const supertest = require("supertest");
const request = supertest(app);

setupDB;

describe("Testing Transaction model", () => {
    describe("POST User transactions", () => {
        test("Successful deposit should respond with status code 200", async () => {
            const user1 = await request.post("/api/bank/createUser").send({
                email: "testing2@gmail.com",
                first_name: "Joseph",
                last_name: "Oko",
                middle_name: "M",
                username: "username2",
                password: "passwordtwo",
                phone_number: "09087764543",
                address: "20 brown drive Lagos",
            });
            let res_1 = await request.post("/api/transaction/action").send({
                acc_number: "09087764543",
                amount: 500,
                description: "Testing deposit",
                comment: "It is good to test",
                trans_type: "deposit",
            });
            const trans_1 = await Transaction.findOne({ acc_number: "09087764543" });
            const user_1 = await User.findOne({ phone_number: "09087764543" });
            expect(res_1.status).toBe(200);
            expect(trans_1.acc_number).toBeTruthy();
            expect(user_1.balance).toBe(500);
            expect(trans_1.description).toBe("Testing deposit");
            expect(trans_1.trans_type).toBe("deposit");
        });
        test("Successful withdrawal should respond with status code 200", async () => {
            let res_2 = await request.post("/api/transaction/action").send({
                acc_number: "09087764543",
                amount: 200,
                description: "Testing withdrawal",
                comment: "It is good to test",
                trans_type: "withdraw",
            });
            expect(res_2.status).toBe(200);
        });

        test("Should respond with status code 400 for unsucessful withdrawal", async () => {
            let res_3 = await request.post("/api/transaction/action").send({
                acc_number: "09087764543",
                amount: 600,
                description: "Testing withdrawal",
                comment: "It is good to test",
                trans_type: "withdraw",
            });
            expect(res_3.status).toBe(400);
        });
        test("Should respond with status code 200 for sucessful balance check", async () => {
            let res = await request.post("/api/transaction/balance").send({
                acc_number: "09087764543",
            });
            expect(res.status).toBe(200);
        });
        test("Should respond with status code 200 for sucessful transfer", async () => {
            let res = await request.post("/api/transaction/transfer").send({
                send_acc: "09087764543",
                rec_acc: "09087764588",
                amount: 40,
                description: "Testing transfer",
                comment: "Nice experience",
            });
            expect(res.status).toBe(200);
        });
    });
})
