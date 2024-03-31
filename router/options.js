const express = require("express");
const router = express.Router();

const optionController = require("../controller/options");

router
  .route("/")
  .get(optionController.getOptions)
  .post(optionController.createOption);

router
  .route("/:id")
  .get(optionController.getOption)
  .put(optionController.updateOption)
  .delete(optionController.deleteOption);

module.exports = router;
