# Code Search

Aplicação web para pesquisar e explorar linguagens de programação. O frontend consome uma API própria (Node.js + Express) que retorna as linguagens com descrição, categorias, ano de criação e links para o site oficial, a documentação e a página de download.

## Funcionalidades

- Busca por nome, descrição, categoria ou ano de criação.
- Busca sem distinção de maiúsculas, minúsculas e acentos (por exemplo, `automacao` encontra `Automação`).
- Filtro por categorias, com painel recolhível e contador de filtros ativos.
- Combinação de busca por termo e filtro de categorias.
- Pesquisa pelo botão ou pela tecla Enter.
- API REST com busca, filtro por categoria e consulta por slug.
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
├── index.html            # Estrutura da página
├── style.css             # Estilos
├── app.js                # Interface: consome a API e exibe os resultados
├── README.md
├── .gitignore
└── backend
    ├── server.js         # API (Express)
    ├── package.json
    ├── package-lock.json
    ├── .env.example      # Exemplo de variáveis de ambiente
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

A API ficará disponível em `http://localhost:3000`. Para alterar a porta, copie o arquivo `.env.example` para `.env` e edite o valor de `PORT`.

Durante o desenvolvimento, `npm run dev` reinicia o servidor automaticamente a cada alteração.

### 3. Abra o frontend

Com o servidor rodando, abra o arquivo `index.html` no navegador (ou use a extensão Live Server do VS Code).

> O endereço da API fica na constante `API_URL`, no início do `app.js`. Se mudar a porta ou publicar o backend, atualize esse valor.

## API

Base: `http://localhost:3000`

| Método | Rota                          | Descrição                                      |
| ------ | ----------------------------- | ---------------------------------------------- |
| GET    | `/`                           | Informações e lista de endpoints               |
| GET    | `/api/languages`              | Lista todas as linguagens                      |
| GET    | `/api/languages?search=termo` | Busca por nome, descrição, categoria ou ano    |
| GET    | `/api/languages?categoria=Backend,IA` | Filtra por uma ou mais categorias      |
| GET    | `/api/languages/:slug`        | Retorna uma linguagem pelo slug                |

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

Uma linguagem inexistente em `/api/languages/:slug` retorna status `404` com `{ "error": "Linguagem nao encontrada" }`.

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

Reinicie o servidor para aplicar a alteração. Se usar uma categoria nova, adicione também o checkbox correspondente no painel de filtros do `index.html`.

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

Python, JavaScript, Java, C#, PHP e TypeScript.

## Contribuição

Sugestões e melhorias são bem-vindas. Para contribuir, abra uma issue descrevendo a proposta ou envie um pull request.

## Contato

Dúvidas ou suporte: reymondruan4@gmail.com