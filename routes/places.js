const express = require("express");
const router = express.Router();
const controller = require("../controllers/placesController");

router.get("/nearby", controller.getNearbyPlaces);

module.exports = router;