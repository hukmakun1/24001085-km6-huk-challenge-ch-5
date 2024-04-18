const express = require("express");
const router = express.Router();
const auth = require("./auth");
const cars = require("./cars");
const options = require("./options");
const specs = require("./specs");

router.use("/auth", auth);
router.use("/cars", cars);
router.use("/options", options);
router.use("/specs", specs);

module.exports = router;
