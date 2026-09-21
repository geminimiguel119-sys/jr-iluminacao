// ==========================================
// SISTEMA DE ROTAS (router.js)
// ==========================================

// Função para mudar de página (altera a hash do URL)
window.navegar = function(rota, params = {}) {
    let hash = rota;
    // Se houver um ID (ex: editar produto), adiciona-o ao URL
    if (params.id) {
        hash += '?id=' + params.id;
    }
    window.location.hash = hash;
};

// Função principal que lê o URL e carrega o ecrã correspondente
window.router = function() {
    let hash = window.location.hash.substring(1) || 'home';
    let rota = hash.split('?')[0];
    let params = {};
    
    if (hash.includes('?')) {
        const queryString = hash.split('?')[1];
        const urlParams = new URLSearchParams(queryString);
        params.id = urlParams.get('id');
    }

    // === BARREIRA DE SEGURANÇA ===
    if (rota.startsWith('admin')) {
        const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
        if (!user || user.role !== 'admin') {
            alert("Acesso negado. Área restrita a administradores.");
            navegar('home'); // Expulsa para a página inicial
            return;
        }
    }

    // ROTAS PÚBLICAS
    if (rota === 'home' || rota === '') {
        if (typeof renderHome === 'function') renderHome();
    } 
    else if (rota === 'produtos') {
        if (typeof renderVitrine === 'function') renderVitrine();
        else if (typeof renderProdutos === 'function') renderProdutos();
        else if (typeof carregarProdutos === 'function') carregarProdutos();
    }
    else if (rota === 'carrinho') {
        if (typeof renderCarrinho === 'function') renderCarrinho();
    }
    else if (rota === 'login') {
        if (typeof renderLogin === 'function') renderLogin();
    }
    else if (rota === 'perfil') {
        if (typeof renderPerfil === 'function') renderPerfil();
    }
    
    // ROTAS PRIVADAS (Protegidas)
    else if (rota === 'admin' || rota === 'admin/dashboard') {
        if (typeof renderDashboard === 'function') renderDashboard();
    } 
    else if (rota === 'admin/produtos') {
        if (typeof renderAdminProdutos === 'function') renderAdminProdutos();
    } 
    else if (rota === 'admin/produtos/novo' || rota === 'admin/produtos/editar') {
        if (typeof renderAdminProdutoForm === 'function') renderAdminProdutoForm(params);
    } 
    else if (rota === 'admin/clientes') {
        if (typeof renderAdminClientes === 'function') renderAdminClientes();
    } 
    else if (rota === 'admin/clientes/novo' || rota === 'admin/clientes/editar') {
        if (typeof renderAdminClienteForm === 'function') renderAdminClienteForm(params);
    }
    else if (rota === 'admin/pedidos') {
        if (typeof renderAdminPedidos === 'function') renderAdminPedidos();
    }
    // NOVA ROTA DE RELATÓRIOS
    else if (rota === 'admin/relatorios') {
        if (typeof renderAdminRelatorios === 'function') renderAdminRelatorios();
    }
    else {
        navegar('home');
    }
};

// Inicia o router quando a página carrega pela primeira vez
window.addEventListener('DOMContentLoaded', router);

// Fica à escuta de mudanças no URL (quando o utilizador clica em links ou nos botões de voltar do navegador)
window.addEventListener('hashchange', router);