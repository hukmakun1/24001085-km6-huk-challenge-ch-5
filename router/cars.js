const express = require("express");
const router = express.Router();

const carController = require("../controller/cars");

router.route("/").get(carController.getCars).post(carController.createCar);

router
  .route("/:id")
  .get(carController.getCar)
  .put(carController.updateCar)
  .delete(carController.deleteCar);
module.exports = router;
