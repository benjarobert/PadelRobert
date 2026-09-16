const { Router } = require("express");
const router = Router();
const { getAll } = require("../controllers/canchas.controller");

router.get("/", getAll);

module.exports = router;
