require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const verificarToken = require("./src/middlewares/auth");
const authRoutes = require("./src/routes/authRoutes");
const discoRoutes = require("./src/routes/discoRoutes");
const movimentacaoRoutes = require("./src/routes/movimentacaoRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Rota pública (login) e rotas protegidas (precisam de token).
app.use("/api/auth", authRoutes);
app.use("/api/discos", verificarToken, discoRoutes);
app.use("/api/movimentacoes", verificarToken, movimentacaoRoutes);

// Serve o frontend (pasta Web) para abrir em http://localhost:3000/html/login.html
app.use(express.static(path.join(__dirname, "..", "Web")));

const porta = process.env.PORT || 3000;
app.listen(porta, () => {
  console.log(`Servidor rodando em ${porta}`);
});
