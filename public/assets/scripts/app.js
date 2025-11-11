const API_URL = "http://localhost:3000/conceitos"; 
let dados = []; 
let myCharts = {}; 
function generateColors(count) {
    const colors = [ 
        '#ee3573', 
        '#9d4edd', 
        '#13fca7', 
        '#ff99c8', 
        '#d181ff', 
        '#4edd9d', 
        '#e0b8ff', 
        '#ff6699', 
        '#fc7a13', 
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
}

async function carregarDados() {
    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        dados = await resposta.json();
        renderizarCards();
        renderizarDetalhes();
        renderizarTabelaGerenciamento();
        renderizarGraficos(); 
    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        if (document.getElementById('grafico-categoria')) {
             document.getElementById('alerta-dados').style.display = 'block';
        }
    }
}

function renderizarCards() {
    const containerCards = document.getElementById('cards-container');

    if (containerCards) { 
        let htmlCards = '';

        dados.forEach(item => {
            htmlCards += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 p-3 text-center">
                        <img src="${item.imagem}" class="card-img-top rounded mb-3" alt="${item.titulo}"> 
                        <h3 class="mb-2">${item.titulo}</h3>
                        <p>${item.descricao}</p>
                        <a href="detalhes.html?id=${item.id}" class="btn mt-auto" style="background-color: #9d4edd; color: #fff;">
                            Saiba Mais
                        </a>
                    </div>
                </div>
            `;
        });

        containerCards.innerHTML = htmlCards;
    }
}

function renderizarDetalhes() {
    const urlParams = new URLSearchParams(window.location.search);
    const idItem = parseInt(urlParams.get('id'));
    const detalhesContainer = document.getElementById('detalhes-item');

    if (detalhesContainer && idItem) { 
        const item = dados.find(d => d.id === idItem);

        if (item) {
            detalhesContainer.innerHTML = `
                <h2 class="mb-4 border-bottom pb-2" style="border-color:#9d4edd !important;">${item.titulo}</h2>
                <div class="row">
                    <div class="col-md-6 mb-4">
                        <img src="${item.imagem}" class="img-fluid rounded shadow" alt="Imagem de ${item.titulo}">
                    </div>
                    <div class="col-md-6">
                        <article class="artigo p-4 h-100">
                            <h3>${item.descricao}</h3>
                            <hr style="border-color:#9d4edd;">
                            <p class="lead">${item.conteudo}</p>
                            <p><strong>Categoria:</strong> ${item.categoria}</p>
                            <p><strong>Sistema/Conceito:</strong> ${item.sistema}</p>
                            <a href="index.html" class="btn mt-3" style="background-color: #d181ff; color: #121212;">
                                ← Voltar para a Home
                            </a>
                        </article>
                    </div>
                </div>
            `;
            document.title = `${item.titulo} - Role & Play`;
        } else {
            detalhesContainer.innerHTML = `<div class="alert alert-danger text-center" role="alert">Item não encontrado.</div>`;
        }
    }
}

function renderizarTabelaGerenciamento() {
    const tabelaBody = document.getElementById('tabela-conceitos-body');
    if (tabelaBody) {
        let htmlTabela = '';
        dados.forEach(item => {
            htmlTabela += `
                <tr>
                    <td>${item.id}</td>
                    <td>${item.titulo}</td>
                    <td>${item.categoria}</td>
                    <td>
                        <button class="btn btn-sm btn-warning me-2" onclick="prepararEdicao(${item.id})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deletarConceito(${item.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
        tabelaBody.innerHTML = htmlTabela;
    }
}

function configurarFormulario() {
    const form = document.getElementById('conceito-form');
    if (form) {
        form.addEventListener('submit', lidarComEnvioDoFormulario);
    }
}

async function prepararEdicao(id) {
    try {
        const resposta = await fetch(`${API_URL}/${id}`);
        const item = await resposta.json();

        document.getElementById('conceito-id').value = item.id;
        document.getElementById('titulo').value = item.titulo;
        document.getElementById('descricao').value = item.descricao;
        document.getElementById('conteudo').value = item.conteudo;
        document.getElementById('categoria').value = item.categoria;
        document.getElementById('sistema').value = item.sistema;
        document.getElementById('imagem').value = item.imagem;

        document.getElementById('btn-submit-form').textContent = 'Salvar Alterações';

        console.log(`Preparando para editar: ${item.titulo}`);
        mostrarMensagem('Edição pronta', `Pronto para editar o conceito "${item.titulo}".`, 'alert-warning');
    } catch (error) {
        console.error("Erro ao preparar edição:", error);
        mostrarMensagem('Erro', 'Não foi possível carregar os dados para edição.', 'alert-danger');
    }
}

async function lidarComEnvioDoFormulario(evento) {
    evento.preventDefault();

    const id = document.getElementById('conceito-id').value;
    const novoOuAtualizado = {
        titulo: document.getElementById('titulo').value,
        descricao: document.getElementById('descricao').value,
        conteudo: document.getElementById('conteudo').value,
        categoria: document.getElementById('categoria').value,
        sistema: document.getElementById('sistema').value,
        imagem: document.getElementById('imagem').value,
    };

    if (id) {
        await editarConceito(id, novoOuAtualizado);
    } else {
        await adicionarConceito(novoOuAtualizado);
    }

    evento.target.reset();
    document.getElementById('conceito-id').value = '';
    document.getElementById('btn-submit-form').textContent = 'Adicionar Conceito';
}


async function adicionarConceito(novo) {
    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novo)
        });
        if (!resposta.ok) {
            throw new Error(`Erro ao adicionar: ${resposta.status}`);
        }
        const data = await resposta.json();
        console.log("✅ Conceito adicionado:", data);
        mostrarMensagem('Sucesso', `Conceito "${data.titulo}" adicionado com sucesso!`, 'alert-success');
        carregarDados(); 
    } catch (erro) {
        console.error("Erro ao adicionar:", erro);
        mostrarMensagem('Erro', `Erro ao adicionar conceito. Verifique o console.`, 'alert-danger');
    }
}

async function editarConceito(id, atualizado) {
    try {
        const resposta = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(atualizado)
        });
        if (!resposta.ok) {
            throw new Error(`Erro ao atualizar: ${resposta.status}`);
        }
        const data = await resposta.json();
        console.log("Conceito atualizado:", data);
        mostrarMensagem('Sucesso', `Conceito "${data.titulo}" (ID: ${id}) atualizado com sucesso!`, 'alert-success');
        carregarDados(); 
    } catch (erro) {
        console.error("Erro ao atualizar:", erro);
        mostrarMensagem('Erro', `Erro ao atualizar conceito. Verifique o console.`, 'alert-danger');
    }
}

async function deletarConceito(id) {
    if (window.confirm(`Tem certeza que deseja deletar o conceito com ID ${id}?`)) {
        try {
            const resposta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            if (!resposta.ok) {
                throw new Error(`Erro ao deletar: ${resposta.status}`);
            }
            console.log(`✅ Conceito ${id} deletado.`);
            mostrarMensagem('Sucesso', `Conceito (ID: ${id}) deletado com sucesso!`, 'alert-success');
            carregarDados(); 
        } catch (erro) {
            console.error("Erro ao deletar:", erro);
            mostrarMensagem('Erro', `Erro ao deletar conceito. Verifique o console.`, 'alert-danger');
        }
    }
}

function mostrarMensagem(titulo, mensagem, tipo) {
    console.log(`[${titulo} | ${tipo.replace('alert-', '').toUpperCase()}] ${mensagem}`);
}

function processarDadosParaGrafico(campo) {
    const contagem = dados.reduce((acc, item) => {
        const valor = item[campo];
        acc[valor] = (acc[valor] || 0) + 1;
        return acc;
    }, {});

    const labels = Object.keys(contagem);
    const data = Object.values(contagem);
    const backgroundColors = generateColors(labels.length);

    return { labels, data, backgroundColors };
}

function desenharGrafico(canvasId, campo, titulo) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (myCharts[canvasId]) {
        myCharts[canvasId].destroy();
    }

    const { labels, data, backgroundColors } = processarDadosParaGrafico(campo);

    const config = {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: titulo,
                data: data,
                backgroundColor: backgroundColors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                         color: '#f4f4f4', 
                    }
                },
                title: {
                    display: false,
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const value = context.parsed;
                            const percentage = ((value / total) * 100).toFixed(2) + '%';
                            return `${context.label}: ${value} (${percentage})`;
                        }
                    }
                }
            }
        }
    };

    myCharts[canvasId] = new Chart(canvas, config);
}

function renderizarGraficos() {
    const graficoCategoria = document.getElementById('grafico-categoria');
    if (graficoCategoria) {
        if (dados.length < 2) {
            document.getElementById('alerta-dados').style.display = 'block';
            graficoCategoria.style.display = 'none'; 
            return;
        }

        document.getElementById('alerta-dados').style.display = 'none';
        graficoCategoria.style.display = 'block';

        desenharGrafico('grafico-categoria', 'categoria', 'Conceitos por Categoria');
        desenharGrafico('grafico-sistema', 'sistema', 'Conceitos por Sistema');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    configurarFormulario(); 
});