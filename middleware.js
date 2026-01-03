const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { ListingSchema } = require("./schema.js");
const { ReviewsSchema } = require("./schema.js");


module.exports.isLoggedIn = (req, res, next) => {
  console.log(req);
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    console.log(req.session.returnTo);
    req.flash("error", "you must be logged in first ");
    return res.redirect("/login");
  }
  next();
};

module.exports.SaveRedirectedUrl = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this listing.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewID } = req.params;
  let review = await Review.findById(reviewID);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You are not the author of this review.");
    return res.redirect(`/listings/${id}`);
  }

  next();
};


module.exports.validateListing = (req, res, next) => {
  if (!req.body) {
    return next(
      new ExpressError(
        400,
        "Request body missing. make sure Content-Type is set and body is sent."
      )
    );
  }
  const { error } = ListingSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map((e) => e.message).join(", ");
    console.log("Joi validation failed:", msg);
    return next(new ExpressError(400, msg));
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  if (!req.body) {
    return next(
      new ExpressError(
        400,
        "Request body missing. make sure Content-Type is set and body is sent."
      )
    );
  }
  const { error } = ReviewsSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const msg = error.details.map((e) => e.message).join(", ");
    console.log("Joi validation failed:", msg);
    return next(new ExpressError(400, msg));
  }
  next();
};
