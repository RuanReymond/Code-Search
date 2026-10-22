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
      "GET /api/languages/:slug",
      "GET /api/languages/:slug/github"
    ]
  });
});

// ---------------------------------------------------------------------------
// Busca de linguagens
//
// Cada linguagem recebe uma pontuação para o termo pesquisado (menor = mais
// relevante) e os resultados saem ordenados por ela:
//   0 a 3   -> nome ou slug (exato, começa com o termo, começa uma palavra, contém)
//   10 e 11 -> categoria (exata, começa com o termo)
//   20      -> palavra da descrição que começa com o termo
//
// Termos curtos são mais rígidos, para não trazer linguagens sem relação:
//   1 letra  -> só o nome exato ou seguido de símbolo ("c" -> C, C++ e C#)
//   2 letras -> nome que começa com o termo ou categoria exata ("go" -> Go, "ia" -> IA)
//   3 ou +   -> nome, categoria e descrição
// ---------------------------------------------------------------------------

// Divide um texto em palavras ("visual basic .net" -> ["visual", "basic", "net"])
function palavras(texto) {
  return normalizar(texto).split(/[^a-z0-9]+/).filter(Boolean);
}

// Pontuação pelo nome e pelo slug (o slug permite buscar "cpp" ou "csharp")
function pontuarNome(language, termo) {
  let melhor = null;

  for (const texto of [normalizar(language.nome), normalizar(language.slug)]) {
    let pontos = null;

    if (texto === termo) {
      pontos = 0;
    } else if (texto.startsWith(termo)) {
      // Com 1 letra só vale se logo depois vier um símbolo: "c" -> C++ e C#, mas não COBOL
      const proximo = texto[termo.length];
      if (termo.length > 1 || !/[a-z0-9]/.test(proximo)) {
        pontos = 1;
      }
    } else if (termo.length >= 3 && palavras(texto).some((p) => p.startsWith(termo))) {
      pontos = 2;
    } else if (termo.length >= 3 && texto.includes(termo)) {
      pontos = 3;
    }

    if (pontos !== null && (melhor === null || pontos < melhor)) {
      melhor = pontos;
    }
  }

  return melhor;
}

// Pontuação pelas categorias
function pontuarCategoria(language, termo) {
  if (termo.length < 2) return null;

  const categorias = language.categoria.map(normalizar);

  if (categorias.includes(termo)) return 10;
  if (termo.length >= 3 && categorias.some((cat) => cat.startsWith(termo))) return 11;
  return null;
}

// Pontuação pela descrição (só para termos com 3 letras ou mais)
function pontuarDescricao(language, termo) {
  if (termo.length < 3) return null;

  const texto = " " + normalizar(language.descricao).replace(/[^a-z0-9#+.]+/g, " ");
  return texto.includes(" " + termo) ? 20 : null;
}

// Devolve as linguagens que correspondem ao termo, da mais para a menos relevante
function buscarLinguagens(termo) {
  if (termo === "") {
    return languages;
  }

  // Só números: busca pelo ano de criação ("1995", "199")
  if (/^\d+$/.test(termo)) {
    return languages.filter((language) => String(language.ano).includes(termo));
  }

  return languages
    .map((language) => {
      const pontos = [
        pontuarNome(language, termo),
        pontuarCategoria(language, termo),
        pontuarDescricao(language, termo)
      ].filter((valor) => valor !== null);

      return { language, pontos: pontos.length > 0 ? Math.min(...pontos) : null };
    })
    .filter((item) => item.pontos !== null)
    .sort((a, b) => a.pontos - b.pontos || a.language.id - b.language.id)
    .map((item) => item.language);
}

// Lista todas as linguagens, com busca por termo e/ou filtro de categorias
app.get("/api/languages", (req, res) => {
  const search = normalizar(req.query.search || "");

  // categoria=Backend,IA -> ["backend", "ia"]
  const categorias = String(req.query.categoria || "")
    .split(",")
    .map(normalizar)
    .filter(Boolean);

  const results = buscarLinguagens(search).filter(
    (language) =>
      categorias.length === 0 ||
      language.categoria.some((cat) => categorias.includes(normalizar(cat)))
  );

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

// Nome de cada linguagem no GitHub (usado no filtro "language:")
const githubLanguageNames = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  typescript: "TypeScript",
  csharp: "C#",
  php: "PHP",
  c: "C",
  cpp: "C++",
  go: "Go",
  rust: "Rust",
  kotlin: "Kotlin",
  swift: "Swift",
  ruby: "Ruby",
  dart: "Dart",
  r: "R",
  scala: "Scala",
  lua: "Lua",
  perl: "Perl",
  julia: "Julia",
  elixir: "Elixir",
  haskell: "Haskell",
  solidity: "Solidity",
  vbnet: "Visual Basic .NET",
  vba: "VBA",
  sql: "SQL",
  // GitHub classifica Bash como Shell.
  bash: "Shell",
  powershell: "PowerShell",
  groovy: "Groovy",
  matlab: "MATLAB",
  gdscript: "GDScript",
  micropython: "MicroPython",
  "objective-c": "Objective-C",
  zig: "Zig",
  assembly: "Assembly",
  delphi: "Delphi",
  fortran: "Fortran",
  erlang: "Erlang",
  clojure: "Clojure",
  fsharp: "F#",
  cobol: "COBOL",
  ada: "Ada",
  ocaml: "OCaml",
  apex: "Apex",
  nim: "Nim",
  crystal: "Crystal"
};

const GITHUB_SEARCH_URL = "https://api.github.com/search/repositories";

// A busca do GitHub tem limite de requisições (10 por minuto sem token),
// então as respostas ficam guardadas em memória por um tempo.
const GITHUB_CACHE_MS = 30 * 60 * 1000; // 30 minutos
const GITHUB_PARTIAL_CACHE_MS = 60 * 1000; // 1 minuto, se alguma estatística falhou
const githubCache = new Map();

// Faz uma pesquisa de repositórios na API do GitHub
async function searchGithubRepositories(query, perPage, sortByStars = false) {
  const params = new URLSearchParams({
    q: query,
    per_page: String(perPage)
  });

  if (sortByStars) {
    params.set("sort", "stars");
    params.set("order", "desc");
  }

  const response = await fetch(`${GITHUB_SEARCH_URL}?${params}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(process.env.GITHUB_TOKEN && {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
      })
    }
  });

  if (!response.ok) {
    const error = new Error(`GitHub respondeu com status ${response.status}`);
    error.status = response.status;
    error.rateLimited =
      (response.status === 403 || response.status === 429) &&
      (response.headers.get("x-ratelimit-remaining") === "0" ||
        response.headers.has("retry-after"));
    throw error;
  }

  return response.json();
}

// Dados do GitHub para uma linguagem: totais e principais projetos
app.get("/api/languages/:slug/github", async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const githubLanguage = githubLanguageNames[slug];

  if (!githubLanguage) {
    return res.status(404).json({
      error: "Linguagem sem mapeamento para pesquisa no GitHub"
    });
  }

  const cached = githubCache.get(slug);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json(cached.payload);
  }

  try {
    const base = `language:${githubLanguage}`;
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    // 1) 10 projetos com mais estrelas (e o total de repositórios)
    // 2) quantos repositórios têm mais de 1000 estrelas
    // 3) quantos repositórios foram criados no último ano
    const [top, popular, recent] = await Promise.allSettled([
      searchGithubRepositories(base, 10, true),
      searchGithubRepositories(`${base} stars:>1000`, 1),
      searchGithubRepositories(`${base} created:>${oneYearAgo}`, 1)
    ]);

    // Sem a lista principal não há o que mostrar
    if (top.status === "rejected") {
      throw top.reason;
    }

    const count = (result) =>
      result.status === "fulfilled" ? result.value.total_count : null;

    const repositories = top.value.items.map((repo) => ({
      name: repo.full_name,
      description: repo.description,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      url: repo.html_url,
      language: repo.language,
      updatedAt: repo.pushed_at
    }));

    const payload = {
      language: githubLanguage,
      total: repositories.length,
      stats: {
        totalRepositories: top.value.total_count,
        repositoriesOver1000Stars: count(popular),
        newRepositoriesLastYear: count(recent)
      },
      searchUrl: `https://github.com/search?q=${encodeURIComponent(base)}&type=repositories&s=stars&o=desc`,
      data: repositories
    };

    const complete =
      payload.stats.repositoriesOver1000Stars !== null &&
      payload.stats.newRepositoriesLastYear !== null;

    githubCache.set(slug, {
      payload,
      expiresAt: Date.now() + (complete ? GITHUB_CACHE_MS : GITHUB_PARTIAL_CACHE_MS)
    });

    res.json(payload);
  } catch (error) {
    console.error("GitHub API error:", error.message);

    if (error.rateLimited) {
      return res.status(429).json({
        error: "Limite de requisicoes do GitHub atingido. Tente novamente em alguns minutos."
      });
    }

    res.status(502).json({
      error: "Erro ao consultar o servico do GitHub"
    });
  }
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