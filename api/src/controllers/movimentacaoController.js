const prisma = require("../config/prisma");

async function registrar(req, res) {
  try {
    const id_disco = Number(req.body.id_disco);
    const quantidade = Number(req.body.quantidade);
    const tipo = req.body.tipo_movimentacao;
    const observacao = String(req.body.observacao || "").trim();
    const id_usuario = req.usuario.id_usuario; // vem do token, nunca do corpo da requisição

    if (!Number.isInteger(id_disco) || id_disco <= 0) {
      return res.status(400).json({ mensagem: "Selecione um disco." });
    }
    if (tipo !== "entrada" && tipo !== "saida") {
      return res.status(400).json({ mensagem: "Tipo de movimentação inválido. Use entrada ou saida." });
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0) {
      return res.status(400).json({ mensagem: "A quantidade deve ser um número inteiro maior que zero." });
    }
    if (observacao.length > 250) {
      return res.status(400).json({ mensagem: "A observação pode ter no máximo 250 caracteres." });
    }

    // Data no formato AAAA-MM-DD. Se não vier, usa a data de hoje.
    const texto = req.body.data_movimentacao || new Date().toISOString().slice(0, 10);
    const data_movimentacao = new Date(texto + "T00:00:00.000Z");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto) || Number.isNaN(data_movimentacao.getTime())) {
      return res.status(400).json({ mensagem: "Data inválida. Use o formato AAAA-MM-DD." });
    }

    // Tudo dentro da transação: se qualquer passo falhar, nada é salvo.
    const resultado = await prisma.$transaction(async (tx) => {
      const disco = await tx.disco.findUnique({ where: { id_disco } });
      if (!disco) {
        throw new Error("DISCO_NAO_ENCONTRADO");
      }

      if (tipo === "entrada") {
        await tx.disco.update({
          where: { id_disco },
          data: { quantidade_estoque: { increment: quantidade } },
        });
      } else {
        // Só diminui se ainda houver estoque suficiente (evita estoque negativo).
        const atualizados = await tx.disco.updateMany({
          where: { id_disco, quantidade_estoque: { gte: quantidade } },
          data: { quantidade_estoque: { decrement: quantidade } },
        });
        if (atualizados.count === 0) {
          throw new Error("ESTOQUE_INSUFICIENTE");
        }
      }

      const movimentacao = await tx.movimentacaoEstoque.create({
        data: { id_disco, id_usuario, tipo_movimentacao: tipo, quantidade, data_movimentacao, observacao },
      });
      const discoAtualizado = await tx.disco.findUnique({ where: { id_disco } });

      return { movimentacao, discoAtualizado };
    });

    const { movimentacao, discoAtualizado } = resultado;

    // Alerta só vale para saídas (RF007): o estoque ficou abaixo do mínimo?
    const estoqueBaixo =
      tipo === "saida" && discoAtualizado.quantidade_estoque < discoAtualizado.estoque_minimo;

    res.status(201).json({
      mensagem: estoqueBaixo
        ? `Movimentação registrada. ATENÇÃO: o estoque de "${discoAtualizado.titulo}" está abaixo do mínimo.`
        : "Movimentação registrada com sucesso.",
      estoque_baixo: estoqueBaixo,
      movimentacao: {
        id_movimentacao: movimentacao.id_movimentacao,
        id_disco: movimentacao.id_disco,
        id_usuario: movimentacao.id_usuario,
        tipo_movimentacao: movimentacao.tipo_movimentacao,
        quantidade: movimentacao.quantidade,
        data_movimentacao: movimentacao.data_movimentacao.toISOString().slice(0, 10),
        observacao: movimentacao.observacao,
      },
      disco: {
        id_disco: discoAtualizado.id_disco,
        titulo: discoAtualizado.titulo,
        quantidade_estoque: discoAtualizado.quantidade_estoque,
        estoque_minimo: discoAtualizado.estoque_minimo,
      },
    });
  } catch (erro) {
    if (erro.message === "DISCO_NAO_ENCONTRADO") {
      return res.status(404).json({ mensagem: "Disco não encontrado." });
    }
    if (erro.message === "ESTOQUE_INSUFICIENTE") {
      return res.status(400).json({ mensagem: "Estoque insuficiente para esta venda." });
    }
    console.error(erro);
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
}

async function historico(req, res) {
  try {
    const lista = await prisma.movimentacaoEstoque.findMany({
      include: { disco: true, usuario: true },
      orderBy: { id_movimentacao: "desc" },
    });

    res.json(
      lista.map((m) => ({
        id_movimentacao: m.id_movimentacao,
        disco: m.disco.titulo,
        artista: m.disco.artista,
        usuario: m.usuario.nome,
        tipo_movimentacao: m.tipo_movimentacao,
        quantidade: m.quantidade,
        data_movimentacao: m.data_movimentacao.toISOString().slice(0, 10),
        observacao: m.observacao,
      }))
    );
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ mensagem: "Erro interno do servidor." });
  }
}

module.exports = { registrar, historico };
