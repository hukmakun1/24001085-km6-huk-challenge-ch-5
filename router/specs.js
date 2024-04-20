const express = require("express");
const router = express.Router();

const specController = require("../controller/specs");

const { authMiddleware } = require("../middleware/auth");

router
  .route("/")
  .get(authMiddleware(["user", "admin"]), specController.getSpecs)
  .post(authMiddleware(["admin"]), specController.createSpec);

router
  .route("/:id")
  .get(authMiddleware(["user", "admin"]), specController.getSpec)
  .put(authMiddleware(["admin"]), specController.updateSpec)
  .delete(authMiddleware(["admin"]), specController.deleteSpec);

module.exports = router;
