// ==========================================
// SISTEMA DE ROTAS (router.js)
// ==========================================

window.navegar = function(rota, params = {}) {
    let hash = rota;
    if (params.id) {
        hash += '?id=' + params.id;
    }
    window.location.hash = hash;
};

window.router = function() {
    let hash = window.location.hash.substring(1) || 'home';
    let rota = hash.split('?')[0];
    let params = {};
    
    if (hash.includes('?')) {
        const queryString = hash.split('?')[1];
        const urlParams = new URLSearchParams(queryString);
        params.id = urlParams.get('id');
    }

    // === BARREIRA DE SEGURANÇA ADMIN ===
    if (rota.startsWith('admin')) {
        const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
        if (!user || user.role !== 'admin') {
            alert("Acesso negado. Área restrita a administradores.");
            navegar('home'); 
            return;
        }
    }

    // MAPA DE ROTAS PÚBLICAS
    if (rota === 'home' || rota === '') {
        if (typeof renderHome === 'function') renderHome();
    } 
    else if (rota === 'produtos') {
        if (typeof renderProdutos === 'function') renderProdutos();
    }
    else if (rota === 'login') {
        if (typeof renderLogin === 'function') renderLogin();
    }
    else if (rota === 'perfil') {
        if (typeof renderPerfil === 'function') renderPerfil();
    }
    
    // MAPA DE ROTAS PRIVADAS ADMIN
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
    // ROTA DE RELATÓRIOS DO ADMIN (O SUCESSO ACONTECE AQUI)
    else if (rota === 'admin/relatorios') {
        if (typeof renderAdminRelatorios === 'function') renderAdminRelatorios();
    }
    else {
        navegar('home');
    }
};

window.addEventListener('DOMContentLoaded', router);
window.addEventListener('hashchange', router);
