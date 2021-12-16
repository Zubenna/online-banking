const express = require("express");
const connectDB = require("./config/db");
const session = require("express-session");
const path = require("path");
const auth = require("./routes/auth");
const trans = require("./routes/transactions");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config(".env");
const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(cors());
app.use(cookieParser());

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: "mycodesecret",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
    next();
});


app.use("/api/bank", auth);
app.use("/api/transaction", trans);
app.use("/css", express.static(path.resolve(__dirname, "public/css")));
app.use("/images", express.static(path.resolve(__dirname, "public/images")));
app.use("/styles", express.static(path.resolve(__dirname, "public/styles")));
app.use("/js", express.static(path.resolve(__dirname, "public/js")));
app.use("/script", express.static(path.resolve(__dirname, "public/script")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.redirect("/api/bank");
});

module.exports = app;
