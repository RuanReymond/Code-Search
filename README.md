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

## Estrutura do projeto

```
.
├── README.md
├── .gitignore
├── env.example           # Exemplo de configuração do backend
├── public
│   ├── pages
│   │   ├── index.html     # Página de busca
│   │   └── linguagem.html # Página de detalhes da linguagem
│   ├── scripts
│   │   ├── app.js         # Interface de busca
│   │   ├── comum.js       # URL da API e funções compartilhadas
│   │   └── linguagem.js   # Detalhes e projetos do GitHub
│   └── styles
│       ├── style.css     # Estilos gerais
│       └── detalhes.css  # Estilos da página de detalhes
└── backend
    ├── server.js         # API (Express)
    ├── package.json
    ├── package-lock.json
    └── data
        └── languages.js  # Base de dados das linguagens
```

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior

### 1. Clone o repositório

```bash
git clone https://github.com/RuanReymond/Code-Search.git
cd Code-Search
```

### 2. Inicie o backend

```bash
cd backend
npm install
npm start
```

A API ficará disponível em `http://localhost:3000`. A porta padrão pode ser alterada pela variável `PORT`. Opcionalmente, configure `GITHUB_TOKEN` para autenticar as consultas à API do GitHub e ampliar o limite de requisições. Para isso, crie `backend/.env` a partir de `env.example` (por exemplo, no PowerShell, use `Copy-Item ..\env.example .env`) e adicione o token:

```env
PORT=3000
GITHUB_TOKEN=seu_token
```

O token é opcional para desenvolvimento local. Não publique o token nem o arquivo `.env`.

Durante o desenvolvimento, `npm run dev` reinicia o servidor automaticamente a cada alteração.

### 3. Abra o frontend

Com o servidor rodando, abra `public/pages/index.html` no navegador ou use a extensão Live Server do VS Code. A partir da busca, selecione uma linguagem para abrir sua página de detalhes e carregar os projetos do GitHub.

> O endereço da API fica na constante `API_URL`, em `public/scripts/comum.js`. Se mudar a porta ou publicar o backend, atualize esse valor. O GitHub Pages pode hospedar o frontend, mas a API Node.js precisa ser hospedada separadamente; configure `API_URL` com o endereço público da API.

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

As linguagens ficam em `backend/data/languages.js`. Para incluir uma nova, adicione um objeto ao array seguindo esta estrutura:

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

Reinicie o servidor para aplicar a alteração. Se usar uma categoria nova, adicione também o checkbox correspondente no painel de filtros do `index.html`. Para habilitar a consulta do GitHub para uma linguagem nova, adicione o slug e o nome reconhecido pelo GitHub ao objeto `githubLanguageNames` em `backend/server.js`.

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
