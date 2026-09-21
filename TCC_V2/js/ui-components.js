/**
 * JR Iluminação e Leds - Componentes de UI Avançados
 */

// ========== SKELETON LOADING ==========
function renderSkeletonCard() {
    return `
        <div class="skeleton-card">
            <div class="skeleton skeleton-img"></div>
            <div class="skeleton-body">
                <div class="skeleton skeleton-text" style="width: 80%;"></div>
                <div class="skeleton skeleton-text" style="width: 60%; margin-top: 10px;"></div>
                <div class="skeleton skeleton-text" style="width: 40%; margin-top: 15px;"></div>
            </div>
        </div>
    `;
}

function renderSkeletonGrid(count = 6) {
    let html = '<div class="grid">';
    for (let i = 0; i < count; i++) {
        html += renderSkeletonCard();
    }
    html += '</div>';
    return html;
}

// ========== TOAST NOTIFICATIONS MELHORADO ==========
function exibirMensagem(texto, tipo = 'sucesso', duracao = 3000) {
    const container = document.getElementById('toast-container') || criarToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo} fade-in`;
    
    const icone = {
        'sucesso': '✓',
        'erro': '✕',
        'aviso': '!',
        'info': 'ℹ'
    }[tipo] || '✓';
    
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-icon">${icone}</span>
            <span class="toast-text">${texto}</span>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }
    }, duracao);
}

function criarToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

// ========== BREADCRUMBS ==========
function renderBreadcrumbs(items) {
    return `
        <nav class="breadcrumbs" aria-label="Breadcrumb">
            ${items.map((item, index) => `
                <a href="#" onclick="navegar('${item.rota}')" class="${index === items.length - 1 ? 'active' : ''}">
                    ${item.label}
                </a>
                ${index < items.length - 1 ? '<span class="breadcrumb-separator">/</span>' : ''}
            `).join('')}
        </nav>
    `;
}

// ========== CONFIRMAÇÃO MODAL ==========
function mostrarConfirmacao(titulo, mensagem, onConfirm, onCancel) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fade-in';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${titulo}</h3>
            <p>${mensagem}</p>
            <div class="modal-actions">
                <button class="btn-cancel" onclick="this.closest('.modal-overlay').remove(); ${onCancel ? onCancel + '()' : ''}">Cancelar</button>
                <button class="btn-confirm" onclick="this.closest('.modal-overlay').remove(); ${onConfirm}()">Confirmar</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// ========== EMPTY STATE ==========
function renderEmptyState(icone, titulo, descricao, botao = null) {
    let html = `
        <div class="empty-state">
            <div class="empty-icon">${icone}</div>
            <h3>${titulo}</h3>
            <p>${descricao}</p>
    `;
    
    if (botao) {
        html += `<button class="btn-primary" onclick="${botao.acao}">${botao.texto}</button>`;
    }
    
    html += '</div>';
    return html;
}

// ========== LOADING PROFISSIONAL ==========
function mostrarLoading(show = true, mensagem = 'A carregar...') {
    let loader = document.getElementById('global-loader');
    
    if (show) {
        // Se mandou mostrar e não existe, cria-o
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.className = 'loader-container';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="loader"></div>
                    <p class="loader-text">${mensagem}</p>
                </div>
            `;
            document.body.appendChild(loader);
        }
        // Força a visibilidade contra o CSS
        loader.style.setProperty('display', 'grid', 'important');
        let textEl = loader.querySelector('.loader-text');
        if (textEl) textEl.textContent = mensagem;
    } else {
        // Se mandou esconder, a melhor forma de vencer o CSS (!important) é DESTRUIR o elemento
        if (loader) {
            loader.remove();
        }
    }
}
// ========== TABELA COM PAGINAÇÃO ==========
function renderTabelaPaginada(dados, colunas, onPaginaChange) {
    const itemsPorPagina = 10;
    const totalPaginas = Math.ceil(dados.length / itemsPorPagina);
    let paginaAtual = 1;
    
    function renderizar(pagina) {
        const inicio = (pagina - 1) * itemsPorPagina;
        const fim = inicio + itemsPorPagina;
        const dadosPagina = dados.slice(inicio, fim);
        
        let html = `
            <table class="admin-table">
                <thead>
                    <tr>
                        ${colunas.map(col => `<th>${col}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${dadosPagina.map(linha => `
                        <tr>
                            ${Object.values(linha).map(valor => `<td>${valor}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="paginacao">
                <button ${pagina === 1 ? 'disabled' : ''} onclick="renderizar(${pagina - 1})">← Anterior</button>
                <span>Página ${pagina} de ${totalPaginas}</span>
                <button ${pagina === totalPaginas ? 'disabled' : ''} onclick="renderizar(${pagina + 1})">Próxima →</button>
            </div>
        `;
        
        return html;
    }
    
    return renderizar(paginaAtual);
}

// ========== CARD COM HOVER EFFECT ==========
function renderCardProfissional(titulo, conteudo, rodape = null, acao = null) {
    return `
        <div class="card-profissional">
            <div class="card-header">
                <h4>${titulo}</h4>
            </div>
            <div class="card-content">
                ${conteudo}
            </div>
            ${rodape ? `<div class="card-footer">${rodape}</div>` : ''}
            ${acao ? `<div class="card-action"><button class="btn-primary" onclick="${acao.funcao}">${acao.texto}</button></div>` : ''}
        </div>
    `;
}

// ========== ALERT CUSTOMIZADO ==========
function mostrarAlerta(tipo, titulo, mensagem) {
    const alerta = document.createElement('div');
    alerta.className = `alerta alerta-${tipo} fade-in`;
    alerta.innerHTML = `
        <div class="alerta-content">
            <h4>${titulo}</h4>
            <p>${mensagem}</p>
            <button class="alerta-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    document.body.appendChild(alerta);
    
    setTimeout(() => {
        if (alerta.parentElement) {
            alerta.classList.add('fade-out');
            setTimeout(() => alerta.remove(), 300);
        }
    }, 5000);
}

// ========== BADGE COM TOOLTIP ==========
function renderBadgeComTooltip(texto, tipo, tooltip) {
    return `
        <span class="badge badge-${tipo}" title="${tooltip}">
            ${texto}
        </span>
    `;
}

// ========== PROGRESS BAR ==========
function renderProgressBar(valor, maximo = 100, label = '') {
    const percentual = (valor / maximo) * 100;
    return `
        <div class="progress-container">
            <div class="progress-bar" style="width: ${percentual}%"></div>
            <span class="progress-label">${label} ${percentual.toFixed(0)}%</span>
        </div>
    `;
}
