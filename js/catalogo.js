/**
 * Sistema de Catálogo Inteligente - DEV ALBK
 * Integração com Google Sheets via CSV
 */

// 1. Substitua este link pelo link da sua planilha "Publicada na Web" em formato CSV
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1SGcWoB6FksMOI7NMzHXGZgmrhWWR4-Y_xcEfuhrIdwc/edit?usp=sharing';

async function carregarProdutos() {
    const grid = document.getElementById('grid-catalogo');
    
    try {
        // No protótipo, se não houver URL real, mostramos dados de exemplo
        if (SHEET_URL.includes('SUA_ID_DA_PLANILHA')) {
            console.log("Usando dados de demonstração. Configure a SHEET_URL para dados reais.");
            return;
        }

        const response = await fetch(SHEET_URL);
        const data = await response.text();
        
        // Converte CSV para Array de Objetos
        const linhas = data.split('\n').slice(1); // Pula o cabeçalho
        
        grid.innerHTML = ''; // Limpa o grid

        linhas.forEach(linha => {
            const colunas = linha.split(',');
            if (colunas.length >= 4) {
                const [nome, categoria, detalhes, status, fotoUrl] = colunas;
                
                const card = document.createElement('div');
                card.className = 'produto-card';
                card.innerHTML = `
                    <div class="img-container">
                        <img src="${fotoUrl.trim() || 'https://via.placeholder.com/300x250?text=Sem+Foto'}" alt="${nome}">
                    </div>
                    <div class="produto-info">
                        <span class="produto-tag">${categoria}</span>
                        <h3>${nome}</h3>
                        <div class="detalhes">
                            <p>${detalhes}</p>
                            <span><strong>Status:</strong> ${status}</span>
                        </div>
                        <a href="vendedores.html" class="btn-pedir">Consultar Cores</a>
                    </div>
                `;
                grid.appendChild(card);
            }
        });

    } catch (error) {
        console.error("Erro ao carregar planilha:", error);
    }
}

// Inicializa ao carregar a página
document.addEventListener('DOMContentLoaded', carregarProdutos);
