const API = "http://localhost:3000/api";

const listaDiscos = document.getElementById("listaDiscos");
const contadorDiscos = document.getElementById("contadorDiscos");
const formDisco = document.getElementById("formDisco");
const modalCompra = document.getElementById("modalCompra");
const campoBusca = document.getElementById("campoBusca");
const listaHistorico = document.getElementById("listaHistorico");
const btnSalvarDisco = document.getElementById("btnSalvarDisco");
const btnCancelarEdicao = document.getElementById("btnCancelarEdicao");

let discosAtuais = [];      // discos que estão na tela agora
let discoSelecionado = null; // disco aberto no modal de movimentação
let idEmEdicao = null;       // se não for null, o formulário está editando esse disco

// ---------- Login e sessão ----------

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
}

// ---------- Utilidades ----------

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
        listaDiscos.innerHTML = `<div class="estado-vazio"><div>♫</div><h3>Nenhum disco encontrado</h3><p>Cadastre um disco ou altere a busca.</p></div>`;
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
            <img class="capa" src="https://placehold.co/500x500/241b16/e8d8c8?text=${encodeURIComponent(disco.titulo)}" alt="Álbum ${escaparHTML(disco.titulo)}" loading="lazy">
            <div class="filme-info">
                <h3 title="${escaparHTML(disco.titulo)}">${escaparHTML(disco.titulo)}</h3>
                <p class="artista">${escaparHTML(disco.artista)}</p>
                <p class="descricao">Gênero: ${escaparHTML(disco.genero)}</p>
                <div class="preco-estoque"><strong>R$ ${formatarPreco(disco.preco_venda)}</strong><span class="${classeEstoque}">${textoEstoque}</span></div>
                <button class="btn-ingresso" onclick="abrirCompra(${disco.id_disco})">♫ Movimentar estoque</button>
                <button class="btn-excluir" onclick="editarDisco(${disco.id_disco})">Editar disco</button>
                <button class="btn-excluir" onclick="excluirDisco(${disco.id_disco})">Excluir disco</button>
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
    discoSelecionado = discosAtuais.find(disco => disco.id_disco === id);
    if (!discoSelecionado) return;
    document.getElementById("nomeDiscoCompra").textContent = `${discoSelecionado.titulo} — ${discoSelecionado.artista}`;
    document.getElementById("disponiveisCompra").textContent = discoSelecionado.quantidade_estoque;
    document.getElementById("tipoMovimentacao").value = "saida";
    document.getElementById("quantidadeCompra").value = 1;
    document.getElementById("dataMovimentacao").value = dataDeHoje();
    document.getElementById("observacaoMovimentacao").value = "";
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
}

function fecharModalCompra() {
    modalCompra.classList.remove("ativo");
    discoSelecionado = null;
}

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
}

window.addEventListener("click", event => {
    if (event.target === modalCompra) fecharModalCompra();
});

mostrarDiscos();
mostrarHistorico();
