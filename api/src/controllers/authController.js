const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/prisma");

async function login(req, res) {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ sucesso: false, mensagem: "Informe e-mail e senha." });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email: String(email).trim() } });

    // A mesma mensagem para e-mail ou senha errados (não revela qual deles falhou).
    if (!usuario) {
      return res.status(401).json({ sucesso: false, mensagem: "E-mail ou senha incorretos." });
    }

    const senhaCorreta = await bcrypt.compare(String(senha), usuario.senha);
    if (!senhaCorreta) {
      return res.status(401).json({ sucesso: false, mensagem: "E-mail ou senha incorretos." });
    }

    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, nome: usuario.nome },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      sucesso: true,
      mensagem: "Login realizado com sucesso.",
      token,
      usuario: { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email },
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ sucesso: false, mensagem: "Erro interno do servidor." });
  }
}

module.exports = { login };
