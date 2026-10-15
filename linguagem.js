// Slug da linguagem, vindo da URL: linguagem.html?slug=python
const slug = new URLSearchParams(window.location.search).get("slug");

const blocoInfo = document.getElementById("detalhe-info");
const blocoGithub = document.getElementById("detalhe-github");

// 1234567 -> "1.234.567"
function formatarNumero(numero) {
    return Number(numero).toLocaleString("pt-BR");
}

// "2026-10-15T18:31:49Z" -> "15/10/2026"
function formatarData(data) {
    return new Date(data).toLocaleDateString("pt-BR");
}

// Mostra os dados da linguagem (descrição, categorias e botões)
function exibirLinguagem(linguagem) {
    document.title = `${linguagem.nome} - Code Search`;

    let categorias = linguagem.categoria
        .map(cat => `<span class="categoria">${escapar(cat)}</span>`)
        .join("");

    blocoInfo.innerHTML = `
        <h2>
            ${escapar(linguagem.nome)}
            <span class="ano">criada em ${escapar(linguagem.ano)}</span>
        </h2>
        <div class="categorias">${categorias}</div>
        <p class="descricao">${escapar(linguagem.descricao)}</p>
        <div class="botoes">
            <a class="btn-link" href="${escapar(linguagem.site)}" target="_blank" rel="noopener noreferrer">Site oficial</a>
            <a class="btn-link" href="${escapar(linguagem.documentacao)}" target="_blank" rel="noopener noreferrer">Documentação</a>
            <a class="btn-link" href="${escapar(linguagem.download)}" target="_blank" rel="noopener noreferrer">Download</a>
        </div>
    `;
}

// Monta um quadradinho de estatística
function estatistica(valor, descricao) {
    return `
        <div class="estatistica">
            <strong>${escapar(valor)}</strong>
            <span>${escapar(descricao)}</span>
        </div>
    `;
}

// Mostra os dados do GitHub (números e principais projetos)
function exibirGithub(dados) {
    let stats = dados.stats;
    let estrelasTop = dados.data.reduce((soma, repo) => soma + repo.stars, 0);

    let estatisticas = estatistica(formatarNumero(stats.totalRepositories), `repositórios em ${dados.language}`);

    if (stats.repositoriesOver1000Stars !== null) {
        estatisticas += estatistica(formatarNumero(stats.repositoriesOver1000Stars), "projetos com mais de 1.000 estrelas");
    }
    if (stats.newRepositoriesLastYear !== null) {
        estatisticas += estatistica(formatarNumero(stats.newRepositoriesLastYear), "novos repositórios no último ano");
    }
    estatisticas += estatistica(formatarNumero(estrelasTop), `estrelas somadas nos ${dados.data.length} principais projetos`);

    let repositorios = dados.data.map(repo => `
        <li class="repo">
            <a href="${escapar(repo.url)}" target="_blank" rel="noopener noreferrer">${escapar(repo.name)}</a>
            <p>${repo.description ? escapar(repo.description) : "Sem descrição"}</p>
            <div class="repo-meta">
                <span>&#9733; ${formatarNumero(repo.stars)} estrelas</span>
                <span>${formatarNumero(repo.forks)} forks</span>
                <span>Atualizado em ${formatarData(repo.updatedAt)}</span>
            </div>
        </li>
    `).join("");

    blocoGithub.innerHTML = `
        <h3>${escapar(dados.language)} no GitHub</h3>
        <div class="estatisticas">${estatisticas}</div>
        <p class="nota">Considera repositórios públicos cuja linguagem principal é ${escapar(dados.language)}.</p>
        <h3>Principais projetos</h3>
        <ol class="repos">${repositorios}</ol>
        <div class="botoes">
            <a class="btn-link" href="${escapar(dados.searchUrl)}" target="_blank" rel="noopener noreferrer">Ver todos no GitHub</a>
        </div>
    `;
}

// Mensagem de erro do bloco do GitHub, com botão para tentar de novo
function exibirErroGithub(mensagem) {
    blocoGithub.innerHTML = `
        <h3>GitHub</h3>
        <p>${escapar(mensagem)}</p>
        <div class="botoes">
            <button type="button" class="btn-link" onclick="carregarGithub()">Tentar novamente</button>
        </div>
    `;
}

async function carregarLinguagem() {
    try {
        let resposta = await fetch(`${API_URL}/${encodeURIComponent(slug)}`);

        if (resposta.status === 404) {
            blocoInfo.innerHTML = "<p>Linguagem não encontrada.</p>";
            blocoGithub.style.display = "none";
            return;
        }
        if (!resposta.ok) {
            throw new Error(`Erro ${resposta.status} ao consultar a API`);
        }

        exibirLinguagem(await resposta.json());
    } catch (erro) {
        console.error(erro);
        blocoInfo.innerHTML = "<p>Não foi possível carregar a linguagem. Verifique se o servidor está rodando (<code>npm start</code> na pasta backend).</p>";
        blocoGithub.style.display = "none";
    }
}

async function carregarGithub() {
    blocoGithub.innerHTML = "<p>Carregando dados do GitHub...</p>";

    try {
        let resposta = await fetch(`${API_URL}/${encodeURIComponent(slug)}/github`);

        if (!resposta.ok) {
            let erro = await resposta.json().catch(() => ({}));
            exibirErroGithub(erro.error || "Não foi possível carregar os dados do GitHub.");
            return;
        }

        exibirGithub(await resposta.json());
    } catch (erro) {
        console.error(erro);
        exibirErroGithub("Não foi possível conectar com a API.");
    }
}

if (!slug) {
    blocoInfo.innerHTML = "<p>Nenhuma linguagem foi selecionada. Volte para a busca e escolha uma.</p>";
    blocoGithub.style.display = "none";
} else {
    carregarLinguagem();
    carregarGithub();
}
