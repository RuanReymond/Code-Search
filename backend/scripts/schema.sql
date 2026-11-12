CREATE TABLE IF NOT EXISTS linguagens (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT NOT NULL,
  ano INTEGER NOT NULL,
  site TEXT NOT NULL,
  documentacao TEXT NOT NULL,
  download TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS linguagem_categoria (
  linguagem_id INTEGER NOT NULL REFERENCES linguagens(id) ON DELETE CASCADE,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE CASCADE,
  posicao INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (linguagem_id, categoria_id)
);
