/**
 * Sistema de Catálogo Ferreira Showroom v4.0
 * Fotos Locais + Carrossel Inteligente + Sheets Sync
 */

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQTtOMiTsRhYTNX-nL0qCsbkg8q8pbUx01n7hVhYjGzuU7K44TKM6xrRa_xKPUvOzTn5oBHpvVEK-fe/pub?output=csv';
const IMG_PATH = 'img/produtos/';

let todosOsProdutos = [];

async function carregarDados() {
    const grid = document.getElementById('grid-catalogo');
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const linhas = data.split(/\r?\n/).filter(l => l.trim() !== "").slice(1); 
        
        todosOsProdutos = linhas.map(linha => {
            const colunas = parseCSV(linha);
            if (colunas.length >= 4) {
                // Suporte a múltiplas fotos separadas por vírgula na planilha
                const fotosRaw = colunas[4] ? colunas[4].split(',') : [];
                const fotosProcessadas = fotosRaw.map(f => f.trim()).filter(f => f !== "");

                return {
                    nome: colunas[0],
                    categoria: colunas[1],
                    detalhes: colunas[2],
                    status: colunas[3],
                    fotos: fotosProcessadas.length > 0 ? fotosProcessadas : ['placeholder.jpg']
                };
            }
            return null;
        }).filter(p => p && p.nome);

        renderizarProdutos(todosOsProdutos);
        configurarFiltros();
        configurarPesquisa();

    } catch (error) {
        console.error("Erro:", error);
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Erro ao carregar catálogo. Verifique a conexão.</p>';
    }
}

function parseCSV(text) {
    const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
    const separator = text.includes(';') ? ';' : regex;
    return text.split(separator).map(v => v.replace(/^"|"$/g, '').trim());
}

const PHONE_NUMBERS = ["5581973142897", "558189927012"];
let nextWhatsNumberIndex = 0;

function renderizarProdutos(lista) {
    const grid = document.getElementById('grid-catalogo');
    grid.innerHTML = '';

    lista.forEach((p, index) => {
        const msg = encodeURIComponent(`Olá! Gostaria de saber mais sobre o produto *${p.nome}* do catálogo.`);

        const card = document.createElement('div');
        card.className = 'produto-card';
        
        // Lógica do Carrossel Interno
        let fotosHTML = '';
        p.fotos.forEach((foto, i) => {
            fotosHTML += `<img src="${IMG_PATH}${foto}" class="slide-foto ${i === 0 ? 'active' : ''}" alt="${p.nome}">`;
        });

        const controlesHTML = p.fotos.length > 1 ? `
            <div class="carrossel-controls">
                <button onclick="mudarFoto(${index}, -1)"><i class="fas fa-chevron-left"></i></button>
                <button onclick="mudarFoto(${index}, 1)"><i class="fas fa-chevron-right"></i></button>
            </div>
            <div class="carrossel-dots" id="dots-${index}">
                ${p.fotos.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}"></span>`).join('')}
            </div>
        ` : '';

        card.innerHTML = `
            <div class="img-container" id="carrossel-${index}">
                ${fotosHTML}
                ${controlesHTML}
            </div>
            <div class="produto-info">
                <span class="produto-tag">${p.categoria}</span>
                <h3>${p.nome}</h3>
                <div class="detalhes">
                    <p>${p.detalhes}</p>
                    <span><strong>Status:</strong> ${p.status}</span>
                </div>
                <a href="#" target="_blank" class="btn-pedir btn-whats">Consultar no WhatsApp</a>
            </div>
        `;
        grid.appendChild(card);

        const link = card.querySelector('.btn-whats');
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const numWhats = PHONE_NUMBERS[nextWhatsNumberIndex];
            nextWhatsNumberIndex = (nextWhatsNumberIndex + 1) % PHONE_NUMBERS.length;
            const linkWhats = `https://wa.me/${numWhats}?text=${msg}`;
            window.open(linkWhats, '_blank');
        });
    });
}

// Função Global para mudar foto do carrossel
window.mudarFoto = function(productIndex, direction) {
    const container = document.getElementById(`carrossel-${productIndex}`);
    const slides = container.querySelectorAll('.slide-foto');
    const dots = document.getElementById(`dots-${productIndex}`).querySelectorAll('.dot');
    
    let activeIndex = Array.from(slides).findIndex(s => s.classList.contains('active'));
    slides[activeIndex].classList.remove('active');
    dots[activeIndex].classList.remove('active');

    activeIndex = (activeIndex + direction + slides.length) % slides.length;

    slides[activeIndex].classList.add('active');
    dots[activeIndex].classList.add('active');
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

function configurarPesquisa() {
    const input = document.getElementById('search-categories');
    if (!input) return;
    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        if (q === '') {
            // se vazio deixa como 'Todos' ativo
            const todosBtn = Array.from(document.querySelectorAll('.filter-btn')).find(b => b.textContent.trim().toLowerCase() === 'todos');
            if (todosBtn) { document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active')); todosBtn.classList.add('active'); }
            renderizarProdutos(todosOsProdutos);
            return;
        }
        // filtra produtos cujo campo 'categoria' ou 'nome' contenha a query
        const filtrados = todosOsProdutos.filter(p => {
            const cat = (p.categoria || '').toLowerCase();
            const nome = (p.nome || '').toLowerCase();
            return cat.includes(q) || nome.includes(q);
        });
        // desmarca botões de filtro ao pesquisar
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        renderizarProdutos(filtrados);
    });
}

document.addEventListener('DOMContentLoaded', carregarDados);
