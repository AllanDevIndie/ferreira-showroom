/**
 * Sistema de Catálogo Inteligente DEV ALBK v3.1
 * Blindagem contra vírgulas em textos e links do Drive
 */

const SHEET_URL = 'COLE_SEU_LINK_AQUI'; // <--- COLOQUE SEU LINK REAL AQUI
let todosOsProdutos = [];

function converterLinkDrive(url) {
    if (url && url.includes('drive.google.com')) {
        const id = url.split('/d/')[1]?.split('/')[0];
        return `https://docs.google.com/spreadsheets/d/e/2PACX-1vQTtOMiTsRhYTNX-nL0qCsbkg8q8pbUx01n7hVhYjGzuU7K44TKM6xrRa_xKPUvOzTn5oBHpvVEK-fe/pubhtml`;
    }
    return url;
}

// Função robusta para ler CSV (lida com vírgulas dentro de aspas )
function parseCSV(text) {
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const separator = text.includes(';') ? ';' : regex;
    return text.split(separator).map(v => v.replace(/^"|"$/g, '').trim());
}

async function carregarDados() {
    const grid = document.getElementById('grid-catalogo');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const linhas = data.split(/\r?\n/).filter(l => l.trim() !== "").slice(1); 
        
        todosOsProdutos = linhas.map(linha => {
            const colunas = parseCSV(linha);
            if (colunas.length >= 4) {
                return {
                    nome: colunas[0],
                    categoria: colunas[1],
                    detalhes: colunas[2],
                    status: colunas[3],
                    fotoUrl: converterLinkDrive(colunas[4])
                };
            }
            return null;
        }).filter(p => p && p.nome);

        renderizarProdutos(todosOsProdutos);
        configurarFiltros();

    } catch (error) {
        console.error("Erro:", error);
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Erro ao carregar dados. Verifique o link da planilha.</p>';
    }
}

function renderizarProdutos(lista) {
    const grid = document.getElementById('grid-catalogo');
    grid.innerHTML = '';

    if (lista.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Nenhum produto encontrado.</p>';
        return;
    }

    lista.forEach(p => {
        const numWhats = "5581999999999"; 
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
        btn.onclick = () => {
            botoes.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.textContent.trim().toLowerCase();
            const filtrados = cat === 'todos' ? todosOsProdutos : todosOsProdutos.filter(p => p.categoria.toLowerCase() === cat);
            renderizarProdutos(filtrados);
        };
    });
}

document.addEventListener('DOMContentLoaded', carregarDados);
