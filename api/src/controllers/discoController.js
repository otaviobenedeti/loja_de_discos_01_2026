const prisma = require("../config/prisma");

// O Prisma devolve Decimal como objeto; aqui convertemos para número comum.
function formatarDisco(disco) {
  return {
    id_disco: disco.id_disco,
    titulo: disco.titulo,
    artista: disco.artista,
    genero: disco.genero,
    preco_custo: Number(disco.preco_custo),
    preco_venda: Number(disco.preco_venda),
    quantidade_estoque: disco.quantidade_estoque,
    estoque_minimo: disco.estoque_minimo,
  };
}

// Deixa o texto em minúsculas e sem acentos para comparar corretamente.
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Ordenação alfabética por título feita "na mão" (Insertion Sort), como pede o RF005.
// Não usa ORDER BY do banco nem .sort().
function ordenarPorTitulo(discos) {
  const lista = [...discos];

  for (let i = 1; i < lista.length; i++) {
    const atual = lista[i];
    let j = i - 1;

    while (j >= 0 && normalizar(lista[j].titulo) > normalizar(atual.titulo)) {
      lista[j + 1] = lista[j];
      j--;
    }
    lista[j + 1] = atual;
  }

  return lista;
}

// Valida o corpo da requisição. Devolve { erro } se algo estiver errado, ou { dados } se estiver tudo certo.
function lerDisco(body) {
  const titulo = String(body.titulo || "").trim();
  const artista = String(body.artista || "").trim();
  const genero = String(body.genero || "").trim();

  if (!titulo || !artista || !genero) {
    return { erro: "Título, artista e gênero são obrigatórios." };
  }
  if (titulo.length > 150 || artista.length > 100 || genero.length > 50) {
    return { erro: "Algum texto excede o tamanho máximo permitido." };
  }

  const preco_custo = Number(body.preco_custo);
  const preco_venda = Number(body.preco_venda);
  if (!Number.isFinite(preco_custo) || !Number.isFinite(preco_venda) || preco_custo < 0 || preco_venda < 0) {
    return { erro: "Os preços devem ser números maiores ou iguais a zero." };
  }

  const quantidade_estoque = Number(body.quantidade_estoque);
  const estoque_minimo = Number(body.estoque_minimo);
  if (!Number.isInteger(quantidade_estoque) || !Number.isInteger(estoque_minimo) || quantidade_estoque < 0 || estoque_minimo < 0) {
    return { erro: "Estoque e estoque mínimo devem ser números inteiros maiores ou iguais a zero." };
  }

  return { dados: { titulo, artista, genero, preco_custo, preco_venda, quantidade_estoque, estoque_minimo } };
}

function erroInterno(res, erro) {
  console.error(erro);
  res.status(500).json({ mensagem: "Erro interno do servidor." });
}

async function listar(req, res) {
  try {
    const termo = String(req.query.busca || "").trim();
    const filtro = termo
      ? {
          OR: [
            { titulo: { contains: termo } },
            { artista: { contains: termo } },
            { genero: { contains: termo } },
          ],
        }
      : {};

    const discos = await prisma.disco.findMany({ where: filtro });

    // Sempre em ordem alfabética pelo título (RF005).
    res.json(ordenarPorTitulo(discos.map(formatarDisco)));
  } catch (erro) {
    erroInterno(res, erro);
  }
}

async function criar(req, res) {
  try {
    const { erro, dados } = lerDisco(req.body);
    if (erro) {
      return res.status(400).json({ mensagem: erro });
    }

    const disco = await prisma.disco.create({ data: dados });
    res.status(201).json({ mensagem: "Disco cadastrado com sucesso.", disco: formatarDisco(disco) });
  } catch (erro) {
    erroInterno(res, erro);
  }
}

async function atualizar(req, res) {
  try {
    const id_disco = Number(req.params.id);
    if (!Number.isInteger(id_disco) || id_disco <= 0) {
      return res.status(400).json({ mensagem: "ID de disco inválido." });
    }

    const existe = await prisma.disco.findUnique({ where: { id_disco } });
    if (!existe) {
      return res.status(404).json({ mensagem: "Disco não encontrado." });
    }

    const { erro, dados } = lerDisco(req.body);
    if (erro) {
      return res.status(400).json({ mensagem: erro });
    }

    const disco = await prisma.disco.update({ where: { id_disco }, data: dados });
    res.json({ mensagem: "Disco atualizado com sucesso.", disco: formatarDisco(disco) });
  } catch (erro) {
    erroInterno(res, erro);
  }
}

async function excluir(req, res) {
  try {
    const id_disco = Number(req.params.id);
    if (!Number.isInteger(id_disco) || id_disco <= 0) {
      return res.status(400).json({ mensagem: "ID de disco inválido." });
    }

    const existe = await prisma.disco.findUnique({ where: { id_disco } });
    if (!existe) {
      return res.status(404).json({ mensagem: "Disco não encontrado." });
    }

    // Disco que já tem histórico de movimentações não pode ser apagado (chave estrangeira).
    const total = await prisma.movimentacaoEstoque.count({ where: { id_disco } });
    if (total > 0) {
      return res.status(409).json({ mensagem: "Este disco possui movimentações registradas e não pode ser excluído." });
    }

    await prisma.disco.delete({ where: { id_disco } });
    res.json({ mensagem: "Disco excluído com sucesso." });
  } catch (erro) {
    erroInterno(res, erro);
  }
}

module.exports = { listar, criar, atualizar, excluir };
