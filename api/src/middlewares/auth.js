const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const cabecalho = req.headers.authorization || "";
  const [tipo, token] = cabecalho.split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ mensagem: "Acesso negado. Faça login." });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = { id_usuario: dados.id_usuario, nome: dados.nome };
    next();
  } catch (erro) {
    return res.status(401).json({ mensagem: "Sessão inválida ou expirada. Faça login novamente." });
  }
}

module.exports = verificarToken;
