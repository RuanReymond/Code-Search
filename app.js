function pesquisar() {

    // Obtém a seção onde os resultados serão exibidos
    let section = document.getElementById("resultados-pesquisa");
    console.log(section); // Loga o elemento section no console para verificação

    let campoPesquisa = document.getElementById("campo-pesquisa").value

    console.log(campoPesquisa);

    // se campoPesquisa for uma string sem nada    
    if (!campoPesquisa){
        section.innerHTML = "<p>Nada foi encontrado. Você digitou nenhuma palavra de busca</p>"
        return
    }

    campoPesquisa = campoPesquisa.toLowerCase()

    // Inicializa uma string vazia para armazenar os resultados
    let resultados = "";
    let titulo = "";
    let descricao = "";
    let tags = "";

    // Itera sobre cada dado na array 'dados'
    for (let dado of dados) {
        titulo = dado.titulo.toLowerCase()
        descricao = dado.descricao.toLowerCase()
        tags = dado.tags.toLowerCase()
        // se titulo includes campoPesquisa
        if(titulo.includes(campoPesquisa)|| descricao.includes(campoPesquisa) || tags.includes (campoPesquisa)) {
        // cria um novo elemento
            // Concatena o HTML de cada resultado à string 'resultados'
            resultados += `
                <div class="item-resultado">
                    <h2>
                     <a href="#" target="_blank">${dado.titulo}</a>
                   </h2>
                   <p class="descricao_meta">${dado.descricao}</p>
                   <a href="${dado.link}" target="_blank">${dado.valoresMedios}</a>
             </div>
            `;
        }
    }

    

    if (!resultados) {
        resultados = "<p>Nada foi encontrado</p>"
    }

    // Atribui o HTML completo da lista de resultados à seção
    section.innerHTML = resultados;
}
