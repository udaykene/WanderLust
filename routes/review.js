const express = require("express");
const router = express.Router({mergeParams:true});
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const WrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn,isReviewAuthor,validateReview} = require("../middleware.js");

// Reviews  
router.post(
  "/",
  isLoggedIn,
  validateReview,
  WrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","Review Added");
    res.redirect(`/listings/${listing._id}`);
  })
);

// Delete reviews route
router.delete(
  "/:reviewID",
  isLoggedIn,
  isReviewAuthor,
  WrapAsync(async (req, res) => {
    let { id, reviewID } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
    await Review.findByIdAndDelete(reviewID);
    req.flash("success","Review Deleted");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;