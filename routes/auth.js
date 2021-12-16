const router = require("express").Router();
const jwt = require("jsonwebtoken");
const generateToken = require("../helper/generateToken");
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
  cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
}).single("image");

router.post("/createUser", upload, async (req, res, next) => {
// Get user details
  try {
    let {
      first_name,
      last_name,
      middle_name,
      email,
      username,
      address,
      password,
      phone_number
    } = req.body;

    // Production
    const image = req.file.filename;

    // Testing
    // const image = "image_1638948692972_Angel-1.jpg";
    
    // Vallidate number of phone digits
    let myRegex = /^[0-9]{11}$/;
    if (!phone_number.match(myRegex)) {
       
      res.status(400).render("pages/register", {
       type: 'danger',
       msg: 'Phone number must be 11 digits only'
     });
      return;
    }
    // Check required fields
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
    // Check dupllicate email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      res.status(400).render("pages/register", {
       type: 'danger',
       msg: 'Email already exist'
     });
      return;
    }
    // Check dupllicate username
    const existingUname = await User.findOne({ username });
    if (existingUname) {
      res.status(400).render("pages/register",
      {
       type: 'danger',
       msg: 'Username already exist'
     });
      return;
    }
     // Check username length
    const nameLength = username.length;
    if (!(nameLength > 7 && nameLength < 16)) {
      res.status(400).render("pages/register", {
       type: 'danger',
       msg: 'Username must be in the range 8 - 15 characters'
     });
      return;
    }
     // Check dupllicate phone number
    const existingNumber = await User.findOne({ phone_number });
    if (existingNumber) {
      res.status(400).render("pages/register", {
       type: 'danger',
       msg: 'Phone Number already exist'
     })
      return;
    }
     // Encrypt password
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    
     // Create user
    const user = await User.create({
      first_name,
      middle_name,
      last_name,
      email,
      address,
      username,
      password,
      phone_number,
      image
    });
    
    // return res.redirect(301, '/api/bank');
    return res.status(200).render("pages/cover", {
       type: 'success',
       msg: 'Registraton Successful. Please login'
    });
    
  } catch (err) {
     res.status(500).render("pages/register", {
       type: 'danger',
       msg: 'Error occurred during registration'
     })
  }
});

router.post("/loginUser", async (req, res) => {
  try {
    // Get user input
    let { username, password } = req.body;

    // Validate user input
    if (!(username && password)) {
      return res.status(400).render('pages/login');
    }

    // Validate if user exist in our database
    const user = await User.findOne({ username });
     
    if (user && (await bcrypt.compare(password, user.password))) {
    
    //  Create token
      const id = user._id;
      await generateToken(res, id, username);

    // Store user details in session
       req.session.user = {
         first_name: user.first_name,
         last_name: user.last_name,
         phone_number: user.phone_number,
         image: user.image
      };

      return res.status(200).render('pages/home', {
        data: req.session.user,
        message: "You are logged in",
        type: 'success'
      });
    }

    return res.status(400).render('pages/login', {
      msg: "Invalid credentials",
      type: 'danger'
    })

  } catch (err) {
    res.render('pages/login', {
      msg: "There is error logging in",
      type: 'danger'
    })
  }
});

router.get("/logoutUser", auth, (req, res, next) => {
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

router.get("/", (req, res) => {
  res.render('pages/cover');
});

router.get("/tohome", (req, res) => {
  res.render('pages/home', {
        data: req.session.user,
  });
});

router.get("/register", (req, res) => {
  res.render("pages/register");
});

router.get("/login", (req, res) => {
  res.render("pages/login");
});

router.get("/action", auth, (req, res) => {
  res.render("pages/action");
});

router.get("/balance", auth, (req, res) => {
  res.render("pages/balance");
});

router.get("/transfer", auth, (req, res) => {
  res.render("pages/transfer");
});

router.get("/trans-details", auth, (req, res) => {
  res.render("pages/trans-details");
});

module.exports = router;
