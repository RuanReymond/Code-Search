// Cria as tabelas e copia as linguagens de data/languages.js para o banco.
// Uso (dentro da pasta backend):  npm run seed
// Use o DATABASE_URL do dono do banco (precisa de permissão de escrita).
// Pode ser executado várias vezes: atualiza o que já existe, sem duplicar.

const fs = require("fs");
const path = require("path");
const { pool } = require("../db");
const languages = require("../data/languages");

async function main() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1) Tabelas
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await client.query(schema);

    // 2) Linguagens e categorias
    for (const language of languages) {
      await client.query(
        `INSERT INTO linguagens (id, nome, slug, descricao, ano, site, documentacao, download)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (slug) DO UPDATE SET
           nome = EXCLUDED.nome,
           descricao = EXCLUDED.descricao,
           ano = EXCLUDED.ano,
           site = EXCLUDED.site,
           documentacao = EXCLUDED.documentacao,
           download = EXCLUDED.download`,
        [
          language.id,
          language.nome,
          language.slug,
          language.descricao,
          language.ano,
          language.site,
          language.documentacao,
          language.download
        ]
      );

      const { rows } = await client.query(
        "SELECT id FROM linguagens WHERE slug = $1",
        [language.slug]
      );
      const linguagemId = rows[0].id;

      // Refaz as categorias da linguagem, mantendo a ordem do arquivo
      await client.query(
        "DELETE FROM linguagem_categoria WHERE linguagem_id = $1",
        [linguagemId]
      );

      for (const [posicao, nomeCategoria] of language.categoria.entries()) {
        const categoria = await client.query(
          `INSERT INTO categorias (nome) VALUES ($1)
           ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome
           RETURNING id`,
          [nomeCategoria]
        );

        await client.query(
          `INSERT INTO linguagem_categoria (linguagem_id, categoria_id, posicao)
           VALUES ($1, $2, $3)`,
          [linguagemId, categoria.rows[0].id, posicao]
        );
      }
    }

    // 3) Como os ids vieram do arquivo, ajusta o contador para novos cadastros
    await client.query(
      `SELECT setval(pg_get_serial_sequence('linguagens', 'id'),
                     (SELECT MAX(id) FROM linguagens))`
    );

    await client.query("COMMIT");

    const total = await client.query(
      `SELECT
         (SELECT COUNT(*) FROM linguagens)          AS linguagens,
         (SELECT COUNT(*) FROM categorias)          AS categorias,
         (SELECT COUNT(*) FROM linguagem_categoria) AS vinculos`
    );
    console.log("Banco atualizado:", total.rows[0]);
  } catch (erro) {
    await client.query("ROLLBACK");
    throw erro;
  } finally {
    client.release();
  }
}

main()
  .catch((erro) => {
    console.error("Falha ao popular o banco:", erro.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());