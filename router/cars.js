const express = require("express");
const router = express.Router();
const carController = require("../controller/cars");
const { authMiddleware } = require("../middleware/auth");

router
  .route("/")
  .get(authMiddleware(["user", "admin"]), carController.getCars)
  .post(authMiddleware(["admin"]), carController.createCar);

router
  .route("/:id")
  .get(authMiddleware(["user", "admin"]), carController.getCar)
  .put(authMiddleware(["admin"]), carController.updateCar)
  .delete(authMiddleware(["admin"]), carController.deleteCar);
module.exports = router;
