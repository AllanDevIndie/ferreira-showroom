/**
 * Sistema de Catálogo Inteligente DEV ALBK v3.0
 * Filtros Dinâmicos + WhatsApp com Contexto
 */

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTtOMiTsRhYTNX-nL0qCsbkg8q8pbUx01n7hVhYjGzuU7K44TKM6xrRa_xKPUvOzTn5oBHpvVEK-fe/pubhtml';
let todosOsProdutos = [];

// Função para converter link do Drive
function converterLinkDrive(url) {
    if (url.includes('drive.google.com')) {
        const id = url.split('/d/')[1]?.split('/')[0];
        return `https://lh3.googleusercontent.com/u/0/d/${id}`;
    }
    return url;
}

async function carregarDados( ) {
    const grid = document.getElementById('grid-catalogo');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const linhas = data.split(/\r?\n/).slice(1); 
        
        todosOsProdutos = linhas.map(linha => {
            const colunas = linha.includes(';') ? linha.split(';') : linha.split(',');
            if (colunas.length >= 4) {
                return {
                    nome: (colunas[0] || '').replace(/"/g, '').trim(),
                    categoria: (colunas[1] || '').replace(/"/g, '').trim(),
                    detalhes: (colunas[2] || '').replace(/"/g, '').trim(),
                    status: (colunas[3] || '').replace(/"/g, '').trim(),
                    fotoUrl: converterLinkDrive((colunas[4] || '').replace(/"/g, '').trim())
                };
            }
            return null;
        }).filter(p => p && p.nome);

        renderizarProdutos(todosOsProdutos);
        configurarFiltros();

    } catch (error) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Erro ao carregar dados.</p>';
    }
}

function renderizarProdutos(lista) {
    const grid = document.getElementById('grid-catalogo');
    grid.innerHTML = '';

    if (lista.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Nenhum produto encontrado nesta categoria.</p>';
        return;
    }

    lista.forEach(p => {
        // MENSAGEM DO WHATSAPP: Aqui você define o número da empresa
        const numWhats = "5581999999999"; // Coloque o número principal da loja aqui
        const msg = encodeURIComponent(`Olá! Gostaria de saber mais sobre o tecido *${p.nome}* que vi no catálogo digital.`);
        const linkWhats = `https://wa.me/${numWhats}?text=${msg}`;

        const card = document.createElement('div' );
        card.className = 'produto-card';
        card.innerHTML = `
            <div class="img-container">
                <img src="${p.fotoUrl || 'https://via.placeholder.com/300x250?text=Sem+Foto'}" 
                     onerror="this.src='https://via.placeholder.com/300x250?text=Erro+na+Imagem'" alt="${p.nome}">
            </div>
            <div class="produto-info">
                <span class="produto-tag">${p.categoria}</span>
                <h3>${p.nome}</h3>
                <div class="detalhes">
                    <p>${p.detalhes}</p>
                    <span><strong>Status:</strong> ${p.status}</span>
                </div>
                <a href="${linkWhats}" target="_blank" class="btn-pedir">Consultar no WhatsApp</a>
            </div>
        `;
        grid.appendChild(card );
    });
}

function configurarFiltros() {
    const botoes = document.querySelectorAll('.filter-btn');
    botoes.forEach(btn => {
        btn.addEventListener('click', () => {
            // Estilo do botão ativo
            botoes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const categoriaFiltro = btn.textContent.trim().toLowerCase();
            
            if (categoriaFiltro === 'todos') {
                renderizarProdutos(todosOsProdutos);
            } else {
                const filtrados = todosOsProdutos.filter(p => 
                    p.categoria.toLowerCase() === categoriaFiltro
                );
                renderizarProdutos(filtrados);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', carregarDados);
