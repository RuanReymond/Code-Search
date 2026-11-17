-- Usuario somente leitura usado pela API em producao.
-- Substitua TROQUE_ESTA_SENHA por uma senha forte e exclusiva antes de executar.
-- Se api_leitura ja existir, este script atualiza a senha e reaplica as permissoes.
-- Nao salve a senha real neste arquivo nem envie este arquivo com a senha preenchida ao GitHub.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'api_leitura') THEN
    ALTER ROLE api_leitura WITH LOGIN PASSWORD 'TROQUE_ESTA_SENHA';
  ELSE
    CREATE ROLE api_leitura WITH LOGIN PASSWORD 'TROQUE_ESTA_SENHA';
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO api_leitura;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_leitura;

-- Aplica-se as tabelas futuras criadas pelo usuario que executar este script.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT ON TABLES TO api_leitura;
