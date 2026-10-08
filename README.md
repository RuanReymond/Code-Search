# Linguagens Info

Aplicação web para pesquisar e consultar linguagens de programação. O usuário digita um termo de busca e a aplicação exibe as linguagens correspondentes, com descrição, categorias, ano de criação e links para o site oficial, a documentação e a página de download.

## Funcionalidades

- Busca por nome, descrição, categoria ou ano de criação.
- Busca sem distinção de maiúsculas, minúsculas e acentos (por exemplo, `automacao` encontra `Automação`).
- Listagem completa das linguagens ao abrir a página ou ao pesquisar com o campo vazio.
- Exibição de categorias, ano de criação e links úteis em cada resultado.
- Pesquisa pelo botão ou pela tecla Enter.
- Layout responsivo.

## Tecnologias

- HTML5
- CSS3
- JavaScript (sem frameworks ou bibliotecas externas)

## Estrutura do projeto

```
.
├── index.html      # Estrutura da página
├── style.css       # Estilos
├── app.js          # Lógica de busca e renderização dos resultados
├── linguagens.js   # Base de dados das linguagens
└── README.md
```

## Como executar

1. Clone o repositório:

   ```bash
   git clone <url-do-repositorio>
   ```

2. Acesse a pasta do projeto:

   ```bash
   cd <nome-da-pasta>
   ```

3. Abra o arquivo `index.html` no navegador.

Não há dependências para instalar nem etapa de build.

## Como adicionar uma linguagem

As linguagens ficam no array `linguagens`, no arquivo `linguagens.js`. Para incluir uma nova, adicione um objeto seguindo esta estrutura:

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