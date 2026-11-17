// Prepara o frontend estatico para o Vercel.
// Localmente, o projeto usa /public/...; no Vercel, public/ e a raiz do site.
const fs = require("fs");
const path = require("path");

const raiz = path.join(__dirname, "..");
const origem = path.join(raiz, "index.html");
const destino = path.join(raiz, "public", "index.html");

let html = fs.readFileSync(origem, "utf8");
html = html.replaceAll('="/public/styles/', '="/styles/');
html = html.replaceAll('="/public/scripts/', '="/scripts/');
fs.writeFileSync(destino, html, "utf8");

console.log("Frontend preparado em public/index.html");
