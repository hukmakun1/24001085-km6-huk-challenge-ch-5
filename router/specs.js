const express = require("express");
const router = express.Router();

const specController = require("../controller/specs");

router.route("/").get(specController.getSpecs).post(specController.createSpec);

router
  .route("/:id")
  .get(specController.getSpec)
  .put(specController.updateSpec)
  .delete(specController.deleteSpec);

module.exports = router;
