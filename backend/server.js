require("dotenv").config();
const express = require("express");
const cors = require("cors");
const languages = require("./data/languages");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Remove acentos e deixa em minúsculas (assim "automacao" encontra "Automação")
function normalizar(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Rota inicial
app.get("/", (req, res) => {
  res.json({
    message: "API de Linguagens de Programacao",
    endpoints: [
      "GET /api/languages",
      "GET /api/languages?search=python",
      "GET /api/languages?categoria=Backend,IA",
      "GET /api/languages?search=java&categoria=Mobile",
      "GET /api/languages/:slug"
    ]
  });
});

// Lista todas as linguagens, com busca por termo e/ou filtro de categorias
app.get("/api/languages", (req, res) => {
  const search = normalizar(req.query.search || "");

  // categoria=Backend,IA -> ["backend", "ia"]
  const categorias = String(req.query.categoria || "")
    .split(",")
    .map(normalizar)
    .filter(Boolean);

  const results = languages.filter((language) => {
    const correspondeBusca =
      search === "" ||
      normalizar(language.nome).includes(search) ||
      normalizar(language.descricao).includes(search) ||
      normalizar(language.categoria.join(" ")).includes(search) ||
      String(language.ano).includes(search);

    const correspondeCategoria =
      categorias.length === 0 ||
      language.categoria.some((cat) => categorias.includes(normalizar(cat)));

    return correspondeBusca && correspondeCategoria;
  });

  res.json({
    total: results.length,
    data: results
  });
});

// Busca uma linguagem pelo slug
app.get("/api/languages/:slug", (req, res) => {
  const language = languages.find(
    (item) => item.slug === req.params.slug.toLowerCase()
  );

  if (!language) {
    return res.status(404).json({
      error: "Linguagem nao encontrada"
    });
  }

  res.json(language);
});

// Rota inexistente
app.use((req, res) => {
  res.status(404).json({
    error: "Rota nao encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});