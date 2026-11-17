# Code Search

Aplicação web para pesquisar e explorar linguagens de programação. O frontend consome uma API própria (Node.js + Express) para exibir dados das linguagens e, na página de detalhes, estatísticas e projetos populares do GitHub.

## Funcionalidades

- Busca por nome, descrição, categoria ou ano de criação.
- Busca sem distinção de maiúsculas, minúsculas e acentos (por exemplo, `automacao` encontra `Automação`).
- Filtro por categorias, com painel recolhível e contador de filtros ativos.
- Combinação de busca por termo e filtro de categorias.
- Pesquisa pelo botão ou pela tecla Enter.
- API REST com busca, filtro por categoria e consulta por slug.
- Página de detalhes para cada linguagem, com projetos e estatísticas do GitHub.
- Cache em memória das respostas do GitHub para reduzir chamadas e evitar atingir o limite da API.
- Layout responsivo.

## Tecnologias

**Frontend**
- HTML5
- CSS3
- JavaScript (sem frameworks)

**Backend**
- Node.js
- Express
- CORS
- dotenv
- PostgreSQL (hospedado no Neon), com o driver `pg`

**Hospedagem**
- Vercel: frontend estático e API serverless
- Neon: banco de dados PostgreSQL

## Estrutura do projeto

```
.
├── api/
│   └── [...path].js             # Entrada serverless do Vercel
├── backend/
│   ├── data/languages.js        # Dados usados pelo seed
│   ├── db.js                    # Conexao PostgreSQL e cache
│   ├── server.js                # API Express
│   ├── package.json
│   └── scripts/
│       ├── schema.sql
│       ├── seed.js
│       └── usuario-leitura.sql
├── public/
│   ├── pages/linguagem.html
│   ├── scripts/
│   └── styles/
├── scripts/build.js             # Copia index.html para a pasta publicada
├── index.html                   # Pagina inicial fonte
├── package.json
├── vercel.json
├── env.example
└── .gitignore
```

## Como executar localmente

### 1. Configure o banco de dados

Crie um projeto PostgreSQL no Neon. Para preparar o banco, use a connection string da role proprietária (`neondb_owner`) no arquivo `backend/.env`:

```env
DATABASE_URL=postgresql://USUARIO:SENHA@HOST/NEONDB?sslmode=require
GITHUB_TOKEN=
PORT=3000
```

Não publique o arquivo `backend/.env` nem compartilhe sua connection string.

No terminal:

```bash
cd backend
npm install
npm run seed
```

O comando cria as tabelas e insere/atualiza as 45 linguagens do arquivo `backend/data/languages.js`. Pode ser executado novamente sem duplicar linguagens.

### 2. Inicie a API

Ainda dentro de `backend`:

```bash
npm start
```

A API local fica em `http://localhost:3000`.

### 3. Abra o frontend

Use o Live Server do VS Code na raiz do projeto (ou outro servidor estático). O frontend detecta `localhost` e consulta `http://localhost:3000/api/languages`.

## Banco de dados e publicação no Vercel

A arquitetura publicada e:

```
Vercel (frontend + API serverless)  ->  Neon (PostgreSQL)
```

### 1. Preparar o Neon

1. Use a connection string direta da role `neondb_owner` somente para executar `npm run seed`.
2. No SQL Editor do Neon, execute `backend/scripts/usuario-leitura.sql`, substituindo `TROQUE_ESTA_SENHA` por uma senha forte e exclusiva.
3. Gere a connection string da role `api_leitura` com **Connection pooling** ativado. Use essa URL na aplicação publicada.
4. A role `api_leitura` precisa de permissão `USAGE` no schema `public` e `SELECT` nas tabelas.

Use a conexão direta para tarefas administrativas/seed e a conexão com pooler para a API serverless.

### 2. Publicar no Vercel

1. Envie as alterações para o GitHub e importe o repositorio no Vercel.
2. Configure:
   - **Framework Preset:** Other
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `public`
   - **Install Command:** `npm install`
3. Em **Environment Variables**, adicione:
   - `DATABASE_URL`: connection string pooled da role `api_leitura`.
   - `GITHUB_TOKEN`: opcional; token do GitHub para ampliar o limite de consultas.
   - `NODE_ENV`: `production`.
4. Faça o deploy.

O script `scripts/build.js` copia o `index.html` da raiz para `public/index.html`, que e a pasta publicada. A API serverless fica em `api/[...path].js` e reutiliza as rotas do Express em `backend/server.js`.

No Vercel, o frontend usa `/api/languages`, ou seja, chama a API no mesmo domínio. Localmente, continua usando `http://localhost:3000/api/languages`.

### 3. Testar a publicação

Depois do deploy, teste:

- `/` — página inicial.
- `/api/languages` — lista de linguagens.
- `/api/languages?search=python` — busca.
- `/api/languages/python` — detalhes.
- `/api/languages/python/github` — estatísticas e repositórios do GitHub.

### Segurança

- Nunca envie `backend/.env` ao GitHub.
- Mantenha a connection string de `neondb_owner` apenas para tarefas administrativas.
- Use `api_leitura` na aplicação publicada.
- Nao coloque senhas reais em `backend/scripts/usuario-leitura.sql`.
- Se uma senha ou connection string for publicada por engano, troque-a imediatamente no Neon.

## API

Base: `http://localhost:3000`

| Método | Rota                          | Descrição                                      |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/`                           | Informações e lista de endpoints               |
| GET    | `/api/languages`              | Lista todas as linguagens                      |
| GET    | `/api/languages?search=termo` | Busca por nome, descrição, categoria ou ano    |
| GET    | `/api/languages?categoria=Backend,IA` | Filtra por uma ou mais categorias      |
| GET    | `/api/languages/:slug`        | Retorna os detalhes de uma linguagem pelo slug |
| GET    | `/api/languages/:slug/github` | Retorna estatísticas e até 10 repositórios populares no GitHub |

Exemplo de busca de repositórios Python:

```
GET /api/languages/python/github
```

A rota do GitHub aceita as linguagens listadas em `backend/data/languages.js`. Bash é pesquisado pela categoria `Shell`, que é como o GitHub classifica essa linguagem.

Os parâmetros `search` e `categoria` podem ser combinados. Exemplo:

```
GET /api/languages?search=java&categoria=Mobile
```

Resposta:

```json
{
  "total": 2,
  "data": [
    {
      "id": 2,
      "nome": "JavaScript",
      "slug": "javascript",
      "descricao": "...",
      "categoria": ["Frontend", "Backend", "Mobile"],
      "ano": 1995,
      "site": "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript",
      "documentacao": "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript",
      "download": "https://nodejs.org/pt/download"
    }
  ]
}
```

Uma linguagem inexistente em `/api/languages/:slug` retorna status `404` com `{ "error": "Linguagem nao encontrada" }`. A rota do GitHub retorna `404` se o slug não tiver mapeamento e `502` se não for possível consultar o GitHub. Se o limite de requisições do GitHub for atingido, a API retorna `429`.

### Resposta do endpoint do GitHub

`GET /api/languages/python/github` retorna os dez repositórios mais populares (ordenados por estrelas), além de estatísticas. `total` é a quantidade de repositórios na lista retornada; `stats.totalRepositories` é o total informado pela busca do GitHub. As contagens das estatísticas secundárias podem ser `null` se o GitHub não permitir essas consultas.

```json
{
  "language": "Python",
  "total": 10,
  "stats": {
    "totalRepositories": 123456,
    "repositoriesOver1000Stars": 500,
    "newRepositoriesLastYear": 12000
  },
  "searchUrl": "https://github.com/search?q=language%3APython&type=repositories&s=stars&o=desc",
  "data": [
    {
      "name": "organizacao/projeto",
      "description": "Descrição do projeto",
      "stars": 50000,
      "forks": 8000,
      "url": "https://github.com/organizacao/projeto",
      "language": "Python",
      "updatedAt": "2026-10-01T12:00:00Z"
    }
  ]
}
```

As respostas completas do GitHub ficam em cache por 30 minutos. Se alguma das consultas secundárias falhar, a resposta parcial fica em cache por 1 minuto.

## Como adicionar uma linguagem

As linguagens ficam no banco de dados. O arquivo `backend/data/languages.js` é a fonte usada para popular o banco: para incluir uma nova, adicione um objeto ao array seguindo esta estrutura:

```js
{
    id: 7,
    nome: "Go",
    slug: "go",
    descricao: "Descrição da linguagem.",
    categoria: ["Backend", "Cloud"],
    ano: 2009,
    site: "https://go.dev/",
    documentacao: "https://go.dev/doc/",
    download: "https://go.dev/dl/"
}
```

Depois rode `npm run seed` (com o `DATABASE_URL` do dono do banco) para enviar a alteração ao banco. A API atualiza em até 10 minutos, ou imediatamente se o servidor for reiniciado. Se usar uma categoria nova, adicione também o checkbox correspondente no painel de filtros do `index.html`. Para habilitar a consulta do GitHub para uma linguagem nova, adicione o slug e o nome reconhecido pelo GitHub ao objeto `githubLanguageNames` em `backend/server.js`.

| Campo          | Tipo     | Descrição                                      |
| -------------- | -------- | ---------------------------------------------- |
| `id`           | número   | Identificador único                            |
| `nome`         | texto    | Nome da linguagem                              |
| `slug`         | texto    | Identificador em formato de URL                |
| `descricao`    | texto    | Resumo sobre a linguagem e seus usos           |
| `categoria`    | lista    | Áreas de atuação (ex.: Backend, Frontend, IA)  |
| `ano`          | número   | Ano de criação                                 |
| `site`         | texto    | Link do site oficial                           |
| `documentacao` | texto    | Link da documentação                           |
| `download`     | texto    | Link da página de download                     |

## Linguagens incluídas

45 linguagens, incluindo Python, JavaScript, Java, C#, PHP, TypeScript, C, C++, Go, Rust, SQL, Bash e PowerShell.

## Contribuição

Sugestões e melhorias são bem-vindas. Para contribuir, abra uma issue descrevendo a proposta ou envie um pull request.

## Contato

Dúvidas ou suporte: reymondruan4@gmail.com