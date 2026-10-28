# Needle & Groove

Sistema web para gerenciar o acervo, as vendas e as reposições de estoque de uma loja de discos de vinil (Simulado SAEP).

## Estrutura

```text
Docs/   requisitos e DER
Web/    frontend (html, css, js)
api/    backend (Node.js + Express + Prisma 7 + MySQL/MariaDB)
```

## Como rodar

Pré-requisitos: Node.js 20+ e MySQL ou MariaDB rodando na sua máquina.

1. Entre na pasta da API e instale as dependências:
   ```bash
   cd api
   npm install
   ```
2. Abra `api/.env` e coloque seu usuário e sua senha do MySQL em `DATABASE_USER`, `DATABASE_PASSWORD` e dentro de `DATABASE_URL`. Troque também o `JWT_SECRET`.
3. Crie o banco e as tabelas (o Prisma cria o banco `loja_discos_db` se ele não existir; se der erro de permissão, crie antes com `CREATE DATABASE loja_discos_db;`):
   ```bash
   npx prisma migrate dev --name init
   ```
4. Gere o Prisma Client (no Prisma 7 isso não acontece sozinho):
   ```bash
   npx prisma generate
   ```
5. Popule o banco com os dados de exemplo:
   ```bash
   npm run seed
   ```
6. Inicie o servidor:
   ```bash
   npm start
   ```
7. Abra no navegador: http://localhost:3000/html/login.html

Usuários criados pelo seed (senha de todos: `123456`):

| Nome | E-mail |
|---|---|
| Ana Souza | ana@needlegroove.com |
| Carlos Lima | carlos@needlegroove.com |
| Marina Alves | marina@needlegroove.com |

## Rotas da API

Todas, exceto o login, exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | O que faz |
|---|---|---|
| POST | /api/auth/login | Login com e-mail e senha; devolve o token |
| GET | /api/discos?busca=termo | Lista os discos em ordem alfabética (com busca opcional) |
| POST | /api/discos | Cadastra um disco |
| PUT | /api/discos/:id | Edita um disco |
| DELETE | /api/discos/:id | Exclui um disco (se não tiver movimentações) |
| POST | /api/movimentacoes | Registra entrada ou saída de estoque |
| GET | /api/movimentacoes | Histórico de movimentações |

## O que cada arquivo da API faz

- `server.js` — liga o servidor, aplica a proteção por login e serve a pasta `Web`.
- `prisma/schema.prisma` — as tabelas (o modelo definido na atividade, sem alterações).
- `prisma.config.ts` — configuração do Prisma 7 (onde fica a URL do banco e o seed).
- `prisma/seed.js` — dados de exemplo (3 usuários, 4 discos, 4 movimentações).
- `src/config/prisma.js` — cria a conexão com o banco.
- `src/middlewares/auth.js` — barra quem não está logado.
- `src/routes/` — liga cada endereço da API ao controller certo.
- `src/controllers/` — recebe a requisição, aplica as regras (validações, estoque, transação, login) e devolve a resposta.
  - `discoController.js` também tem a ordenação alfabética feita à mão (Insertion Sort), exigência do RF005.
