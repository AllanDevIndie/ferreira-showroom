/**
 * Sistema de Catálogo Inteligente DEV ALBK v2.0
 * Suporte automático para links do Google Drive
 */

// 1. COLE AQUI O SEU LINK DE PUBLICAÇÃO CSV (Arquivo > Compartilhar > Publicar na Web > CSV)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1SGcWoB6FksMOI7NMzHXGZgmrhWWR4-Y_xcEfuhrIdwc/edit?gid=0#gid=0';

// Função mágica para converter link do Drive em link direto de imagem
function converterLinkDrive(url ) {
    if (url.includes('drive.google.com')) {
        const id = url.split('/d/')[1]?.split('/')[0];
        return `https://lh3.googleusercontent.com/u/0/d/${id}`;
    }
    return url;
}

async function carregarProdutos( ) {
    const grid = document.getElementById('grid-catalogo');
    
    try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error('Erro ao acessar a planilha');
        
        const data = await response.text();
        const linhas = data.split(/\r?\n/).slice(1); 
        
        grid.innerHTML = ''; 

        linhas.forEach(linha => {
            // Suporte para CSV com vírgula ou ponto e vírgula
            const colunas = linha.includes(';') ? linha.split(';') : linha.split(',');
            
            if (colunas.length >= 4) {
                let [nome, categoria, detalhes, status, fotoUrl] = colunas;
                
                // Limpeza de dados
                nome = (nome || '').replace(/"/g, '').trim();
                categoria = (categoria || '').replace(/"/g, '').trim();
                detalhes = (detalhes || '').replace(/"/g, '').trim();
                status = (status || '').replace(/"/g, '').trim();
                fotoUrl = converterLinkDrive((fotoUrl || '').replace(/"/g, '').trim());

                if (nome) {
                    const card = document.createElement('div');
                    card.className = 'produto-card';
                    card.innerHTML = `
                        <div class="img-container">
                            <img src="${fotoUrl || 'https://via.placeholder.com/300x250?text=Sem+Foto'}" 
                                 onerror="this.src='https://via.placeholder.com/300x250?text=Erro+na+Imagem'" 
                                 alt="${nome}">
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
                    grid.appendChild(card );
                }
            }
        });

    } catch (error) {
        console.error("Erro:", error);
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Certifique-se de que a planilha foi "Publicada na Web" como CSV.</p>';
    }
}

document.addEventListener('DOMContentLoaded', carregarProdutos);
