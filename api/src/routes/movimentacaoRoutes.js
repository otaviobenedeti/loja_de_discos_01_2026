const express = require("express");
const movimentacaoController = require("../controllers/movimentacaoController");

const router = express.Router();

router.post("/", movimentacaoController.registrar);
router.get("/", movimentacaoController.historico);

module.exports = router;
