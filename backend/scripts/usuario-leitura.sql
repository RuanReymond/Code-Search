-- Usuário somente leitura para a API (ela só consulta, nunca altera).
-- Execute no editor SQL do Neon, trocando a senha antes.
-- NÃO salve a senha real neste arquivo nem envie ao GitHub.

CREATE ROLE api_leitura WITH LOGIN PASSWORD 'TROQUE_ESTA_SENHA';
GRANT USAGE ON SCHEMA public TO api_leitura;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_leitura;

-- Vale também para tabelas criadas no futuro pelo dono do banco
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO api_leitura;