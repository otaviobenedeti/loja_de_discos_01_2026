const bcrypt = require("bcryptjs");
const prisma = require("../src/config/prisma");

async function main() {
  await prisma.movimentacaoEstoque.deleteMany();
  await prisma.disco.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaHash = await bcrypt.hash("123456", 10);

  await prisma.usuario.createMany({
    data: [
      { nome: "Ana Souza", email: "ana@needlegroove.com", senha: senhaHash },
      { nome: "Carlos Lima", email: "carlos@needlegroove.com", senha: senhaHash },
      { nome: "Marina Alves", email: "marina@needlegroove.com", senha: senhaHash },
    ],
  });

  await prisma.disco.createMany({
    data: [
      { titulo: "Clube da Esquina", artista: "Milton Nascimento e Lô Borges", genero: "MPB", preco_custo: 80.0, preco_venda: 129.9, quantidade_estoque: 8, estoque_minimo: 3 },
      { titulo: "The Dark Side of the Moon", artista: "Pink Floyd", genero: "Rock", preco_custo: 100.0, preco_venda: 159.9, quantidade_estoque: 5, estoque_minimo: 3 },
      { titulo: "Construção", artista: "Chico Buarque", genero: "MPB", preco_custo: 70.0, preco_venda: 119.9, quantidade_estoque: 6, estoque_minimo: 2 },
      { titulo: "Kind of Blue", artista: "Miles Davis", genero: "Jazz", preco_custo: 95.0, preco_venda: 149.9, quantidade_estoque: 4, estoque_minimo: 2 },
    ],
  });

  const usuarios = await prisma.usuario.findMany({ orderBy: { id_usuario: "asc" } });
  const discos = await prisma.disco.findMany({ orderBy: { id_disco: "asc" } });

  await prisma.movimentacaoEstoque.createMany({
    data: [
      { id_disco: discos[0].id_disco, id_usuario: usuarios[0].id_usuario, tipo_movimentacao: "entrada", quantidade: 10, data_movimentacao: new Date("2026-10-01"), observacao: "Reposição inicial do estoque" },
      { id_disco: discos[1].id_disco, id_usuario: usuarios[1].id_usuario, tipo_movimentacao: "saida", quantidade: 2, data_movimentacao: new Date("2026-10-05"), observacao: "Venda no balcão" },
      { id_disco: discos[2].id_disco, id_usuario: usuarios[2].id_usuario, tipo_movimentacao: "saida", quantidade: 1, data_movimentacao: new Date("2026-10-08"), observacao: "Venda no balcão" },
      { id_disco: discos[3].id_disco, id_usuario: usuarios[0].id_usuario, tipo_movimentacao: "entrada", quantidade: 5, data_movimentacao: new Date("2026-10-10"), observacao: "Compra de fornecedor" },
    ],
  });

  console.log("Banco populado: 3 usuários, 4 discos e 4 movimentações.");
}

main()
  .catch((erro) => {
    console.error("Erro ao popular o banco:", erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
