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

**Hospedagem (planos gratuitos)**
- GitHub Pages: frontend
- Render: API
- Neon: banco de dados

## Estrutura do projeto

```
.
├── index.html            # Estrutura da página
├── style.css             # Estilos
├── app.js                # Interface: consome a API e exibe os resultados
├── comum.js              # URL da API e funções compartilhadas
├── linguagem.html        # Página de detalhes da linguagem
├── linguagem.js          # Carrega detalhes e projetos do GitHub
├── detalhes.css          # Estilos da página de detalhes
├── README.md
├── .gitignore
├── env.example           # Exemplo de configuração do backend
└── backend
    ├── server.js         # API (Express)
    ├── db.js             # Conexão com o banco e cache das linguagens
    ├── package.json
    ├── package-lock.json
    ├── scripts
    │   ├── schema.sql            # Criação das tabelas
    │   ├── seed.js               # Copia as linguagens do languages.js para o banco
    │   └── usuario-leitura.sql   # Usuário somente leitura para a API
    └── data
        └── languages.js  # Dados originais (usados para popular o banco)
```

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior

### 1. Clone o repositório

```bash
git clone https://github.com/RuanReymond/Code-Search.git
cd Code-Search
```

### 2. Configure o banco de dados

A API lê as linguagens de um banco PostgreSQL na nuvem (Neon). Crie o banco seguindo a seção [Banco de dados e publicação](#banco-de-dados-e-publicação), copie o endereço de conexão e salve em `backend/.env` (veja o `env.example`).

Com o `.env` pronto, crie as tabelas e envie as linguagens ao banco (uma única vez):

```bash
cd backend
npm install
npm run seed
```

### 3. Inicie o backend

```bash
cd backend
npm install
npm start
```

A API ficará disponível em `http://localhost:3000`. Para configurá-la, crie `backend/.env` a partir de `env.example` (por exemplo, no PowerShell, use `Copy-Item ..\env.example .env`):

```env
PORT=3000
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
FRONTEND_URL=
GITHUB_TOKEN=
```

| Variável       | Descrição                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------- |
| `PORT`         | Porta da API (padrão: `3000`; no Render é definida automaticamente)                               |
| `DATABASE_URL` | Endereço de conexão do banco no Neon (obrigatório)                                                |
| `FRONTEND_URL` | Sites autorizados a usar a API, separados por vírgula e sem barra no final. Vazio em desenvolvimento |
| `GITHUB_TOKEN` | Opcional. Autentica as consultas ao GitHub e amplia o limite de requisições                       |

Não publique o arquivo `.env` nem o token.

Durante o desenvolvimento, `npm run dev` reinicia o servidor automaticamente a cada alteração.

### 4. Abra o frontend

Com o servidor rodando, abra `index.html` no navegador ou use a extensão Live Server do VS Code. A partir da busca, selecione uma linguagem para abrir sua página de detalhes e carregar os projetos do GitHub.

> No computador (localhost) o frontend usa a API local. No site publicado ele usa o endereço definido em `API_PUBLICA`, no `comum.js`, que deve apontar para a API no Render.

## Banco de dados e publicação

O frontend fica no GitHub Pages, a API Express no [Render](https://render.com) e as linguagens em um banco PostgreSQL no [Neon](https://neon.com), todos em planos gratuitos.

```
GitHub Pages (frontend)  ->  Render (API)  ->  Neon (PostgreSQL)
```

### Tabelas

- `linguagens`: nome, slug, descrição, ano e links.
- `categorias`: lista de categorias.
- `linguagem_categoria`: liga linguagens a categorias (muitos para muitos) e guarda a ordem em que aparecem.

A criação está em `backend/scripts/schema.sql`. A API carrega as linguagens do banco, guarda o resultado em memória por 10 minutos e, se o banco ficar indisponível, continua respondendo com os últimos dados conhecidos.

### 1. Banco no Neon

1. Crie uma conta e um projeto no Neon, escolhendo a região mais próxima.
2. No painel, abra a opção de conexão (*Connect*) e copie o endereço de conexão. Ele é uma senha: guarde apenas em `backend/.env` e nas variáveis do Render.
3. Em `backend`, rode `npm run seed` para criar as tabelas e enviar as linguagens.
4. No editor SQL do Neon, execute `backend/scripts/usuario-leitura.sql` (trocando a senha). Esse usuário só consegue ler os dados e é o que a API usa em produção. O endereço de conexão dele é igual ao do dono, trocando usuário e senha.

### 2. API no Render

1. Crie um *Web Service* a partir do repositório do GitHub.
2. Configure: **Root Directory** `backend`, **Build Command** `npm install`, **Start Command** `npm start`, **Instance Type** `Free` e **Health Check Path** `/health`.
3. Em *Environment*, adicione `DATABASE_URL` (do usuário somente leitura) e `FRONTEND_URL` (`https://ruanreymond.github.io`). Adicione também `GITHUB_TOKEN`, se quiser.
4. Copie o endereço do serviço (`https://seu-servico.onrender.com`) e coloque em `API_PUBLICA`, no `comum.js`, terminando com `/api/languages`.

### Observações sobre os planos gratuitos

- A API "dorme" após alguns minutos sem acessos e leva cerca de 1 minuto para acordar. O site mostra um aviso nesse caso.
- Os limites e as regras dos planos mudam; confira nas páginas oficiais do Neon e do Render.

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