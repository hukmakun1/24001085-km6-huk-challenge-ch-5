const express = require("express");
const router = express.Router();

const optionController = require("../controller/options");

const { authMiddleware } = require("../middleware/auth");

router
  .route("/")
  .get(authMiddleware(["user", "admin"]), optionController.getOptions)
  .post(authMiddleware(["admin"]), optionController.createOption);

router
  .route("/:id")
  .get(authMiddleware(["user", "admin"]), optionController.getOption)
  .put(authMiddleware(["admin"]), optionController.updateOption)
  .delete(authMiddleware(["admin"]), optionController.deleteOption);

module.exports = router;
