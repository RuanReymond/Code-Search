require("dotenv").config({ quiet: true });
const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("Defina DATABASE_URL no arquivo .env (veja o env.example).");
}

// Bancos na nuvem (Neon) exigem conexão segura; um Postgres local não
const bancoLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: bancoLocal ? false : { rejectUnauthorized: true },
  max: 5,
  connectionTimeoutMillis: 15000, // o Neon pode levar alguns segundos para acordar
  idleTimeoutMillis: 30000
});

// Conexões ociosas podem ser derrubadas pelo Neon; sem isso o servidor cairia
pool.on("error", (erro) => {
  console.error("Conexao ociosa com o banco foi encerrada:", erro.message);
});

// Devolve as linguagens no mesmo formato do antigo languages.js
const CONSULTA_LINGUAGENS = `
  SELECT
    l.id, l.nome, l.slug, l.descricao, l.ano, l.site, l.documentacao, l.download,
    COALESCE(
      array_agg(c.nome ORDER BY lc.posicao) FILTER (WHERE c.nome IS NOT NULL),
      '{}'
    ) AS categoria
  FROM linguagens l
  LEFT JOIN linguagem_categoria lc ON lc.linguagem_id = l.id
  LEFT JOIN categorias c ON c.id = lc.categoria_id
  GROUP BY l.id
  ORDER BY l.id
`;

// As linguagens mudam raramente, então ficam em memória por alguns minutos.
// Isso evita consultar o banco a cada busca.
const CACHE_MS = 10 * 60 * 1000;
let cache = null; // { dados, expiraEm }
let consultaEmAndamento = null;

async function obterLinguagens() {
  if (cache && cache.expiraEm > Date.now()) {
    return cache.dados;
  }

  // Várias buscas ao mesmo tempo compartilham a mesma consulta
  if (!consultaEmAndamento) {
    consultaEmAndamento = pool
      .query(CONSULTA_LINGUAGENS)
      .then(({ rows }) => {
        cache = { dados: rows, expiraEm: Date.now() + CACHE_MS };
        return rows;
      })
      .finally(() => {
        consultaEmAndamento = null;
      });
  }

  try {
    return await consultaEmAndamento;
  } catch (erro) {
    // Se o banco falhar, usa os últimos dados conhecidos em vez de derrubar o site
    if (cache) {
      console.error("Banco indisponivel, usando dados em cache:", erro.message);
      return cache.dados;
    }
    throw erro;
  }
}

module.exports = { pool, obterLinguagens };