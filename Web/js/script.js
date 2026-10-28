<<<<<<< HEAD
const API = "http://localhost:3000/api";

const listaDiscos = document.getElementById("listaDiscos");
=======
﻿const listaDiscos = document.getElementById("listaDiscos");
>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33
const contadorDiscos = document.getElementById("contadorDiscos");
const formDisco = document.getElementById("formDisco");
const modalCompra = document.getElementById("modalCompra");
const campoBusca = document.getElementById("campoBusca");
const listaHistorico = document.getElementById("listaHistorico");
const btnSalvarDisco = document.getElementById("btnSalvarDisco");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

<<<<<<< HEAD
let discosAtuais = [];      // discos que estão na tela agora
let discoSelecionado = null; // disco aberto no modal de movimentação
let idEmEdicao = null;       // se não for null, o formulário está editando esse disco
=======
const discosIniciais = [
    { id: 1, nome: "Clube da Esquina", artista: "Milton Nascimento e LÃ´ Borges", descricao: "Um marco da mÃºsica brasileira, com harmonias inesquecÃ­veis e a sonoridade Ãºnica de Minas Gerais.", capa: "https://upload.wikimedia.org/wikipedia/pt/7/7d/Clube_da_Esquina.jpg", preco: 129.90, estoque: 8 },
    { id: 2, nome: "The Dark Side of the Moon", artista: "Pink Floyd", descricao: "Uma viagem sonora icÃ´nica que atravessa temas como tempo, vida e condiÃ§Ã£o humana.", capa: "https://upload.wikimedia.org/wikipedia/pt/3/3b/Dark_Side_of_the_Moon.png", preco: 159.90, estoque: 5 },
    { id: 3, nome: "ConstruÃ§Ã£o", artista: "Chico Buarque", descricao: "Um dos Ã¡lbuns mais marcantes da mÃºsica brasileira, com letras e arranjos memorÃ¡veis.", capa: "https://upload.wikimedia.org/wikipedia/pt/2/23/Chico_Buarque_-_Constru%C3%A7%C3%A3o.jpg", preco: 119.90, estoque: 6 },
    { id: 4, nome: "Kind of Blue", artista: "Miles Davis", descricao: "Uma obra essencial do jazz, conhecida por sua atmosfera elegante e improvisos lendÃ¡rios.", capa: "https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg", preco: 149.90, estoque: 4 },
    { id: 5, nome: "Disco de Exemplo", artista: "Needle & Groove", descricao: "Um álbum de demonstração para apresentar o cadastro e a vitrine da loja.", capa: "https://placehold.co/500x500/241b16/e8d8c8?text=Disco+de+Exemplo", preco: 89.90, estoque: 10 }
];
>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33

// ---------- Login e sessão ----------

<<<<<<< HEAD
const token = localStorage.getItem("tokenGroove");
if (!token) {
    window.location.href = "login.html"; // sem login, volta para a tela de login
}

const usuarioLogado = JSON.parse(localStorage.getItem("usuarioGroove") || "{}");
document.getElementById("nomeUsuario").textContent = usuarioLogado.nome || "";

function sair() {
    localStorage.removeItem("tokenGroove");
    localStorage.removeItem("usuarioGroove");
    window.location.href = "login.html";
}

document.getElementById("btnSair").addEventListener("click", event => {
    event.preventDefault();
    sair();
});

// ---------- Função auxiliar para chamar a API ----------

async function chamarApi(caminho, opcoes = {}) {
    const resposta = await fetch(`${API}${caminho}`, {
        ...opcoes,
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    if (resposta.status === 401) {
        alert("Sua sessão expirou. Faça login novamente.");
        sair();
        throw new Error("Não autenticado");
    }

    const dados = await resposta.json();
    if (!resposta.ok) {
        throw new Error(dados.mensagem || "Erro ao comunicar com o servidor.");
    }
    return dados;
=======
function carregarDiscos() {
    try {
        const salvos = localStorage.getItem("discosGroove");
        if (salvos) {
            const discos = JSON.parse(salvos);
            if (!localStorage.getItem("discoExemploAdicionado")) {
                if (!discos.some(disco => Number(disco.id) === 5)) {
                    discos.push(discosIniciais.find(disco => disco.id === 5));
                    salvarDiscos(discos);
                }
                localStorage.setItem("discoExemploAdicionado", "true");
            }
            return corrigirCatalogo(discos);
        }
    } catch (erro) {
        console.warn("NÃ£o foi possÃ­vel ler o catÃ¡logo salvo.", erro);
    }
    salvarDiscos(discosIniciais);
    localStorage.setItem("discoExemploAdicionado", "true");
    return corrigirCatalogo(discosIniciais);
>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33
}

// ---------- Utilidades ----------

function corrigirTexto(texto) {
    const trocas = {
        "\u00c3\u00a3": "\u00e3", "\u00c3\u00a9": "\u00e9", "\u00c3\u00ad": "\u00ed",
        "\u00c3\u00b3": "\u00f3", "\u00c3\u00ba": "\u00fa", "\u00c3\u00a7": "\u00e7",
        "\u00c3\u00a1": "\u00e1", "\u00c3\u00aa": "\u00ea", "\u00c3\u00b5": "\u00f5",
        "\u00c3\u00b4": "\u00f4", "\u00e2\u20ac\u201d": "\u2014", "\u00e2\u2122\u00ab": "\u266b"
    };
    return String(texto).replace(/\u00c3[\u00a1\u00a3\u00a7\u00a9\u00ad\u00aa\u00b3\u00b4\u00b5\u00ba]|\u00e2\u20ac\u201d|\u00e2\u2122\u00ab/g, trecho => trocas[trecho] || trecho);
}

function corrigirCatalogo(discos) {
    discos.forEach(disco => {
        ["nome", "artista", "descricao"].forEach(campo => {
            if (disco[campo]) disco[campo] = corrigirTexto(disco[campo]);
        });
    });
    salvarDiscos(discos);
    return discos;
}

function escaparHTML(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[caractere]);
}

function formatarPreco(valor) {
    return Number(valor).toFixed(2).replace(".", ",");
}

function dataDeHoje() {
    const hoje = new Date();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");
    return `${hoje.getFullYear()}-${mes}-${dia}`;
}

function formatarData(texto) {
    const [ano, mes, dia] = texto.split("-");
    return `${dia}/${mes}/${ano}`;
}

// ---------- Discos ----------

async function mostrarDiscos() {
    try {
        const busca = campoBusca.value.trim();
        discosAtuais = await chamarApi(`/discos?busca=${encodeURIComponent(busca)}`);
    } catch (erro) {
        listaDiscos.innerHTML = `<div class="estado-vazio"><div>♫</div><h3>Não foi possível carregar os discos</h3><p>${escaparHTML(erro.message)}</p></div>`;
        return;
    }

    const discos = discosAtuais;
    listaDiscos.innerHTML = "";
    contadorDiscos.textContent = `${discos.length} ${discos.length === 1 ? "disco" : "discos"}`;

    if (discos.length === 0) {
<<<<<<< HEAD
        listaDiscos.innerHTML = `<div class="estado-vazio"><div>♫</div><h3>Nenhum disco encontrado</h3><p>Cadastre um disco ou altere a busca.</p></div>`;
=======
        listaDiscos.innerHTML = `<div class="estado-vazio"><div>â™«</div><h3>Nenhum disco no catÃ¡logo</h3><p>Cadastre um disco para comeÃ§ar.</p></div>`;
>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33
        return;
    }

    discos.forEach(disco => {
        const esgotado = disco.quantidade_estoque <= 0;
        const estoqueBaixo = !esgotado && disco.quantidade_estoque < disco.estoque_minimo;
        const textoEstoque = esgotado ? "ESGOTADO" : (estoqueBaixo ? `ESTOQUE BAIXO: ${disco.quantidade_estoque}` : `${disco.quantidade_estoque} em estoque`);
        const classeEstoque = esgotado ? "esgotado" : (estoqueBaixo ? "estoque-baixo" : "disponivel");

        const card = document.createElement("article");
        card.className = "filme-card";
        card.innerHTML = `
<<<<<<< HEAD
            <img class="capa" src="https://placehold.co/500x500/241b16/e8d8c8?text=${encodeURIComponent(disco.titulo)}" alt="Álbum ${escaparHTML(disco.titulo)}" loading="lazy">
=======
            <div class="disco-capa"><img class="capa" src="${escaparHTML(disco.capa)}" alt="Capa do Ã¡lbum ${escaparHTML(disco.nome)}" loading="lazy" onerror="this.src='https://placehold.co/500x500/241b16/e8d8c8?text=Capa+indispon%C3%ADvel'"></div>
>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33
            <div class="filme-info">
                <h3 title="${escaparHTML(disco.titulo)}">${escaparHTML(disco.titulo)}</h3>
                <p class="artista">${escaparHTML(disco.artista)}</p>
<<<<<<< HEAD
                <p class="descricao">Gênero: ${escaparHTML(disco.genero)}</p>
                <div class="preco-estoque"><strong>R$ ${formatarPreco(disco.preco_venda)}</strong><span class="${classeEstoque}">${textoEstoque}</span></div>
                <button class="btn-ingresso" onclick="abrirCompra(${disco.id_disco})">♫ Movimentar estoque</button>
                <button class="btn-excluir" onclick="editarDisco(${disco.id_disco})">Editar disco</button>
                <button class="btn-excluir" onclick="excluirDisco(${disco.id_disco})">Excluir disco</button>
=======
                <p class="descricao">${escaparHTML(disco.descricao)}</p>
                <div class="preco-estoque"><strong>R$ ${Number(disco.preco).toFixed(2).replace(".", ",")}</strong><span class="${esgotado ? "esgotado" : "disponivel"}">${esgotado ? "ESGOTADO" : `${Number(disco.estoque)} em estoque`}</span></div>
                <button class="btn-ingresso" ${esgotado ? "disabled" : ""} onclick="abrirCompra(${Number(disco.id)})">&#9835; Comprar disco</button>
                <button class="btn-excluir" onclick="excluirDisco(${Number(disco.id)})">Excluir disco</button>
>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33
            </div>`;
        listaDiscos.appendChild(card);
    });
}

campoBusca.addEventListener("input", mostrarDiscos);

formDisco.addEventListener("submit", async event => {
    event.preventDefault();
    const dados = {
        titulo: document.getElementById("titulo").value.trim(),
        artista: document.getElementById("artista").value.trim(),
        genero: document.getElementById("genero").value.trim(),
        preco_custo: Number(document.getElementById("precoCusto").value),
        preco_venda: Number(document.getElementById("precoVenda").value),
        quantidade_estoque: Number(document.getElementById("estoque").value),
        estoque_minimo: Number(document.getElementById("estoqueMinimo").value)
    };

    // Validação rápida no navegador (o servidor valida de novo).
    if (!dados.titulo || !dados.artista || !dados.genero ||
        dados.preco_custo < 0 || dados.preco_venda < 0 ||
        !Number.isInteger(dados.quantidade_estoque) || dados.quantidade_estoque < 0 ||
        !Number.isInteger(dados.estoque_minimo) || dados.estoque_minimo < 0) {
        alert("Preencha os campos corretamente.");
        return;
    }

    try {
        const resposta = idEmEdicao === null
            ? await chamarApi("/discos", { method: "POST", body: JSON.stringify(dados) })
            : await chamarApi(`/discos/${idEmEdicao}`, { method: "PUT", body: JSON.stringify(dados) });
        alert(resposta.mensagem);
        cancelarEdicao();
        await mostrarDiscos();
        document.getElementById("discos").scrollIntoView({ behavior: "smooth" });
    } catch (erro) {
        alert(erro.message);
    }
});

function editarDisco(id) {
    const disco = discosAtuais.find(item => item.id_disco === id);
    if (!disco) return;
    idEmEdicao = id;
    document.getElementById("titulo").value = disco.titulo;
    document.getElementById("artista").value = disco.artista;
    document.getElementById("genero").value = disco.genero;
    document.getElementById("precoCusto").value = disco.preco_custo;
    document.getElementById("precoVenda").value = disco.preco_venda;
    document.getElementById("estoque").value = disco.quantidade_estoque;
    document.getElementById("estoqueMinimo").value = disco.estoque_minimo;
    document.getElementById("tituloFormulario").textContent = "Editar disco";
    btnSalvarDisco.textContent = "Salvar alterações";
    btnCancelarEdicao.hidden = false;
    document.getElementById("cadastro").scrollIntoView({ behavior: "smooth" });
}

function cancelarEdicao() {
    idEmEdicao = null;
    formDisco.reset();
    document.getElementById("tituloFormulario").textContent = "Adicionar um disco";
    btnSalvarDisco.textContent = "＋ Cadastrar disco";
    btnCancelarEdicao.hidden = true;
}

btnCancelarEdicao.addEventListener("click", cancelarEdicao);

async function excluirDisco(id) {
    const disco = discosAtuais.find(item => item.id_disco === id);
    if (!disco || !confirm(`Deseja realmente excluir "${disco.titulo}" do catálogo?`)) return;
    try {
        const resposta = await chamarApi(`/discos/${id}`, { method: "DELETE" });
        alert(resposta.mensagem);
        await mostrarDiscos();
    } catch (erro) {
        alert(erro.message);
    }
}

// ---------- Movimentação de estoque ----------

function abrirCompra(id) {
<<<<<<< HEAD
    discoSelecionado = discosAtuais.find(disco => disco.id_disco === id);
    if (!discoSelecionado) return;
    document.getElementById("nomeDiscoCompra").textContent = `${discoSelecionado.titulo} — ${discoSelecionado.artista}`;
    document.getElementById("disponiveisCompra").textContent = discoSelecionado.quantidade_estoque;
    document.getElementById("tipoMovimentacao").value = "saida";
    document.getElementById("quantidadeCompra").value = 1;
    document.getElementById("dataMovimentacao").value = dataDeHoje();
    document.getElementById("observacaoMovimentacao").value = "";
=======
    discoSelecionado = carregarDiscos().find(disco => Number(disco.id) === Number(id));
    if (!discoSelecionado || Number(discoSelecionado.estoque) <= 0) return;
    document.getElementById("disponiveisCompra").textContent = discoSelecionado.estoque;
    const quantidade = document.getElementById("quantidadeCompra");
    quantidade.value = 1;
    quantidade.min = 1;
    quantidade.max = discoSelecionado.estoque;
>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33
    modalCompra.classList.add("ativo");
}

async function confirmarMovimentacao() {
    if (!discoSelecionado) return;

    const tipo = document.getElementById("tipoMovimentacao").value;
    const quantidade = Number(document.getElementById("quantidadeCompra").value);

    if (!Number.isInteger(quantidade) || quantidade < 1) {
        alert("Informe uma quantidade inteira maior que zero.");
        return;
    }
    if (tipo === "saida" && quantidade > discoSelecionado.quantidade_estoque) {
        alert(`Estoque insuficiente. Disponível: ${discoSelecionado.quantidade_estoque}.`);
        return;
    }

    try {
        const resposta = await chamarApi("/movimentacoes", {
            method: "POST",
            body: JSON.stringify({
                id_disco: discoSelecionado.id_disco,
                tipo_movimentacao: tipo,
                quantidade: quantidade,
                data_movimentacao: document.getElementById("dataMovimentacao").value,
                observacao: document.getElementById("observacaoMovimentacao").value.trim()
            })
        });

        // O servidor avisa se o estoque ficou abaixo do mínimo (RF007).
        alert(resposta.mensagem);
        fecharModalCompra();
        await mostrarDiscos();
        await mostrarHistorico();
    } catch (erro) {
        alert(erro.message);
    }
<<<<<<< HEAD
=======
    disco.estoque = Number(disco.estoque) - quantidade;
    salvarDiscos(discos);
    const total = (Number(disco.preco) * quantidade).toFixed(2).replace(".", ",");
    alert(`Compra realizada!\n\nQuantidade: ${quantidade}\nTotal: R$ ${total}`);
    fecharModalCompra();
    mostrarDiscos();
>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33
}

function fecharModalCompra() {
    modalCompra.classList.remove("ativo");
    discoSelecionado = null;
}

<<<<<<< HEAD
// ---------- Histórico ----------

async function mostrarHistorico() {
    try {
        const historico = await chamarApi("/movimentacoes");
        if (historico.length === 0) {
            listaHistorico.innerHTML = `<tr><td colspan="6">Nenhuma movimentação registrada.</td></tr>`;
            return;
        }
        listaHistorico.innerHTML = historico.map(item => `
            <tr>
                <td>${formatarData(item.data_movimentacao)}</td>
                <td>${escaparHTML(item.disco)}</td>
                <td>${item.tipo_movimentacao === "entrada" ? "Entrada" : "Saída"}</td>
                <td>${item.quantidade}</td>
                <td>${escaparHTML(item.usuario)}</td>
                <td>${escaparHTML(item.observacao)}</td>
            </tr>`).join("");
    } catch (erro) {
        listaHistorico.innerHTML = `<tr><td colspan="6">${escaparHTML(erro.message)}</td></tr>`;
    }
=======
function excluirDisco(id) {
    const discos = carregarDiscos();
    const disco = discos.find(item => Number(item.id) === Number(id));
    if (!disco || !confirm(`Deseja realmente excluir "${disco.nome}" do catÃ¡logo?`)) return;
    salvarDiscos(discos.filter(item => Number(item.id) !== Number(id)));
    mostrarDiscos();
>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33
}

window.addEventListener("click", event => {
    if (event.target === modalCompra) fecharModalCompra();
});

mostrarDiscos();
<<<<<<< HEAD
mostrarHistorico();
=======

const intro = document.getElementById("intro");
const tempoIntro = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 250 : 2200;

window.setTimeout(() => {
    document.body.classList.add("site-pronto");
    intro.classList.add("intro--sair");
    window.setTimeout(() => intro.remove(), 900);
}, tempoIntro);

>>>>>>> 8414f44158acee0c7b7fbaf603e761579d9a7c33
