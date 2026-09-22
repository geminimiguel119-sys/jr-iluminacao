// ==========================================
// PAINEL DE CONTROLO - ADMIN (admin.js)
// ==========================================

window.adminLayout = function(tituloPagina, subtitulo, conteudoHtml, botaoTopo = '') {
    const appContainer = document.getElementById('app') || document.body;
    
    let adminWrapper = document.getElementById('admin-wrapper');
    if (!adminWrapper) {
        document.body.innerHTML = `
        <div id="admin-wrapper" class="admin-layout" style="display: flex; height: 100vh; background: #f4f6f9; font-family: 'Poppins', sans-serif;">
            <aside class="admin-sidebar" style="width: 250px; background: #0f172a; color: #fff; display: flex; flex-direction: column;">
                <div class="sidebar-brand" style="padding: 20px; font-size: 1.2rem; font-weight: bold; border-bottom: 1px solid #1e293b; color: #38bdf8;">
                    JR Admin
                </div>
                <nav style="flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 10px;">
                    <a href="#" onclick="navegar('admin/dashboard'); return false;">📊 Visão Geral</a>
                    <a href="#" onclick="navegar('admin/produtos'); return false;">📦 Produtos</a>
                    <a href="#" onclick="navegar('admin/clientes'); return false;">👥 Clientes</a>
                    <a href="#" onclick="navegar('admin/pedidos'); return false;">🛒 Pedidos</a>
                    <a href="#" onclick="navegar('admin/relatorios'); return false;" style="color: #38bdf8;">📈 Relatórios</a>
                </nav>
                <div class="sidebar-bottom" style="padding: 20px; border-top: 1px solid #1e293b;">
                    <button class="btn btn-outline" style="width: 100%; color: #cbd5e1; border-color: #334155;" onclick="sairParaSite();">⬅ Voltar ao Site</button>
                </div>
            </aside>
            <div class="admin-content" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
                <header class="admin-header" style="background: #fff; padding: 20px 30px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 id="admin-page-title" style="margin: 0; font-size: 1.5rem; color: #1e293b;"></h1>
                        <p id="admin-page-subtitle" style="margin: 5px 0 0 0; color: #64748b; font-size: 0.9rem;"></p>
                    </div>
                    <div id="admin-header-action"></div>
                </header>
                <main id="admin-main-content" style="padding: 30px; flex: 1;"></main>
            </div>
        </div>`;
    }

    document.getElementById('admin-page-title').innerText = tituloPagina;
    document.getElementById('admin-page-subtitle').innerText = subtitulo;
    document.getElementById('admin-header-action').innerHTML = botaoTopo;
    document.getElementById('admin-main-content').innerHTML = conteudoHtml;
};

window.sairParaSite = function() {
    window.location.hash = 'home';
    window.location.reload();
};

window.renderDashboard = function() {
    const user = JSON.parse(localStorage.getItem('jr_user') || '{}');
    const nome = user.nome ? user.nome.split(' ')[0] : 'Administrador';

    const html = `
    <div class="panel">
        <div style="text-align: center; padding: 40px 20px;">
            <h2 style="color: #0F4C81; margin-bottom: 10px;">Olá, ${escapeHtml(nome)}!</h2>
            <p style="color: #666; font-size: 1.1rem; margin-bottom: 30px;">
                Bem-vindo ao Painel de Controlo da JR Iluminação e Leds.
            </p>
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto;">
                <div class="card stat-card" style="padding: 20px; border-left: 4px solid #1E88E5; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">Produtos</h3>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 0.9rem;">Gerir catálogo e preços</p>
                    <button class="btn btn-primary" style="width: 100%; padding: 8px;" onclick="navegar('admin/produtos')">Gerir Produtos</button>
                </div>
                <div class="card stat-card" style="padding: 20px; border-left: 4px solid #43A047; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">Clientes</h3>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 0.9rem;">Gerir contas e permissões</p>
                    <button class="btn btn-primary" style="width: 100%; padding: 8px; background: #43A047;" onclick="navegar('admin/clientes')">Gerir Clientes</button>
                </div>
                <div class="card stat-card" style="padding: 20px; border-left: 4px solid #F57C00; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">Pedidos</h3>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 0.9rem;">Ver encomendas recebidas</p>
                    <button class="btn btn-primary" style="width: 100%; padding: 8px; background: #F57C00;" onclick="navegar('admin/pedidos')">Ver Pedidos</button>
                </div>
            </div>
        </div>
    </div>`;
    adminLayout('Visão Geral', 'Resumo e atalhos rápidos do sistema.', html);
};

// ==========================================
// RELATÓRIOS AVANÇADOS COM EXPORTAÇÃO
// ==========================================
window.renderAdminRelatorios = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A gerar relatório detalhado...");
    try {
        const resPedidos = await apiFetch('api/pedidos.php');
        const resProdutos = await apiFetch('api/produtos.php');
        
        const pedidos = resPedidos.dados || [];
        const produtos = resProdutos.dados || [];
        
        // Guardado no estado global para o botão de exportar
        window.dadosRelatorioAtual = { pedidos, produtos };

        let totalFaturado = 0;
        let contagemStatus = { 'Pendente': 0, 'Em processamento': 0, 'Enviado': 0, 'Concluído': 0 };
        
        pedidos.forEach(p => {
            totalFaturado += parseFloat(p.total);
            if (contagemStatus[p.status] !== undefined) {
                contagemStatus[p.status]++;
            }
        });
        
        const produtosCriticos = produtos
            .filter(p => parseInt(p.quantidade) <= 5)
            .sort((a, b) => parseInt(a.quantidade) - parseInt(b.quantidade));

        const ultimosPedidos = pedidos.slice(0, 8);

        const getStatusColor = (status) => {
            switch(status) {
                case 'Pendente': return 'background: #fff3cd; color: #856404;';
                case 'Em processamento': return 'background: #cce5ff; color: #004085;';
                case 'Enviado': return 'background: #e2e3e5; color: #383d41;';
                case 'Concluído': return 'background: #d4edda; color: #155724;';
                default: return 'background: #e2e8f0; color: #475569;';
            }
        };

        const html = `
        <div class="panel" style="padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px;">
                <h3 style="margin: 0; color: #1e293b;">Visão Geral de Desempenho</h3>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" onclick="exportarRelatorioCSV()" style="padding: 8px 14px; font-size: 0.85rem; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        📥 Exportar CSV
                    </button>
                    <button class="btn" onclick="imprimirRelatorio()" style="padding: 8px 14px; font-size: 0.85rem; background: #fff; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
                        🖨️ Imprimir
                    </button>
                </div>
            </div>
            
            <div class="stat-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
                <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #10b981; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem;">Faturamento Total</p>
                    <h2 style="margin: 10px 0 0 0; color: #0f172a; font-size: 1.6rem;">R$ ${totalFaturado.toFixed(2).replace('.', ',')}</h2>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #3b82f6; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem;">Total de Pedidos</p>
                    <h2 style="margin: 10px 0 0 0; color: #0f172a; font-size: 1.6rem;">${pedidos.length}</h2>
                </div>
                <div style="background: #fff; padding: 20px; border-radius: 8px; border-left: 5px solid #8b5cf6; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem;">Produtos no Catálogo</p>
                    <h2 style="margin: 10px 0 0 0; color: #0f172a; font-size: 1.6rem;">${produtos.length}</h2>
                </div>
            </div>

            <div class="stat-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-top: 0; color: #334155; margin-bottom: 15px;">Pedidos por Status</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><span style="color: #64748b;">Pendente</span> <strong>${contagemStatus['Pendente']}</strong></li>
                        <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><span style="color: #64748b;">Em processamento</span> <strong>${contagemStatus['Em processamento']}</strong></li>
                        <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;"><span style="color: #64748b;">Enviado</span> <strong>${contagemStatus['Enviado']}</strong></li>
                        <li style="display: flex; justify-content: space-between; padding: 8px 0;"><span style="color: #64748b;">Concluído</span> <strong style="color: #10b981;">${contagemStatus['Concluído']}</strong></li>
                    </ul>
                </div>
                <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; border: 1px solid #fbcfe8;">
                    <h4 style="margin-top: 0; color: #9d174d; margin-bottom: 15px;">⚠️ Alerta de Reposição (Estoque Crítico)</h4>
                    ${produtosCriticos.length === 0 ? '<p style="color: #be185d;">Todos os produtos têm bom estoque.</p>' : `
                    <div style="max-height: 150px; overflow-y: auto;">
                        <ul style="list-style: none; padding: 0; margin: 0;">
                            ${produtosCriticos.map(p => `
                                <li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f9a8d4;">
                                    <span style="color: #831843; font-size: 0.9rem;">${p.nome}</span> 
                                    <strong style="color: #e11d48; background: #ffe4e6; padding: 2px 6px; border-radius: 4px; font-size: 0.8rem;">${p.quantidade} un.</strong>
                                </li>
                            `).join('')}
                        </ul>
                    </div>`}
                </div>
            </div>

            <h4 style="color: #334155; margin-bottom: 10px;">Vendas Recentes</h4>
            <div class="table-responsive">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #f1f5f9; text-align: left;">
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Data</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Cliente</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Valor</th>
                            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ultimosPedidos.length === 0 ? '<tr><td colspan="4" style="padding: 10px; text-align: center;">Nenhuma venda registada.</td></tr>' : 
                        ultimosPedidos.map(p => `
                            <tr style="border-bottom: 1px solid #e2e8f0;">
                                <td style="padding: 10px; color: #64748b;">${new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                                <td style="padding: 10px; font-weight: bold;">${p.cliente_nome || 'Desconhecido'}</td>
                                <td style="padding: 10px;">R$ ${parseFloat(p.total).toFixed(2).replace('.', ',')}</td>
                                <td style="padding: 10px;"><span style="padding: 3px 6px; border-radius: 4px; font-size: 0.75rem; ${getStatusColor(p.status)}">${p.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        adminLayout('Relatório Detalhado', 'Métricas avançadas e saúde do seu e-commerce.', html);
    } catch (e) {
        console.error("Erro ao gerar relatórios:", e);
        if (typeof exibirMensagem === 'function') exibirMensagem("Falha ao carregar relatórios.", 'erro');
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
};

window.exportarRelatorioCSV = function() {
    if (!window.dadosRelatorioAtual || !window.dadosRelatorioAtual.pedidos) {
        return alert("Nenhum dado carregado para exportação.");
    }
    const pedidos = window.dadosRelatorioAtual.pedidos;
    
    let csv = "ID Pedido;Data;Cliente;Total (R$);Status\n";
    pedidos.forEach(p => {
        const data = new Date(p.data_pedido).toLocaleDateString('pt-BR');
        const valor = parseFloat(p.total).toFixed(2).replace('.', ',');
        const cliente = (p.cliente_nome || 'Desconhecido').replace(/;/g, ' ');
        csv += `${p.id};${data};"${cliente}";${valor};${p.status}\n`;
    });

    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `relatorio_vendas_jr_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

window.imprimirRelatorio = function() {
    window.print();
};

// ==========================================
// CRUD DE PRODUTOS
// ==========================================
window.renderAdminProdutos = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, 'A carregar catálogo...');
    try {
        const res = await apiFetch('api/produtos.php');
        const products = res.dados || [];
        
        const html = `
        <div class="panel">
            <div class="table-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span class="table-count"><strong>${products.length}</strong> produtos registados</span>
                <button class="btn btn-primary" onclick="navegar('admin/produtos/novo')">+ Novo produto</button>
            </div>
            <div class="table-responsive">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Produto</th>
                            <th>Preço</th>
                            <th>Estoque</th>
                            <th>Status</th>
                            <th style="text-align: right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.length === 0 ? `<tr><td colspan="5" style="text-align: center; padding: 20px;">Nenhum produto registado.</td></tr>` : 
                        products.map(p => `<tr>
                            <td><strong>${escapeHtml(p.nome)}</strong></td>
                            <td><strong>${formatarMoeda(p.preco)}</strong></td>
                            <td>${p.quantidade}</td>
                            <td><span class="badge ${p.quantidade > 0 ? 'badge-success' : 'badge-error'}">${p.quantidade > 0 ? 'Disponível' : 'Esgotado'}</span></td>
                            <td style="text-align: right;">
                                <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem; margin-right: 5px; cursor: pointer;" onclick="navegar('admin/produtos/editar', {id: ${p.id}})">Editar</button>
                                <button class="btn" style="padding: 6px 12px; font-size: 0.85rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="excluirProduto(${p.id})">Excluir</button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
        adminLayout('Produtos', 'Gerencie o seu catálogo e preços.', html);
    } catch (e) {
        if (typeof exibirMensagem === 'function') exibirMensagem("Erro ao carregar produtos.", "erro");
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
};

window.renderAdminProdutoForm = async function(params = {}) {
    const id = params.id || null;
    const isEdit = !!id;
    let produto = { nome: '', descricao: '', preco: '', quantidade: 1, imagem: '' };

    if (isEdit) {
        if (typeof mostrarLoading === 'function') mostrarLoading(true, 'A carregar produto...');
        try {
            const res = await apiFetch('api/produtos.php');
            if (res.sucesso) {
                const encontrado = res.dados.find(p => p.id == id);
                if (encontrado) produto = encontrado;
            }
        } catch (e) { console.error(e); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
    }

    const formHtml = `
    <div class="panel" style="max-width: 700px; margin: 0 auto;">
        <form id="form-produto" onsubmit="salvarProduto(event, ${id})">
            <div style="margin-bottom: 15px;">
                <label>Nome do Produto</label>
                <input type="text" id="prod-nome" value="${escapeHtml(produto.nome)}" required style="width:100%; padding:10px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label>Descrição</label>
                <textarea id="prod-descricao" rows="4" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:6px;">${escapeHtml(produto.descricao)}</textarea>
            </div>
            <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                <div style="flex: 1;"><label>Preço (R$)</label><input type="number" id="prod-preco" step="0.01" value="${produto.preco}" required style="width:100%; padding:10px;"></div>
                <div style="flex: 1;"><label>Quantidade em Estoque</label><input type="number" id="prod-quantidade" value="${produto.quantidade}" required style="width:100%; padding:10px;"></div>
            </div>
            <div style="margin-bottom: 25px;">
                <label>Nome da Imagem ou URL</label>
                <input type="text" id="prod-imagem" value="${escapeHtml(produto.imagem)}" style="width:100%; padding:10px;">
            </div>
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" class="btn btn-outline" onclick="navegar('admin/produtos')" style="color:#333; border-color:#ccc;">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar Produto' : 'Guardar Novo Produto'}</button>
            </div>
        </form>
    </div>`;
    adminLayout(isEdit ? 'Editar Produto' : 'Novo Produto', 'Preencha os detalhes do item.', formHtml);
};

window.salvarProduto = async function(event, id) {
    event.preventDefault();
    const dados = {
        acao: 'salvar',
        id: id || null,
        nome: document.getElementById('prod-nome').value,
        descricao: document.getElementById('prod-descricao').value,
        preco: document.getElementById('prod-preco').value,
        quantidade: document.getElementById('prod-quantidade').value,
        imagem: document.getElementById('prod-imagem').value
    };
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A guardar...");
    try {
        const res = await apiFetch('api/produtos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        if (res && res.sucesso) { exibirMensagem("Sucesso!", "sucesso"); navegar('admin/produtos'); } 
        else { exibirMensagem("Erro: " + (res.erro || "Falha ao guardar"), "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.excluirProduto = async function(id) {
    if (!confirm("Tem a certeza que deseja eliminar este produto?")) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A eliminar produto...");
    try {
        const res = await apiFetch('api/produtos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'excluir', id: id }) });
        if (res && res.sucesso) { exibirMensagem("Produto eliminado!", "sucesso"); renderAdminProdutos(); } 
        else { exibirMensagem("Erro ao eliminar.", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

// ==========================================
// CRUD DE CLIENTES
// ==========================================
window.renderAdminClientes = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A carregar clientes...");
    try {
        const res = await apiFetch('api/clientes.php');
        const clients = res.dados || [];
        
        const html = `
        <div class="panel">
            <div class="table-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <span class="table-count"><strong>${clients.length}</strong> utilizadores registados</span>
                <button class="btn btn-primary" onclick="navegar('admin/clientes/novo')">+ Novo Cliente</button>
            </div>
            <div class="table-responsive">
                <table class="admin-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa; text-align: left; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 12px;">Nome</th>
                            <th style="padding: 12px;">E-mail</th>
                            <th style="padding: 12px;">Permissão</th>
                            <th style="padding: 12px; text-align: right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.length === 0 ? `<tr><td colspan="4" style="text-align: center; padding: 20px;">Nenhum cliente.</td></tr>` : 
                        clients.map(c => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 12px;"><strong>${escapeHtml(c.nome)}</strong></td>
                                <td style="padding: 12px; color: #555;">${escapeHtml(c.email)}</td>
                                <td style="padding: 12px;">
                                    <span class="badge" style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; background: ${c.role === 'admin' ? '#e3f2fd; color: #0d47a1;' : '#e8f5e9; color: #1b5e20;'}">
                                        ${c.role === 'admin' ? 'Administrador' : 'Cliente'}
                                    </span>
                                </td>
                                <td style="padding: 12px; text-align: right;">
                                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem; margin-right: 5px;" onclick="navegar('admin/clientes/editar', {id: ${c.id}})">Editar</button>
                                    <button class="btn" style="padding: 6px 12px; font-size: 0.85rem; background: #dc3545; color: white; border: none; border-radius: 4px;" onclick="excluirCliente(${c.id})">Excluir</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
        adminLayout('Clientes', 'Gerencie os usuários do sistema e permissões.', html);
    } catch (e) { exibirMensagem("Falha ao carregar clientes.", 'erro'); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.renderAdminClienteForm = async function(params = {}) {
    const id = params.id || null;
    const isEdit = !!id;
    let cliente = { nome: '', email: '', role: 'cliente' };

    if (isEdit) {
        if (typeof mostrarLoading === 'function') mostrarLoading(true, 'A carregar...');
        try {
            const res = await apiFetch('api/clientes.php');
            if (res.sucesso) {
                const encontrado = res.dados.find(c => c.id == id);
                if (encontrado) cliente = encontrado;
            }
        } catch (e) { console.error(e); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
    }

    const formHtml = `
    <div class="panel" style="max-width: 700px; margin: 0 auto;">
        <form id="form-cliente" onsubmit="salvarCliente(event, ${id})">
            <div style="margin-bottom: 15px;">
                <label>Nome Completo</label>
                <input type="text" id="cli-nome" value="${escapeHtml(cliente.nome)}" required style="width:100%; padding:10px;">
            </div>
            <div style="margin-bottom: 15px;">
                <label>E-mail</label>
                <input type="email" id="cli-email" value="${escapeHtml(cliente.email)}" required style="width:100%; padding:10px;">
            </div>
            <div style="margin-bottom: 25px;">
                <label>Nível de Acesso (Permissão)</label>
                <select id="cli-role" style="width:100%; padding:10px; border: 1px solid #ccc; border-radius: 6px;">
                    <option value="cliente" ${cliente.role === 'cliente' ? 'selected' : ''}>Cliente Padrão</option>
                    <option value="admin" ${cliente.role === 'admin' ? 'selected' : ''}>Administrador do Sistema</option>
                </select>
            </div>
            ${!isEdit ? '<p style="color: #666; font-size: 0.9rem;">Nota: Será atribuída a senha padrão <b>123456</b>.</p>' : ''}
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" class="btn btn-outline" onclick="navegar('admin/clientes')" style="color:#333; border-color:#ccc;">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar Cliente' : 'Guardar Novo Cliente'}</button>
            </div>
        </form>
    </div>`;
    adminLayout(isEdit ? 'Editar Cliente' : 'Novo Cliente', 'Preencha os dados.', formHtml);
};

window.salvarCliente = async function(event, id) {
    event.preventDefault();
    const dados = { acao: 'salvar', id: id || null, nome: document.getElementById('cli-nome').value, email: document.getElementById('cli-email').value, role: document.getElementById('cli-role').value };
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A guardar utilizador...");
    try {
        const res = await apiFetch('api/clientes.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        if (res && res.sucesso) { exibirMensagem("Utilizador guardado!", "sucesso"); navegar('admin/clientes'); } 
        else { exibirMensagem("Erro ao guardar", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.excluirCliente = async function(id) {
    if (!confirm("Eliminar este usuário?")) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A eliminar...");
    try {
        const res = await apiFetch('api/clientes.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'excluir', id: id }) });
        if (res && res.sucesso) { exibirMensagem("Cliente eliminado!", "sucesso"); renderAdminClientes(); } 
        else { exibirMensagem("Erro ao eliminar.", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

// ==========================================
// GESTÃO DE PEDIDOS
// ==========================================
window.renderAdminPedidos = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A carregar pedidos...");
    try {
        const res = await apiFetch('api/pedidos.php');
        const pedidos = res.dados || [];
        
        const getStatusColor = (status) => {
            switch(status) {
                case 'Pendente': return 'background: #fff3cd; color: #856404;';
                case 'Em processamento': return 'background: #cce5ff; color: #004085;';
                case 'Enviado': return 'background: #e2e3e5; color: #383d41;';
                case 'Concluído': return 'background: #d4edda; color: #155724;';
                default: return 'background: #e2e8f0; color: #475569;';
            }
        };

        const html = `
        <div class="panel">
            <div class="table-toolbar" style="margin-bottom: 15px;">
                <span class="table-count"><strong>${pedidos.length}</strong> pedidos registados no sistema</span>
            </div>
            <div class="table-responsive">
                <table class="admin-table" style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f8f9fa; text-align: left; border-bottom: 2px solid #dee2e6;">
                            <th style="padding: 12px;">ID</th>
                            <th style="padding: 12px;">Cliente</th>
                            <th style="padding: 12px;">Data</th>
                            <th style="padding: 12px;">Total</th>
                            <th style="padding: 12px;">Status</th>
                            <th style="padding: 12px; text-align: right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedidos.length === 0 ? `<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum pedido encontrado.</td></tr>` : 
                        pedidos.map(p => `
                            <tr style="border-bottom: 1px solid #eee;">
                                <td style="padding: 12px;"><strong>#${p.id}</strong></td>
                                <td style="padding: 12px;">${escapeHtml(p.cliente_nome || 'Cliente Removido')}</td>
                                <td style="padding: 12px; color: #555;">${new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                                <td style="padding: 12px;"><strong>R$ ${parseFloat(p.total).toFixed(2).replace('.', ',')}</strong></td>
                                <td style="padding: 12px;"><span class="badge" style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; ${getStatusColor(p.status)}">${p.status}</span></td>
                                <td style="padding: 12px; text-align: right; min-width: 180px;">
                                    <select onchange="alterarStatusPedido(${p.id}, this.value)" style="padding: 5px; margin-right: 5px; border-radius: 4px; border: 1px solid #ccc; font-size: 0.85rem;">
                                        <option value="">Alterar...</option>
                                        <option value="Pendente">Pendente</option>
                                        <option value="Em processamento">Em processamento</option>
                                        <option value="Enviado">Enviado</option>
                                        <option value="Concluído">Concluído</option>
                                    </select>
                                    <button class="btn" style="padding: 6px 10px; font-size: 0.85rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="excluirPedido(${p.id})">Excluir</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
        adminLayout('Pedidos', 'Faça a gestão das vendas e acompanhe os envios.', html);
    } catch (e) { exibirMensagem("Falha ao carregar pedidos.", 'erro'); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.alterarStatusPedido = async function(id, novoStatus) {
    if (!novoStatus) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A atualizar status...");
    try {
        const res = await apiFetch('api/pedidos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'atualizar_status', id: id, status: novoStatus }) });
        if (res && res.sucesso) { exibirMensagem("Status atualizado!", "sucesso"); renderAdminPedidos(); } 
        else { exibirMensagem("Erro no servidor", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.excluirPedido = async function(id) {
    if (!confirm("Deseja excluir permanentemente este pedido?")) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A excluir...");
    try {
        const res = await apiFetch('api/pedidos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'excluir', id: id }) });
        if (res && res.sucesso) { exibirMensagem("Pedido excluído!", "sucesso"); renderAdminPedidos(); } 
        else { exibirMensagem("Erro ao excluir", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};
