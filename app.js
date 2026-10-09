// Remove acentos e deixa em minúsculas (assim "automacao" encontra "Automação")
function normalizar(texto) {
    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

// Obtém os filtros de categoria selecionados
function obterFiltrosCategoria() {
    let checkboxes = document.querySelectorAll(".filtro-checkbox:checked");
    let filtros = [];
    checkboxes.forEach(checkbox => {
        filtros.push(checkbox.value);
    });
    return filtros;
}

function pesquisar() {

    // Obtém a seção onde os resultados serão exibidos
    let section = document.getElementById("resultados-pesquisa");

    let campoPesquisa = document.getElementById("campo-pesquisa").value;

    // Se o campo estiver vazio, mostra todas as linguagens
    let termo = normalizar(campoPesquisa).trim();

    // Obtém os filtros de categoria selecionados
    let filtrosCategoria = obterFiltrosCategoria();

    // Inicializa uma string vazia para armazenar os resultados
    let resultados = "";

    // Itera sobre cada linguagem do array 'linguagens'
    for (let linguagem of linguagens) {
        let nome = normalizar(linguagem.nome);
        let descricao = normalizar(linguagem.descricao);
        let categorias = normalizar(linguagem.categoria.join(" "));
        let ano = String(linguagem.ano);

        // Verifica se a linguagem corresponde ao termo de busca
        let correspondeTermo = 
            termo === "" ||
            nome.includes(termo) ||
            descricao.includes(termo) ||
            categorias.includes(termo) ||
            ano.includes(termo);

        // Verifica se a linguagem possui alguma das categorias filtradas
        let correspondeCategoria = filtrosCategoria.length === 0 || 
            filtrosCategoria.some(filtro => linguagem.categoria.includes(filtro));

        // Se corresponder ao termo E às categorias
        if (correspondeTermo && correspondeCategoria) {
            // Cria uma etiqueta para cada categoria
            let tagsCategorias = linguagem.categoria
                .map(cat => `<span class="categoria">${cat}</span>`)
                .join("");

            // Concatena o HTML de cada resultado à string 'resultados'
            resultados += `
                <div class="item-resultado">
                    <h2>
                        <a href="${linguagem.site}" target="_blank">${linguagem.nome}</a>
                        <span class="ano">${linguagem.ano}</span>
                    </h2>
                    <div class="categorias">${tagsCategorias}</div>
                    <p class="descricao-meta">${linguagem.descricao}</p>
                    <div class="links">
                        <a href="${linguagem.site}" target="_blank">Site oficial</a>
                        <a href="${linguagem.documentacao}" target="_blank">Documentação</a>
                        <a href="${linguagem.download}" target="_blank">Download</a>
                    </div>
                </div>
            `;
        }
    }

    if (!resultados) {
        resultados = "<p>Nada foi encontrado</p>";
    }

    // Atribui o HTML completo da lista de resultados à seção
    section.innerHTML = resultados;
}

// Permite pesquisar apertando Enter no campo de busca
document.getElementById("campo-pesquisa").addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        pesquisar();
    }
});

// Mostra todas as linguagens ao abrir a página
pesquisar();