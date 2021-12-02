const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const auth = require("../middleware/checkAuth");
const multer = require("multer");

// Profile picture upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
    // cb(null, file.filename + "_" + Date.now() + "_" + file.originalname);
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({
  storage: storage,
  fileFilter: filefilter,
}).single("image");

router.post("/createUser", upload, async (req, res) => {
  try {
    let {
      first_name,
      last_name,
      middle_name,
      email,
      username,
      address,
      password,
      phone_number,
    } = req.body;

    const image = req.file.filename;

    let myRegex = /^[0-9]{11}$/;
    if (!phone_number.match(myRegex)) {
      res.status(400).send({ msg: "Phone number must be 11 digits only" });
      return;
    }

    if (
      !(
        first_name &&
        last_name &&
        email &&
        username &&
        address &&
        password &&
        phone_number &&
        image
      )
    ) {
      res.status(400).send({ msg: "Required fields must not be empty" });
      return;
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).send({ msg: "Email already exist" });
      return;
    }
    const existingUname = await User.findOne({ username });
    if (existingUname) {
      res.status(400).send({ msg: "Username already exist" });
      return;
    }
    const nameLength = username.length;
    if (!(nameLength > 7 && nameLength < 16)) {
      res.status(400).send({ msg: "Username must be in the range 8 - 15 characters" });
      return;
    }
    const existingNumber = await User.findOne({ phone_number });
    if (existingNumber) {
      res.status(400).send({ msg: "Phone Number already exist" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);

    const user = await User.create({
      first_name,
      middle_name,
      last_name,
      email,
      address,
      username,
      password,
      phone_number,
      image,
    });

    //  Create token
    const token = jwt.sign(
      { user_id: user._id, username },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "2h",
      }
    );

    // save user token
    user.token = token;
    res.redirect('/api/bank');
    
  } catch (err) {
    res.status(500).json({
      msg: "An error occured",
    });
  }
});

router.post("/loginUser", async (req, res) => {
  try {
    // Get user input
    let { username, password } = req.body;

    // Validate user input
    if (!(username && password)) {
      return res.status(400).send({ msg: "All required fields must be filled" });
    }

    // Validate if user exist in our database
    const user = await User.findOne({ username });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { user_id: user._id, username },
        process.env.TOKEN_SECRET,
        {
          expiresIn: "2h",
        }
      );
      // save user token
      user.token = token;
      return res.render('pages/home', {
        data: user
      });
    }
    return res.status(400).send({ msg: "Invalid Credentials" });
  } catch (err) {
    res.send({
      msg: "There is error logging in"
    });
  }
});

router.get("/logoutUser", (req, res) => {
  const authHeader = req.headers["authorization"];
  jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
    if (logout) {
      res.redirect('/api/bank');
    } else {
      res.send({ msg: "Error logging out" });
    }
  });
});

router.get("/listAll", async (req, res) => {
  try {
    const users = await User.find({});
    if (!users) {
      res.status(400).send({ msg: "Database is empty" });
      return;
    }
    res.status(200).send({ data: users });
  } catch (err) {
    res.status(200).send({ msg: "Error occured" });
  }
});

router.post("/singleFileUpload", async (req, res, next) => {
  try {
    const file = req.file;
    res.status(201).send({ msg: "File Upload Successfully" });
  } catch (error) {
    res.status(400).send({ msg: "Error occured" });
  }
});

router.get("/", (req, res) => {
  res.render('pages/cover');
});

router.get("/register", (req, res) => {
  res.render("pages/register");
});

router.get("/login", (req, res) => {
  res.render("pages/login");
});

router.get("/index", (req, res) => {
  res.render("pages/home");
});

router.get("/action", (req, res) => {
  res.render("pages/action");
});

router.get("/balance", (req, res) => {
  res.render("pages/balance");
});

router.get("/transfer", (req, res) => {
  res.render("pages/transfer");
});

router.get("/trans-details", (req, res) => {
  res.render("pages/trans-details");
});

module.exports = router;
