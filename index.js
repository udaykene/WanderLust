require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const MONGO_URL = process.env.MONGO_URL;
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require("./models/user.js");
const PORT = process.env.PORT || 3000;
const ExpressError = require("./utils/ExpressError.js");
const ListingsRouter = require("./routes/listing.js");
const ReviewsRouter = require("./routes/review.js");
const UsersRouter = require("./routes/user.js");


const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

async function main() {
  await mongoose.connect(MONGO_URL);
}

main()
  .then((req, res) => {
    console.log("This is main route");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());
app.engine("ejs", ejsMate);
app.use(session(sessionOptions));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Root
app.get("/", (req, res) => {
  res.send("This is root");
});

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.CurrentUser = req.user;
  next()
});


// app.get("/demouser", async(req,res) => {
//   let fakeUser = User({
//     email:"student@gmail.com",
//     username:"udaykene",
//   });

//   let RegisteredUser = await User.register(fakeUser,"helloworld");
//   res.send(RegisteredUser);
// })


app.use("/listings", ListingsRouter);
app.use("/listings/:id/reviews", ReviewsRouter);
app.use("/",UsersRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something Went Wrong!";
  res.status(statusCode).render("error.ejs", { err });
});

// Listen



app.listen(PORT, "0.0.0.0", () => {
  console.log("Listening to port 3000");
});
