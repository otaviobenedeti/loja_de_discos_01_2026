const API = "http://localhost:3000/api";

const formLogin = document.getElementById("formLogin");
const mensagemLogin = document.getElementById("mensagemLogin");

// Se já estiver logado, vai direto para a tela principal.
if (localStorage.getItem("tokenGroove")) {
    window.location.href = "index.html";
}

formLogin.addEventListener("submit", async event => {
    event.preventDefault();
    mensagemLogin.textContent = "";

    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    try {
        const resposta = await fetch(`${API}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, senha })
        });
        const dados = await resposta.json();

        if (!resposta.ok) {
            mensagemLogin.textContent = dados.mensagem || "Não foi possível entrar.";
            return;
        }

        localStorage.setItem("tokenGroove", dados.token);
        localStorage.setItem("usuarioGroove", JSON.stringify(dados.usuario));
        window.location.href = "index.html";
    } catch (erro) {
        mensagemLogin.textContent = "Não foi possível conectar ao servidor. Verifique se a API está rodando.";
    }
});
