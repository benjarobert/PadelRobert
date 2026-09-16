const { Router } = require("express");
const router = Router();
const { getRecaudacion } = require("../controllers/reportes.controller");

router.get("/recaudacion", getRecaudacion);

module.exports = router;
