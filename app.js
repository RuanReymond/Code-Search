// Guarda a busca em andamento para cancelar quando começar outra
let controladorBusca = null;

// Obtém os filtros de categoria selecionados
function obterFiltrosCategoria() {
    let checkboxes = document.querySelectorAll(".filtro-checkbox:checked");
    let filtros = [];
    checkboxes.forEach(checkbox => {
        filtros.push(checkbox.value);
    });
    return filtros;
}

// Abre ou fecha o painel de filtros
function alternarFiltros() {
    let painel = document.getElementById("filtro-painel");
    let botao = document.getElementById("btn-filtro");

    let aberto = painel.classList.toggle("aberto");
    botao.classList.toggle("ativo", aberto);
    botao.setAttribute("aria-expanded", aberto);
}

// Desmarca todos os filtros e atualiza os resultados
function limparFiltros() {
    document.querySelectorAll(".filtro-checkbox:checked").forEach(checkbox => {
        checkbox.checked = false;
    });
    pesquisar();
}

// Mostra no botão quantos filtros estão marcados
function atualizarContadorFiltros(quantidade) {
    document.getElementById("contador-filtros").textContent = quantidade > 0 ? quantidade : "";
}

// Monta o HTML dos resultados e exibe na página
function exibirResultados(lista) {
    let section = document.getElementById("resultados-pesquisa");

    if (lista.length === 0) {
        section.innerHTML = "<p>Nada foi encontrado</p>";
        return;
    }

    let resultados = "";

    for (let linguagem of lista) {
        // Cria uma etiqueta para cada categoria
        let tagsCategorias = linguagem.categoria
            .map(cat => `<span class="categoria">${escapar(cat)}</span>`)
            .join("");

        // Página de detalhes da linguagem
        let paginaDetalhes = `linguagem.html?slug=${encodeURIComponent(linguagem.slug)}`;

        resultados += `
            <article class="item-resultado">
                <div class="item-topo">
                    <h2><a href="${paginaDetalhes}">${escapar(linguagem.nome)}</a></h2>
                    <span class="ano" title="Ano de criação">${escapar(linguagem.ano)}</span>
                </div>
                <div class="categorias">${tagsCategorias}</div>
                <p class="descricao-meta">${escapar(linguagem.descricao)}</p>
                <div class="links">
                    <a href="${escapar(linguagem.site)}" target="_blank" rel="noopener noreferrer">Site oficial</a>
                    <a href="${escapar(linguagem.documentacao)}" target="_blank" rel="noopener noreferrer">Documentação</a>
                    <a href="${escapar(linguagem.download)}" target="_blank" rel="noopener noreferrer">Download</a>
                </div>
                <a class="ver-detalhes" href="${paginaDetalhes}">Ver detalhes</a>
            </article>
        `;
    }

    section.innerHTML = resultados;
}

// Busca as linguagens na API usando o termo digitado e as categorias marcadas
async function pesquisar() {
    let section = document.getElementById("resultados-pesquisa");

    let termo = document.getElementById("campo-pesquisa").value.trim();
    let filtrosCategoria = obterFiltrosCategoria();
    atualizarContadorFiltros(filtrosCategoria.length);

    // Monta a query string: ?search=...&categoria=Backend,IA
    let parametros = new URLSearchParams();
    if (termo) {
        parametros.set("search", termo);
    }
    if (filtrosCategoria.length > 0) {
        parametros.set("categoria", filtrosCategoria.join(","));
    }

    // Cancela a busca anterior, se ainda estiver em andamento
    if (controladorBusca) {
        controladorBusca.abort();
    }
    controladorBusca = new AbortController();

    try {
        let resposta = await fetch(`${API_URL}?${parametros}`, {
            signal: controladorBusca.signal
        });

        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status} ao consultar a API`);
        }

        let json = await resposta.json();
        exibirResultados(json.data);
    } catch (erro) {
        // Busca cancelada de propósito: não é erro
        if (erro.name === "AbortError") {
            return;
        }
        console.error(erro);
        section.innerHTML = "<p>Não foi possível carregar as linguagens. Verifique se o servidor está rodando (<code>npm start</code> na pasta backend).</p>";
    }
}

// Permite pesquisar apertando Enter no campo de busca
document.getElementById("campo-pesquisa").addEventListener("keydown", function (evento) {
    if (evento.key === "Enter") {
        pesquisar();
    }
});

// Mostra todas as linguagens ao abrir a página
pesquisar();