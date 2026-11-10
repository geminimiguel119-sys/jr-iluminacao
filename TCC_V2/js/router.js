// ==========================================
// SISTEMA DE ROTAS (router.js) - UX PREMIUM
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

    // === GATILHO DA ANIMAÇÃO DE FLUIDEZ & SCROLL TOP ===
    const appElement = document.getElementById('app');
    if (appElement) {
        // Remove a classe para resetar a animação
        appElement.classList.remove('page-transition');
        
        // Pequeno atraso para o navegador registrar a remoção e reaplicar a animação
        setTimeout(() => {
            appElement.classList.add('page-transition');
        }, 10);
    }
    
    // Leva a tela sempre para o topo de forma suave ao trocar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // === BARREIRA DE SEGURANÇA ADMIN ===
    if (rota.startsWith('admin')) {
        const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
        if (!user || user.role !== 'admin') {
            if (typeof exibirMensagem === 'function') {
                exibirMensagem("Acesso negado. Área restrita a administradores.", "erro");
            } else {
                alert("Acesso negado. Área restrita a administradores.");
            }
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
    // ---> ROTA EXCLUSIVA DO PRODUTO <---
    else if (rota === 'produto') {
        if (typeof renderProdutoDetalhes === 'function') renderProdutoDetalhes(params.id);
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
    else if (rota === 'admin/relatorios') {
        if (typeof renderAdminRelatorios === 'function') renderAdminRelatorios();
    }
    else {
        navegar('home');
    }
};

window.addEventListener('DOMContentLoaded', router);
window.addEventListener('hashchange', router);
