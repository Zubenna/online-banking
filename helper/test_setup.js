const mongoose = require("mongoose");
beforeAll((done) => {
  mongoose.connect("mongodb://localhost:27017/BankDB",
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => done());
});

afterAll((done) => {
  mongoose.connection.db.dropDatabase(() => {
    mongoose.connection.close(() => done())
  });
});
