const express = require("express");
const discoController = require("../controllers/discoController");

const router = express.Router();

router.get("/", discoController.listar); // GET /api/discos?busca=termo (já em ordem alfabética)
router.post("/", discoController.criar);
router.put("/:id", discoController.atualizar);
router.delete("/:id", discoController.excluir);

module.exports = router;
