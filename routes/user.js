const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { SaveRedirectedUrl } = require("../middleware.js");

// SignUp page
router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post(
  "/signup",
  wrapAsync(async (req, res) => {
    try {
      let { username, email, password } = req.body;
      const newUser = new User({ email, username });
      const RegisteredUser = await User.register(newUser, password);
      console.log(RegisteredUser);
      req.login(RegisteredUser, (err) => {
        if (err) {
          return next(err);
        } else {
          req.flash("success", "you are logged in successfully..");
          res.redirect("/listings");
        }
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/signup");
    }
  })
);

// Login Page
router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post(
  "/login",
  SaveRedirectedUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  async (req, res) => {
    req.flash("success", "Welcome to wanderlust you are logged in");
    const redirectUrl = res.locals.returnTo || "/listings" 
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res, next) => {
  console.log("Logoutted");

  req.logout((err) => {
    if (err) {
      return next(err);
    } else {
      req.flash("success", "you are logged out successfully..");
      res.redirect("/listings");
    }
  });
});
module.exports = router;
