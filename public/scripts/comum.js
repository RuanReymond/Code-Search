// Endereço da API (backend). Para publicar o projeto, troque pelo endereço do servidor.
const API_URL = "http://localhost:3000/api/languages";

// Evita que texto vindo da API seja interpretado como HTML
function escapar(texto) {
    return String(texto)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
