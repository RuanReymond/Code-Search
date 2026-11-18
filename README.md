# 🔎 Code Search

**Explore linguagens de programação, descubra tecnologias e encontre projetos reais no GitHub.**

O **Code Search** é uma aplicação web desenvolvida para facilitar a pesquisa e a exploração de diferentes linguagens de programação. A plataforma reúne informações sobre cada linguagem, como descrição, ano de criação, categorias e links oficiais, além de apresentar estatísticas e projetos populares encontrados no GitHub.

🌐 **Acesse o projeto:** [Code Search](https://code-search-lyart.vercel.app/)

📂 **Repositório:** [RuanReymond/Code-Search](https://github.com/RuanReymond/Code-Search)

---

## 📸 Sobre o projeto

O objetivo do Code Search é oferecer uma maneira simples e intuitiva de conhecer linguagens de programação e explorar seu ecossistema.

Além das informações cadastradas no banco de dados, a aplicação utiliza uma integração com a API do GitHub para apresentar dados atualizados sobre repositórios públicos relacionados à linguagem selecionada.

### ✨ Funcionalidades

- **Pesquisa de linguagens:** encontre linguagens pelo nome, descrição, categoria ou ano de criação.
- **Filtros por categoria:** explore tecnologias de acordo com suas áreas de aplicação.
- **Página de detalhes:** consulte informações, características e links oficiais de cada linguagem.
- **Integração com GitHub:** visualize estatísticas e repositórios populares relacionados à linguagem.
- **Estatísticas:** consulte quantidade de repositórios, projetos com mais de 1.000 estrelas e novos repositórios no último ano.
- **Principais projetos:** explore repositórios com informações sobre estrelas, forks e última atualização.

---

## 🛠️ Tecnologias utilizadas

O projeto foi desenvolvido utilizando tecnologias de frontend e backend, além de serviços externos para hospedagem e integração de dados.

| Tecnologia | Utilização |
|---|---|
| HTML5 | Estrutura das páginas |
| CSS3 | Estilização e responsividade |
| JavaScript | Funcionalidades e interatividade |
| Node.js | Ambiente de execução do backend |
| Express | Desenvolvimento da API REST |
| PostgreSQL | Armazenamento dos dados |
| Neon | Hospedagem do banco de dados |
| GitHub REST API | Consulta de estatísticas e repositórios |
| Vercel | Hospedagem e publicação da aplicação |

## ⚙️ Como funciona?

O Code Search possui uma arquitetura dividida entre frontend, backend e banco de dados.

1. O usuário realiza uma pesquisa pela interface da aplicação.
2. O frontend envia uma requisição para a API REST desenvolvida com Node.js e Express.
3. A API consulta o banco de dados PostgreSQL hospedado no Neon e retorna as informações correspondentes.
4. Ao acessar os detalhes de uma linguagem, o backend também consulta a API do GitHub.
5. Os resultados são organizados e apresentados na interface.

### Arquitetura

```text
                  USUARIO
                     |
                     v
             FRONTEND (HTML/CSS/JS)
                     |
                     v
              API REST PROPRIA
               (Node.js/Express)
                  /       \
                 /         \
                v           v
          BANCO DE       GITHUB API
          DADOS NEON
          (PostgreSQL)
```

## 🚀 Executar localmente

Para executar o projeto em sua máquina, é necessário ter o [Node.js](https://nodejs.org/) instalado e configurar uma conexão com PostgreSQL.

### 1. Clone o repositório

```bash
git clone https://github.com/RuanReymond/Code-Search.git
```

Entre na pasta:

```bash
cd Code-Search
```

### 2. Instale as dependências

Na raiz do projeto:

```bash
npm install
npm --prefix backend install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` dentro da pasta `backend`:

```env
DATABASE_URL=sua_connection_string_postgresql
GITHUB_TOKEN=seu_token_github
PORT=3000
```

- `DATABASE_URL`: endereço de conexão com o banco PostgreSQL.
- `GITHUB_TOKEN`: token de acesso pessoal do GitHub (opcional).
- `PORT`: porta utilizada pelo servidor local.

**Importante:** nunca compartilhe ou envie seu arquivo `.env` para o GitHub. Utilize o `env.example` como referência e mantenha suas credenciais protegidas.

### 4. Prepare o banco de dados

Na pasta `backend`, execute:

```bash
npm run seed
```

Esse comando prepara as tabelas e insere os dados das linguagens no banco de dados configurado.

### 5. Inicie o servidor

Ainda na pasta `backend`:

```bash
npm start
```

A API estará disponível em:

```text
http://localhost:3000
```

Com o backend em execução, abra o frontend utilizando uma extensão como Live Server.

---

## 🔗 Endpoints da API

A aplicação possui uma API REST própria para disponibilizar as informações das linguagens.

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/api/languages` | Lista as linguagens disponíveis |
| GET | `/api/languages?search=python` | Pesquisa por uma linguagem |
| GET | `/api/languages?categoria=Backend` | Filtra por categoria |
| GET | `/api/languages/:slug` | Consulta os detalhes de uma linguagem |
| GET | `/api/languages/:slug/github` | Consulta dados e repositórios do GitHub |
| GET | `/health` | Verifica o funcionamento da API |

## 📌 Próximos passos

O Code Search continuará recebendo melhorias e novas funcionalidades. A ideia é expandir a plataforma, aprimorar a experiência de pesquisa e adicionar novos recursos para tornar a exploração de linguagens de programação ainda mais completa.

---

**Desenvolvido por Ruan Reymond** 💻

[GitHub](https://github.com/RuanReymond) · [LinkedIn](www.linkedin.com/in/ruan-reymond-b9605a2ba)