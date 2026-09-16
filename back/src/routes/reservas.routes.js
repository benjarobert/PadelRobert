const { Router } = require("express");
const router = Router();
const { getAll, crear, registrarPago } = require("../controllers/reservas.controller");

router.get("/", getAll);
router.post("/", crear);
router.put("/:id/pago", registrarPago);

module.exports = router;
