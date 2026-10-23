const listaDiscos = document.getElementById("listaDiscos");
const contadorDiscos = document.getElementById("contadorDiscos");
const formDisco = document.getElementById("formDisco");
const modalCompra = document.getElementById("modalCompra");

const discosIniciais = [
    { id: 1, nome: "Clube da Esquina", artista: "Milton Nascimento e LÃ´ Borges", descricao: "Um marco da mÃºsica brasileira, com harmonias inesquecÃ­veis e a sonoridade Ãºnica de Minas Gerais.", capa: "https://upload.wikimedia.org/wikipedia/pt/7/7d/Clube_da_Esquina.jpg", preco: 129.90, estoque: 8 },
    { id: 2, nome: "The Dark Side of the Moon", artista: "Pink Floyd", descricao: "Uma viagem sonora icÃ´nica que atravessa temas como tempo, vida e condiÃ§Ã£o humana.", capa: "https://upload.wikimedia.org/wikipedia/pt/3/3b/Dark_Side_of_the_Moon.png", preco: 159.90, estoque: 5 },
    { id: 3, nome: "ConstruÃ§Ã£o", artista: "Chico Buarque", descricao: "Um dos Ã¡lbuns mais marcantes da mÃºsica brasileira, com letras e arranjos memorÃ¡veis.", capa: "https://upload.wikimedia.org/wikipedia/pt/2/23/Chico_Buarque_-_Constru%C3%A7%C3%A3o.jpg", preco: 119.90, estoque: 6 },
    { id: 4, nome: "Kind of Blue", artista: "Miles Davis", descricao: "Uma obra essencial do jazz, conhecida por sua atmosfera elegante e improvisos lendÃ¡rios.", capa: "https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg", preco: 149.90, estoque: 4 },
    { id: 5, nome: "Disco de Exemplo", artista: "Needle & Groove", descricao: "Um álbum de demonstração para apresentar o cadastro e a vitrine da loja.", capa: "https://placehold.co/500x500/241b16/e8d8c8?text=Disco+de+Exemplo", preco: 89.90, estoque: 10 }
];

let discoSelecionado = null;

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
}

function salvarDiscos(discos) {
    localStorage.setItem("discosGroove", JSON.stringify(discos));
}

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

function mostrarDiscos() {
    const discos = carregarDiscos();
    listaDiscos.innerHTML = "";
    contadorDiscos.textContent = `${discos.length} ${discos.length === 1 ? "disco" : "discos"}`;

    if (discos.length === 0) {
        listaDiscos.innerHTML = `<div class="estado-vazio"><div>â™«</div><h3>Nenhum disco no catÃ¡logo</h3><p>Cadastre um disco para comeÃ§ar.</p></div>`;
        return;
    }

    discos.forEach(disco => {
        const esgotado = Number(disco.estoque) <= 0;
        const card = document.createElement("article");
        card.className = "filme-card";
        card.innerHTML = `
            <div class="disco-capa"><img class="capa" src="${escaparHTML(disco.capa)}" alt="Capa do Ã¡lbum ${escaparHTML(disco.nome)}" loading="lazy" onerror="this.src='https://placehold.co/500x500/241b16/e8d8c8?text=Capa+indispon%C3%ADvel'"></div>
            <div class="filme-info">
                <h3 title="${escaparHTML(disco.nome)}">${escaparHTML(disco.nome)}</h3>
                <p class="artista">${escaparHTML(disco.artista)}</p>
                <p class="descricao">${escaparHTML(disco.descricao)}</p>
                <div class="preco-estoque"><strong>R$ ${Number(disco.preco).toFixed(2).replace(".", ",")}</strong><span class="${esgotado ? "esgotado" : "disponivel"}">${esgotado ? "ESGOTADO" : `${Number(disco.estoque)} em estoque`}</span></div>
                <button class="btn-ingresso" ${esgotado ? "disabled" : ""} onclick="abrirCompra(${Number(disco.id)})">&#9835; Comprar disco</button>
                <button class="btn-excluir" onclick="excluirDisco(${Number(disco.id)})">Excluir disco</button>
            </div>`;
        listaDiscos.appendChild(card);
    });
}

formDisco.addEventListener("submit", event => {
    event.preventDefault();
    const novoDisco = {
        id: Date.now(),
        nome: document.getElementById("nome").value.trim(),
        artista: document.getElementById("artista").value.trim(),
        descricao: document.getElementById("descricao").value.trim(),
        capa: document.getElementById("capa").value.trim(),
        preco: Number(document.getElementById("preco").value),
        estoque: Number(document.getElementById("estoque").value)
    };
    if (!novoDisco.nome || !novoDisco.artista || !novoDisco.descricao || !novoDisco.capa || novoDisco.preco <= 0 || novoDisco.estoque < 0) {
        alert("Preencha os campos corretamente.");
        return;
    }
    const discos = carregarDiscos();
    discos.push(novoDisco);
    salvarDiscos(discos);
    mostrarDiscos();
    formDisco.reset();
    alert("Disco cadastrado com sucesso!");
    document.getElementById("discos").scrollIntoView({ behavior: "smooth" });
});

function abrirCompra(id) {
    discoSelecionado = carregarDiscos().find(disco => Number(disco.id) === Number(id));
    if (!discoSelecionado || Number(discoSelecionado.estoque) <= 0) return;
    document.getElementById("disponiveisCompra").textContent = discoSelecionado.estoque;
    const quantidade = document.getElementById("quantidadeCompra");
    quantidade.value = 1;
    quantidade.min = 1;
    quantidade.max = discoSelecionado.estoque;
    modalCompra.classList.add("ativo");
}

function confirmarCompra() {
    if (!discoSelecionado) return;
    const quantidade = Number(document.getElementById("quantidadeCompra").value);
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > Number(discoSelecionado.estoque)) {
        alert(`Escolha uma quantidade entre 1 e ${discoSelecionado.estoque}.`);
        return;
    }
    const discos = carregarDiscos();
    const disco = discos.find(item => Number(item.id) === Number(discoSelecionado.id));
    if (!disco || quantidade > Number(disco.estoque)) {
        alert("Estoque insuficiente para essa quantidade.");
        fecharModalCompra();
        mostrarDiscos();
        return;
    }
    disco.estoque = Number(disco.estoque) - quantidade;
    salvarDiscos(discos);
    const total = (Number(disco.preco) * quantidade).toFixed(2).replace(".", ",");
    alert(`Compra realizada!\n\nQuantidade: ${quantidade}\nTotal: R$ ${total}`);
    fecharModalCompra();
    mostrarDiscos();
}

function fecharModalCompra() {
    modalCompra.classList.remove("ativo");
    discoSelecionado = null;
}

function excluirDisco(id) {
    const discos = carregarDiscos();
    const disco = discos.find(item => Number(item.id) === Number(id));
    if (!disco || !confirm(`Deseja realmente excluir "${disco.nome}" do catÃ¡logo?`)) return;
    salvarDiscos(discos.filter(item => Number(item.id) !== Number(id)));
    mostrarDiscos();
}

window.addEventListener("click", event => {
    if (event.target === modalCompra) fecharModalCompra();
});

mostrarDiscos();

const intro = document.getElementById("intro");
const tempoIntro = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 250 : 2200;

window.setTimeout(() => {
    document.body.classList.add("site-pronto");
    intro.classList.add("intro--sair");
    window.setTimeout(() => intro.remove(), 900);
}, tempoIntro);

