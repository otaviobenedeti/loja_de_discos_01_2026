const listaDiscos = document.getElementById("listaDiscos");
const contadorDiscos = document.getElementById("contadorDiscos");
const formDisco = document.getElementById("formDisco");
const modalCompra = document.getElementById("modalCompra");

const discosIniciais = [
    { id: 1, nome: "Clube da Esquina", artista: "Milton Nascimento e Lô Borges", descricao: "Um marco da música brasileira, com harmonias inesquecíveis e a sonoridade única de Minas Gerais.", capa: "https://upload.wikimedia.org/wikipedia/pt/7/7d/Clube_da_Esquina.jpg", preco: 129.90, estoque: 8 },
    { id: 2, nome: "The Dark Side of the Moon", artista: "Pink Floyd", descricao: "Uma viagem sonora icônica que atravessa temas como tempo, vida e condição humana.", capa: "https://upload.wikimedia.org/wikipedia/pt/3/3b/Dark_Side_of_the_Moon.png", preco: 159.90, estoque: 5 },
    { id: 3, nome: "Construção", artista: "Chico Buarque", descricao: "Um dos álbuns mais marcantes da música brasileira, com letras e arranjos memoráveis.", capa: "https://upload.wikimedia.org/wikipedia/pt/2/23/Chico_Buarque_-_Constru%C3%A7%C3%A3o.jpg", preco: 119.90, estoque: 6 },
    { id: 4, nome: "Kind of Blue", artista: "Miles Davis", descricao: "Uma obra essencial do jazz, conhecida por sua atmosfera elegante e improvisos lendários.", capa: "https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg", preco: 149.90, estoque: 4 }
];

let discoSelecionado = null;

function carregarDiscos() {
    try {
        const salvos = localStorage.getItem("discosGroove");
        if (salvos) return JSON.parse(salvos);
    } catch (erro) {
        console.warn("Não foi possível ler o catálogo salvo.", erro);
    }
    salvarDiscos(discosIniciais);
    return discosIniciais;
}

function salvarDiscos(discos) {
    localStorage.setItem("discosGroove", JSON.stringify(discos));
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
        listaDiscos.innerHTML = `<div class="estado-vazio"><div>♫</div><h3>Nenhum disco no catálogo</h3><p>Cadastre um disco para começar.</p></div>`;
        return;
    }

    discos.forEach(disco => {
        const esgotado = Number(disco.estoque) <= 0;
        const card = document.createElement("article");
        card.className = "filme-card";
        card.innerHTML = `
            <img class="capa" src="${escaparHTML(disco.capa)}" alt="Capa do álbum ${escaparHTML(disco.nome)}" loading="lazy" onerror="this.src='https://placehold.co/500x500/241b16/e8d8c8?text=Capa+indispon%C3%ADvel'">
            <div class="filme-info">
                <h3 title="${escaparHTML(disco.nome)}">${escaparHTML(disco.nome)}</h3>
                <p class="artista">${escaparHTML(disco.artista)}</p>
                <p class="descricao">${escaparHTML(disco.descricao)}</p>
                <div class="preco-estoque"><strong>R$ ${Number(disco.preco).toFixed(2).replace(".", ",")}</strong><span class="${esgotado ? "esgotado" : "disponivel"}">${esgotado ? "ESGOTADO" : `${Number(disco.estoque)} em estoque`}</span></div>
                <button class="btn-ingresso" ${esgotado ? "disabled" : ""} onclick="abrirCompra(${Number(disco.id)})">♫ Comprar disco</button>
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
    document.getElementById("nomeDiscoCompra").textContent = `${discoSelecionado.nome} — ${discoSelecionado.artista}`;
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
    alert(`Compra realizada!\n\n${disco.nome} — ${disco.artista}\nQuantidade: ${quantidade}\nTotal: R$ ${total}`);
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
    if (!disco || !confirm(`Deseja realmente excluir "${disco.nome}" do catálogo?`)) return;
    salvarDiscos(discos.filter(item => Number(item.id) !== Number(id)));
    mostrarDiscos();
}

window.addEventListener("click", event => {
    if (event.target === modalCompra) fecharModalCompra();
});

mostrarDiscos();
