// Endereco da API (backend).
// - No computador (localhost), utiliza a API local.
// - No Vercel, utiliza a API publicada no mesmo dominio.

const API_LOCAL = "http://localhost:3000/api/languages";

const API_PUBLICA = "/api/languages";

const rodandoLocal = [
    "localhost",
    "127.0.0.1",
    ""
].includes(window.location.hostname);

const API_URL = rodandoLocal ? API_LOCAL : API_PUBLICA;

// Caminho dos arquivos estaticos: /public localmente e / no Vercel.
const CAMINHO_PUBLICO = rodandoLocal ? "/public" : "";

// Evita que texto vindo da API seja interpretado como HTML
function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

// Se a resposta demorar, mostra um aviso no lugar. Devolve uma função que cancela o aviso.
function avisarSeDemorar(elemento, milissegundos = 2500) {
    const temporizador = setTimeout(() => {
        elemento.innerHTML = "<p>Conectando ao servidor...</p>";
    }, milissegundos);

    return () => clearTimeout(temporizador);
}

// Mensagem de erro quando a API não responde
function mensagemErroApi(assunto) {
    if (rodandoLocal) {
        return `<p>Não foi possível carregar ${assunto}. Verifique se o servidor está rodando (<code>npm start</code> na pasta backend).</p>`;
    }
    return `<p>Não foi possível carregar ${assunto} agora. Tente novamente em instantes.</p>`;
}