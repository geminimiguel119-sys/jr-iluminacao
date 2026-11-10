// ==========================================
// PAINEL DE CONTROLE - ADMIN (admin.js)
// ==========================================

window.adminLayout = function(tituloPagina, subtitulo, conteudoHtml, botaoTopo = '') {
    const appContainer = document.getElementById('app') || document.body;
    
    let adminWrapper = document.getElementById('admin-wrapper');
    if (!adminWrapper) {
        document.body.innerHTML = `
        <div id="admin-wrapper" class="admin-layout" style="display: flex; height: 100vh; background: #f8fafc; font-family: 'Poppins', sans-serif;">
            <aside class="admin-sidebar" style="width: 260px; background: #0f172a; color: #fff; display: flex; flex-direction: column; box-shadow: 4px 0 15px rgba(0,0,0,0.05);">
                <div class="sidebar-brand" style="padding: 24px 20px; font-size: 1.25rem; font-weight: 700; border-bottom: 1px solid #1e293b; color: #fca311; display: flex; align-items: center; gap: 10px;">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    JR Admin
                </div>
                <nav style="flex: 1; padding: 24px 16px; display: flex; flex-direction: column; gap: 8px;">
                    <a href="#" onclick="navegar('admin/dashboard'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 12px 16px; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.background='#1e293b'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#cbd5e1';">📊 Visão Geral</a>
                    <a href="#" onclick="navegar('admin/produtos'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 12px 16px; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.background='#1e293b'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#cbd5e1';">📦 Produtos</a>
                    <a href="#" onclick="navegar('admin/clientes'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 12px 16px; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.background='#1e293b'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#cbd5e1';">👥 Clientes</a>
                    <a href="#" onclick="navegar('admin/pedidos'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 12px 16px; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.background='#1e293b'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#cbd5e1';">🛒 Pedidos</a>
                    <a href="#" onclick="navegar('admin/relatorios'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 12px 16px; border-radius: 8px; transition: all 0.2s;" onmouseover="this.style.background='#1e293b'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#cbd5e1';">📈 Relatórios</a>
                </nav>
                <div class="sidebar-bottom" style="padding: 20px; border-top: 1px solid #1e293b;">
                    <button class="btn btn-outline" style="width: 100%; color: #cbd5e1; border: 1px solid #334155; background: transparent; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.background='#334155'; this.style.color='#fff';" onmouseout="this.style.background='transparent'; this.style.color='#cbd5e1';" onclick="sairParaSite();">⬅ Voltar à Loja</button>
                </div>
            </aside>
            <div class="admin-content" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
                <header class="admin-header" style="background: #ffffff; padding: 24px 35px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                    <div>
                        <h1 id="admin-page-title" style="margin: 0; font-size: 1.6rem; color: #0f172a; font-weight: 600; letter-spacing: -0.5px;"></h1>
                        <p id="admin-page-subtitle" style="margin: 6px 0 0 0; color: #64748b; font-size: 0.95rem;"></p>
                    </div>
                    <div id="admin-header-action"></div>
                </header>
                <main id="admin-main-content" style="padding: 35px; flex: 1; max-width: 1400px; margin: 0 auto; width: 100%;"></main>
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

// ==========================================
// VISÃO GERAL
// ==========================================
window.renderDashboard = function() {
    const user = JSON.parse(localStorage.getItem('jr_user') || '{}');
    const nome = user.nome ? user.nome.split(' ')[0] : 'Administrador';

    const html = `
    <div class="panel">
        <div style="text-align: left; padding: 20px 0 40px 0;">
            <h2 style="color: #0f172a; margin-bottom: 10px; font-size: 2rem;">Olá, ${escapeHtml(nome)}! 👋</h2>
            <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 35px;">
                Bem-vindo ao Painel de Controle da JR Iluminação e Leds.
            </p>
            <div class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 25px;">
                
                <div class="card stat-card" style="padding: 25px; border-top: 4px solid #0284c7; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                    <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 1.2rem;">📦 Produtos</h3>
                    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 0.95rem;">Gerenciar catálogo, preços e estoque</p>
                    <button class="btn btn-primary" style="width: 100%; padding: 12px; background: #0284c7; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;" onclick="navegar('admin/produtos')">Acessar Produtos</button>
                </div>
                
                <div class="card stat-card" style="padding: 25px; border-top: 4px solid #16a34a; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                    <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 1.2rem;">👥 Clientes</h3>
                    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 0.95rem;">Gerenciar contas e aprovações</p>
                    <button class="btn btn-primary" style="width: 100%; padding: 12px; background: #16a34a; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;" onclick="navegar('admin/clientes')">Acessar Clientes</button>
                </div>
                
                <div class="card stat-card" style="padding: 25px; border-top: 4px solid #fca311; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
                    <h3 style="margin: 0 0 10px 0; color: #0f172a; font-size: 1.2rem;">🛒 Pedidos</h3>
                    <p style="margin: 0 0 20px 0; color: #64748b; font-size: 0.95rem;">Visualizar vendas e alterar status</p>
                    <button class="btn btn-primary" style="width: 100%; padding: 12px; background: #fca311; color: #14213d; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;" onclick="navegar('admin/pedidos')">Acessar Pedidos</button>
                </div>
                
            </div>
        </div>
    </div>`;
    adminLayout('Visão Geral', 'Resumo e atalhos rápidos do sistema.', html);
};

// ==========================================
// RELATÓRIOS
// ==========================================
window.renderAdminRelatorios = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Gerando relatório detalhado...");
    try {
        const resPedidos = await apiFetch('api/pedidos.php');
        const resProdutos = await apiFetch('api/produtos.php');
        
        const pedidos = resPedidos.dados || [];
        const produtos = resProdutos.dados || [];
        window.dadosRelatorioAtual = { pedidos, produtos };

        let totalFaturado = 0;
        let contagemStatus = { 'Pendente': 0, 'Em processamento': 0, 'Enviado': 0, 'Concluído': 0, 'Cancelado': 0 };
        
        pedidos.forEach(p => {
            if(p.status !== 'Cancelado') totalFaturado += parseFloat(p.total);
            if (contagemStatus[p.status] !== undefined) contagemStatus[p.status]++;
        });
        
        const produtosCriticos = produtos.filter(p => parseInt(p.quantidade) <= 5).sort((a, b) => parseInt(a.quantidade) - parseInt(b.quantidade));
        const ultimosPedidos = pedidos.slice(0, 8);

        const getStatusColor = (status) => {
            switch(status) {
                case 'Pendente': return 'background: #fef08a; color: #854d0e;';
                case 'Em processamento': return 'background: #bae6fd; color: #0369a1;';
                case 'Enviado': return 'background: #e2e8f0; color: #334155;';
                case 'Concluído': 
                case 'Entregue': return 'background: #bbf7d0; color: #15803d;';
                case 'Cancelado': return 'background: #fecaca; color: #b91c1c;';
                default: return 'background: #e2e8f0; color: #475569;';
            }
        };

        const html = `
        <div class="panel" style="padding: 25px; background: #fff; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 25px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">
                <h3 style="margin: 0; color: #0f172a; font-size: 1.25rem;">Visão Geral de Desempenho</h3>
                <div style="display: flex; gap: 8px;">
                    <button class="btn" onclick="exportarRelatorioCSV()" style="padding: 8px 16px; font-size: 0.85rem; font-weight: 500; background: #0284c7; color: #fff; border: none; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 5px rgba(2,132,199,0.2);">📥 Exportar CSV</button>
                    <button class="btn" onclick="imprimirRelatorio()" style="padding: 8px 16px; font-size: 0.85rem; font-weight: 500; background: #fff; color: #334155; border: 1px solid #cbd5e1; border-radius: 6px; cursor: pointer;">🖨️ Imprimir</button>
                </div>
            </div>
            
            <div class="stat-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 35px;">
                <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 500;">Faturamento (Bruto)</p>
                    <h2 style="margin: 10px 0 0 0; color: #0284c7; font-size: 1.8rem;">R$ ${totalFaturado.toFixed(2).replace('.', ',')}</h2>
                </div>
                <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 500;">Total de Pedidos</p>
                    <h2 style="margin: 10px 0 0 0; color: #0f172a; font-size: 1.8rem;">${pedidos.length}</h2>
                </div>
                <div style="background: #ffffff; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                    <p style="margin: 0; color: #64748b; font-size: 0.9rem; font-weight: 500;">Produtos no Catálogo</p>
                    <h2 style="margin: 10px 0 0 0; color: #0f172a; font-size: 1.8rem;">${produtos.length}</h2>
                </div>
            </div>

            <div class="stat-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 35px;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-top: 0; color: #334155; margin-bottom: 15px;">Pedidos por Status</h4>
                    <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.95rem;">
                        <li style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #cbd5e1;"><span style="color: #64748b;">Pendente</span> <strong>${contagemStatus['Pendente']}</strong></li>
                        <li style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #cbd5e1;"><span style="color: #64748b;">Em processamento</span> <strong>${contagemStatus['Em processamento']}</strong></li>
                        <li style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #cbd5e1;"><span style="color: #64748b;">Enviado</span> <strong>${contagemStatus['Enviado']}</strong></li>
                        <li style="display: flex; justify-content: space-between; padding: 10px 0;"><span style="color: #64748b;">Concluído / Entregue</span> <strong style="color: #10b981;">${contagemStatus['Concluído']}</strong></li>
                    </ul>
                </div>
                <div style="background: #fef2f2; padding: 20px; border-radius: 12px; border: 1px solid #fecaca;">
                    <h4 style="margin-top: 0; color: #991b1b; margin-bottom: 15px;">⚠️ Alerta de Estoque</h4>
                    ${produtosCriticos.length === 0 ? '<p style="color: #b91c1c; font-size: 0.95rem;">Todos os produtos possuem um bom estoque.</p>' : `
                    <div style="max-height: 180px; overflow-y: auto;">
                        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.9rem;">
                            ${produtosCriticos.map(p => `
                                <li style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #fca5a5;">
                                    <span style="color: #7f1d1d;">${p.nome}</span> 
                                    <strong style="color: #dc2626; background: #fee2e2; padding: 4px 8px; border-radius: 6px;">${p.quantidade} un.</strong>
                                </li>
                            `).join('')}
                        </ul>
                    </div>`}
                </div>
            </div>

            <h4 style="color: #0f172a; margin-bottom: 15px;">Vendas Recentes</h4>
            <div class="table-responsive" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #f8fafc; text-align: left;">
                            <th style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600;">Data</th>
                            <th style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600;">Cliente</th>
                            <th style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600;">Valor Total</th>
                            <th style="padding: 12px 15px; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ultimosPedidos.length === 0 ? '<tr><td colspan="4" style="padding: 15px; text-align: center; color: #64748b;">Nenhuma venda registrada.</td></tr>' : 
                        ultimosPedidos.map(p => `
                            <tr style="border-bottom: 1px solid #f1f5f9; background: #fff; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
                                <td style="padding: 12px 15px; color: #64748b;">${new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                                <td style="padding: 12px 15px; font-weight: 500; color: #0f172a;">${p.cliente_nome || 'Desconhecido'}</td>
                                <td style="padding: 12px 15px; font-weight: 600; color: #0284c7;">R$ ${parseFloat(p.total).toFixed(2).replace('.', ',')}</td>
                                <td style="padding: 12px 15px;"><span style="padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; ${getStatusColor(p.status)}">${p.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        adminLayout('Relatório Detalhado', 'Métricas avançadas e saúde do seu e-commerce.', html);
    } catch (e) {
        if (typeof exibirMensagem === 'function') exibirMensagem("Falha ao carregar relatórios.", 'erro');
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
};

window.exportarRelatorioCSV = function() {
    if (!window.dadosRelatorioAtual || !window.dadosRelatorioAtual.pedidos) return alert("Sem dados para exportar.");
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
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
};
window.imprimirRelatorio = function() { window.print(); };

// ==========================================
// CRUD DE PRODUTOS
// ==========================================
window.renderAdminProdutos = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, 'Carregando catálogo...');
    try {
        const res = await apiFetch('api/produtos.php');
        const products = res.dados || [];
        
        const html = `
        <div class="panel" style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
            <div class="table-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span class="table-count" style="color: #64748b; font-size: 0.95rem;"><strong>${products.length}</strong> produtos registrados</span>
                <button class="btn btn-primary" style="background: #0284c7; color: white; font-weight: 600; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(2,132,199,0.25);" onclick="navegar('admin/produtos/novo')">+ Novo Produto</button>
            </div>
            <div class="table-responsive" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <table class="admin-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #f8fafc; text-align: left;">
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Produto</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Preço</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Estoque</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Status</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.length === 0 ? `<tr><td colspan="5" style="text-align: center; padding: 30px; color: #94a3b8;">Nenhum produto cadastrado.</td></tr>` : 
                        products.map(p => `
                        <tr style="border-bottom: 1px solid #f1f5f9; background: #fff; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
                            <td style="padding: 14px 15px; font-weight: 500; color: #0f172a;">${escapeHtml(p.nome)}</td>
                            <td style="padding: 14px 15px; font-weight: 600; color: #0284c7;">${formatarMoeda(p.preco)}</td>
                            <td style="padding: 14px 15px; color: #64748b;">${p.quantidade} un.</td>
                            <td style="padding: 14px 15px;"><span style="padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; background: ${p.quantidade > 0 ? '#dcfce7; color: #166534' : '#fee2e2; color: #991b1b'}">${p.quantidade > 0 ? 'Disponível' : 'Esgotado'}</span></td>
                            <td style="padding: 14px 15px; text-align: right;">
                                <button class="btn btn-outline" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 500; margin-right: 5px; cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px;" onclick="navegar('admin/produtos/editar', {id: ${p.id}})">Editar</button>
                                <button class="btn" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 500; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="excluirProduto(${p.id})">Excluir</button>
                            </td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
        adminLayout('Produtos', 'Gerencie o seu catálogo e controle o estoque.', html);
    } catch (e) {
        if (typeof exibirMensagem === 'function') exibirMensagem("Erro ao carregar produtos.", "erro");
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
};

window.renderAdminProdutoForm = async function(params = {}) {
    const id = params.id || null;
    const isEdit = !!id;
    let produto = { nome: '', descricao: '', categoria: 'outros', preco: '', quantidade: 1, imagem: '' };

    if (isEdit) {
        if (typeof mostrarLoading === 'function') mostrarLoading(true, 'Carregando produto...');
        try {
            const res = await apiFetch('api/produtos.php');
            if (res.sucesso) {
                const encontrado = res.dados.find(p => p.id == id);
                if (encontrado) produto = encontrado;
            }
        } catch (e) { console.error(e); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
    }

    const formHtml = `
    <div class="panel" style="max-width: 750px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;">
        <form id="form-produto" onsubmit="salvarProduto(event, ${id})">
            
            <div style="margin-bottom: 18px;">
                <label style="display:block; margin-bottom:6px; font-weight: 600; font-size: 0.9rem; color: #334155;">Nome do Produto</label>
                <input type="text" id="prod-nome" value="${escapeHtml(produto.nome)}" required style="width:100%; padding:12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: border 0.2s;" onfocus="this.style.borderColor='#0284c7'" onblur="this.style.borderColor='#cbd5e1'">
            </div>

            <div style="margin-bottom: 18px;">
                <label style="display:block; margin-bottom:6px; font-weight: 600; font-size: 0.9rem; color: #334155;">Categoria</label>
                <select id="prod-categoria" style="width:100%; padding:12px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; font-family: inherit; font-size: 0.95rem; outline: none;">
                    <option value="fita" ${produto.categoria === 'fita' ? 'selected' : ''}>Fitas LED</option>
                    <option value="spot" ${produto.categoria === 'spot' ? 'selected' : ''}>Spots & Embutidos</option>
                    <option value="lampada" ${produto.categoria === 'lampada' ? 'selected' : ''}>Lâmpadas</option>
                    <option value="painel" ${produto.categoria === 'painel' ? 'selected' : ''}>Painéis Plafon</option>
                    <option value="outros" ${!['fita','spot','lampada','painel'].includes(produto.categoria) ? 'selected' : ''}>Outros / Diversos</option>
                </select>
            </div>

            <div style="margin-bottom: 18px;">
                <label style="display:block; margin-bottom:6px; font-weight: 600; font-size: 0.9rem; color: #334155;">Descrição Detalhada</label>
                <textarea id="prod-descricao" rows="5" style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px; font-family: inherit; font-size: 0.95rem; outline: none; resize: vertical;" onfocus="this.style.borderColor='#0284c7'" onblur="this.style.borderColor='#cbd5e1'">${escapeHtml(produto.descricao)}</textarea>
            </div>
            
            <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <label style="display:block; margin-bottom:6px; font-weight: 600; font-size: 0.9rem; color: #334155;">Preço (R$)</label>
                    <input type="number" id="prod-preco" step="0.01" value="${produto.preco}" required style="width:100%; padding:12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none;" onfocus="this.style.borderColor='#0284c7'" onblur="this.style.borderColor='#cbd5e1'">
                </div>
                <div style="flex: 1;">
                    <label style="display:block; margin-bottom:6px; font-weight: 600; font-size: 0.9rem; color: #334155;">Estoque (Unidades)</label>
                    <input type="number" id="prod-quantidade" value="${produto.quantidade}" required style="width:100%; padding:12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none;" onfocus="this.style.borderColor='#0284c7'" onblur="this.style.borderColor='#cbd5e1'">
                </div>
            </div>
            
            <div style="margin-bottom: 25px; padding: 20px; background: #f0f9ff; border-radius: 8px; border: 2px dashed #7dd3fc;">
                <label style="display:block; margin-bottom:10px; font-weight: 600; color: #0284c7; font-size: 0.95rem;">📷 Foto do Produto</label>
                <input type="file" id="prod-imagem-file" accept="image/png, image/jpeg, image/webp" style="width:100%; padding:10px; background: #fff; cursor: pointer; border-radius: 6px; border: 1px solid #bae6fd; font-size: 0.9rem;">
                
                ${produto.imagem ? `
                <div style="margin-top: 15px; display: flex; align-items: center; gap: 15px; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #bae6fd;">
                    <img src="${escapeHtml(produto.imagem)}" style="height: 65px; width: 65px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;"> 
                    <span style="font-size: 0.85rem; color: #475569;">Esta é a foto atual. Adicione um novo arquivo acima apenas se desejar alterá-la.</span>
                </div>` : ''}
                
                <input type="hidden" id="prod-imagem-atual" value="${escapeHtml(produto.imagem)}">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 15px; border-top: 1px solid #f1f5f9;">
                <button type="button" class="btn btn-outline" onclick="navegar('admin/produtos')" style="padding: 12px 20px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #475569; font-weight: 600; cursor: pointer;">Cancelar</button>
                <button type="submit" class="btn btn-primary" style="padding: 12px 20px; border: none; border-radius: 8px; background: #0284c7; color: #fff; font-weight: 600; cursor: pointer; box-shadow: 0 4px 10px rgba(2,132,199,0.25);">${isEdit ? 'Atualizar Produto' : 'Salvar Novo Produto'}</button>
            </div>
        </form>
    </div>`;
    adminLayout(isEdit ? 'Editar Produto' : 'Novo Produto', 'Preencha os detalhes e adicione uma boa imagem para vendas.', formHtml);
};

window.salvarProduto = async function(event, id) {
    event.preventDefault();
    
    const btnSubmit = event.target.querySelector('button[type="submit"]');
    if (btnSubmit) { btnSubmit.disabled = true; btnSubmit.innerHTML = 'Salvando...'; }

    let caminhoFinalImagem = document.getElementById('prod-imagem-atual').value;
    const fileInput = document.getElementById('prod-imagem-file');

    if (fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('imagem', fileInput.files[0]);
        
        if (typeof mostrarLoading === 'function') mostrarLoading(true, "Enviando imagem...");
        try {
            const token = localStorage.getItem('jr_token') || '';
            const resUpload = await fetch('api/upload.php', { 
                method: 'POST', 
                body: formData,
                headers: { 'Authorization': 'Bearer ' + token }
            });
            const dataUpload = await resUpload.json();
            
            if (dataUpload.sucesso) {
                caminhoFinalImagem = dataUpload.dados.caminho;
            } else {
                throw new Error(dataUpload.mensagem || dataUpload.erro || 'Falha no upload');
            }
        } catch(e) {
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerHTML = id ? 'Atualizar Produto' : 'Salvar Novo Produto'; }
            if (typeof mostrarLoading === 'function') mostrarLoading(false);
            if (typeof exibirMensagem === 'function') exibirMensagem(e.message, 'erro');
            return; 
        }
    }

    const dados = {
        acao: 'salvar',
        id: id || null,
        nome: document.getElementById('prod-nome').value,
        categoria: document.getElementById('prod-categoria').value,
        descricao: document.getElementById('prod-descricao').value,
        preco: document.getElementById('prod-preco').value,
        quantidade: document.getElementById('prod-quantidade').value,
        imagem: caminhoFinalImagem
    };
    
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Salvando dados no sistema...");
    try {
        const res = await apiFetch('api/produtos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        if (res && res.sucesso) { 
            if (typeof Swal !== 'undefined') Swal.fire('Feito!', 'Produto salvo com sucesso.', 'success'); 
            navegar('admin/produtos'); 
        } else { 
            if (typeof Swal !== 'undefined') Swal.fire('Aviso', res.erro || 'Falha ao salvar.', 'warning'); 
            if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerHTML = id ? 'Atualizar Produto' : 'Salvar Novo Produto'; }
        }
    } catch (erro) { 
        if (btnSubmit) { btnSubmit.disabled = false; btnSubmit.innerHTML = id ? 'Atualizar Produto' : 'Salvar Novo Produto'; }
    } finally { 
        if (typeof mostrarLoading === 'function') mostrarLoading(false); 
    }
};

window.excluirProduto = async function(id) {
    if (!confirm("Tem certeza que deseja excluir este produto permanentemente?")) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Excluindo produto...");
    try {
        const res = await apiFetch('api/produtos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'excluir', id: id }) });
        if (res && res.sucesso) { exibirMensagem("Produto excluído!", "sucesso"); renderAdminProdutos(); } 
        else { exibirMensagem("Erro ao excluir.", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

// ==========================================
// CRUD DE CLIENTES E PEDIDOS
// ==========================================
window.renderAdminClientes = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Carregando clientes...");
    try {
        const res = await apiFetch('api/clientes.php');
        const clients = res.dados || [];
        
        const html = `
        <div class="panel" style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
            <div class="table-toolbar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <span class="table-count" style="color: #64748b; font-size: 0.95rem;"><strong>${clients.length}</strong> usuários cadastrados</span>
                <button class="btn btn-primary" style="background: #0284c7; color: white; border: none; font-weight: 600; padding: 10px 18px; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 8px rgba(2,132,199,0.25);" onclick="navegar('admin/clientes/novo')">+ Novo Cliente</button>
            </div>
            <div class="table-responsive" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <table class="admin-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #f8fafc; text-align: left;">
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Nome</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">E-mail</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Permissão / Status</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.length === 0 ? `<tr><td colspan="4" style="text-align: center; padding: 30px; color: #94a3b8;">Nenhum cliente cadastrado.</td></tr>` : 
                        clients.map(c => `
                            <tr style="border-bottom: 1px solid #f1f5f9; background: #fff; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
                                <td style="padding: 14px 15px; font-weight: 500; color: #0f172a;">${escapeHtml(c.nome)}</td>
                                <td style="padding: 14px 15px; color: #64748b;">${escapeHtml(c.email)}</td>
                                <td style="padding: 14px 15px;">
                                    <span class="badge" style="padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; background: ${c.status === 'Pendente' ? '#fef08a; color: #854d0e;' : '#dcfce7; color: #166534;'}">
                                        ${c.status || (c.role === 'admin' ? 'Administrador' : 'Aprovado')}
                                    </span>
                                </td>
                                <td style="padding: 14px 15px; text-align: right;">
                                    ${c.status === 'Pendente' ? `<button class="btn" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 500; margin-right: 5px; background: #16a34a; color: #fff; border: none; border-radius: 6px; cursor: pointer;" onclick="aprovarClienteWeb(${c.id})">✅ Aprovar</button>` : ''}
                                    <button class="btn btn-outline" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 500; margin-right: 5px; cursor: pointer; border: 1px solid #cbd5e1; background: #fff; border-radius: 6px;" onclick="navegar('admin/clientes/editar', {id: ${c.id}})">Editar</button>
                                    <button class="btn" style="padding: 6px 14px; font-size: 0.85rem; font-weight: 500; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="excluirCliente(${c.id})">Excluir</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
        adminLayout('Clientes', 'Gerencie aprovações de acesso e permissões.', html);
    } catch (e) { console.error(e); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.aprovarClienteWeb = async function(id) {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Aprovando cliente...");
    try {
        const res = await apiFetch('api/clientes.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'aprovar', id: id }) });
        if (res && res.sucesso) { if (typeof Swal !== 'undefined') Swal.fire('Sucesso', 'Cliente Aprovado e acesso liberado!', 'success'); renderAdminClientes(); } 
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.renderAdminClienteForm = async function(params = {}) {
    const id = params.id || null;
    const isEdit = !!id;
    let cliente = { nome: '', email: '', role: 'cliente' };

    if (isEdit) {
        if (typeof mostrarLoading === 'function') mostrarLoading(true, 'Carregando dados...');
        try {
            const res = await apiFetch('api/clientes.php');
            if (res.sucesso) {
                const encontrado = res.dados.find(c => c.id == id);
                if (encontrado) cliente = encontrado;
            }
        } catch (e) { console.error(e); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
    }

    const formHtml = `
    <div class="panel" style="max-width: 700px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9;">
        <form id="form-cliente" onsubmit="salvarCliente(event, ${id})">
            <div style="margin-bottom: 18px;">
                <label style="display:block; margin-bottom:6px; font-weight: 600; font-size: 0.9rem; color: #334155;">Nome Completo</label>
                <input type="text" id="cli-nome" value="${escapeHtml(cliente.nome)}" required style="width:100%; padding:12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: border 0.2s;" onfocus="this.style.borderColor='#0284c7'" onblur="this.style.borderColor='#cbd5e1'">
            </div>
            <div style="margin-bottom: 18px;">
                <label style="display:block; margin-bottom:6px; font-weight: 600; font-size: 0.9rem; color: #334155;">E-mail de Acesso</label>
                <input type="email" id="cli-email" value="${escapeHtml(cliente.email)}" required style="width:100%; padding:12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; transition: border 0.2s;" onfocus="this.style.borderColor='#0284c7'" onblur="this.style.borderColor='#cbd5e1'">
            </div>
            <div style="margin-bottom: 25px;">
                <label style="display:block; margin-bottom:6px; font-weight: 600; font-size: 0.9rem; color: #334155;">Nível de Permissão</label>
                <select id="cli-role" style="width:100%; padding:12px; border: 1px solid #cbd5e1; border-radius: 8px; font-family: inherit; font-size: 0.95rem; outline: none; background: #fff;">
                    <option value="cliente" ${cliente.role === 'cliente' ? 'selected' : ''}>Cliente Padrão (Apenas Compras)</option>
                    <option value="admin" ${cliente.role === 'admin' ? 'selected' : ''}>Administrador (Acesso Total)</option>
                </select>
            </div>
            ${!isEdit ? '<div style="background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px dashed #cbd5e1; margin-bottom: 25px;"><p style="color: #64748b; font-size: 0.85rem; margin: 0;"><strong>Nota:</strong> Será atribuída a senha padrão <b>123456</b> para este novo usuário.</p></div>' : ''}
            
            <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 15px; border-top: 1px solid #f1f5f9;">
                <button type="button" class="btn btn-outline" onclick="navegar('admin/clientes')" style="padding: 12px 20px; border: 1px solid #cbd5e1; border-radius: 8px; background: #fff; color: #475569; font-weight: 600; cursor: pointer;">Cancelar</button>
                <button type="submit" class="btn btn-primary" style="padding: 12px 20px; border: none; border-radius: 8px; background: #0284c7; color: #fff; font-weight: 600; cursor: pointer; box-shadow: 0 4px 10px rgba(2,132,199,0.25);">${isEdit ? 'Atualizar Cliente' : 'Salvar Novo Cliente'}</button>
            </div>
        </form>
    </div>`;
    adminLayout(isEdit ? 'Editar Cliente' : 'Novo Cliente', 'Preencha os dados do usuário.', formHtml);
};

window.salvarCliente = async function(event, id) {
    event.preventDefault();
    const dados = { acao: 'salvar', id: id || null, nome: document.getElementById('cli-nome').value, email: document.getElementById('cli-email').value, role: document.getElementById('cli-role').value };
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Salvando usuário no sistema...");
    try {
        const res = await apiFetch('api/clientes.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) });
        if (res && res.sucesso) { exibirMensagem("Usuário salvo com sucesso!", "sucesso"); navegar('admin/clientes'); } 
        else { exibirMensagem("Erro ao salvar", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.excluirCliente = async function(id) {
    if (!confirm("Tem certeza que deseja excluir permanentemente este usuário?")) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Excluindo usuário...");
    try {
        const res = await apiFetch('api/clientes.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'excluir', id: id }) });
        if (res && res.sucesso) { exibirMensagem("Cliente excluído!", "sucesso"); renderAdminClientes(); } 
        else { exibirMensagem("Erro ao excluir.", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.renderAdminPedidos = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Carregando pedidos...");
    try {
        const res = await apiFetch('api/pedidos.php');
        const pedidos = res.dados || [];
        
        const getStatusColor = (status) => {
            switch(status) {
                case 'Pendente': return 'background: #fef08a; color: #854d0e;';
                case 'Em processamento': return 'background: #bae6fd; color: #0369a1;';
                case 'Enviado': return 'background: #e2e8f0; color: #334155;';
                case 'Concluído': 
                case 'Entregue': return 'background: #bbf7d0; color: #15803d;';
                case 'Cancelado': return 'background: #fecaca; color: #b91c1c;';
                default: return 'background: #e2e8f0; color: #475569;';
            }
        };

        const html = `
        <div class="panel" style="background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
            <div class="table-toolbar" style="margin-bottom: 20px;">
                <span class="table-count" style="color: #64748b; font-size: 0.95rem;"><strong>${pedidos.length}</strong> pedidos registrados no sistema</span>
            </div>
            <div class="table-responsive" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <table class="admin-table" style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #f8fafc; text-align: left;">
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">ID</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Cliente</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Data</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Valor Total</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569;">Status Atual</th>
                            <th style="padding: 14px 15px; border-bottom: 1px solid #e2e8f0; color: #475569; text-align: right;">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pedidos.length === 0 ? `<tr><td colspan="6" style="text-align: center; padding: 30px; color: #94a3b8;">Nenhum pedido encontrado.</td></tr>` : 
                        pedidos.map(p => `
                            <tr style="border-bottom: 1px solid #f1f5f9; background: #fff; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='#fff'">
                                <td style="padding: 14px 15px; font-weight: 600; color: #0f172a;">#${p.id}</td>
                                <td style="padding: 14px 15px; font-weight: 500; color: #0f172a;">${escapeHtml(p.cliente_nome || 'Cliente Removido')}</td>
                                <td style="padding: 14px 15px; color: #64748b;">${new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                                <td style="padding: 14px 15px; font-weight: 600; color: #0284c7;">R$ ${parseFloat(p.total).toFixed(2).replace('.', ',')}</td>
                                <td style="padding: 14px 15px;">
                                    <span class="badge" style="padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; ${getStatusColor(p.status)}">
                                        ${p.status}
                                    </span>
                                </td>
                                <td style="padding: 14px 15px; text-align: right; min-width: 200px;">
                                    <select onchange="alterarStatusPedido(${p.id}, this.value)" style="padding: 6px; margin-right: 5px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.85rem; cursor: pointer; outline: none; background: #fff;">
                                        <option value="">Alterar Status...</option>
                                        <option value="Pendente">Pendente</option>
                                        <option value="Em processamento">Em processamento</option>
                                        <option value="Enviado">Enviado</option>
                                        <option value="Concluído">Concluído</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                    <button class="btn" style="padding: 6px 12px; font-size: 0.85rem; font-weight: 500; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;" onclick="excluirPedido(${p.id})">Excluir</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        adminLayout('Pedidos', 'Faça o acompanhamento e gestão de vendas realizadas.', html);
    } catch (e) { 
        console.error("Erro ao carregar pedidos:", e);
        if (typeof exibirMensagem === 'function') exibirMensagem("Falha ao carregar pedidos.", 'erro'); 
    } finally { 
        if (typeof mostrarLoading === 'function') mostrarLoading(false); 
    }
};

window.alterarStatusPedido = async function(id, novoStatus) {
    if (!novoStatus) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Atualizando status do pedido...");
    try {
        const res = await apiFetch('api/pedidos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'atualizar_status', id: id, status: novoStatus }) });
        if (res && res.sucesso) { exibirMensagem("Status atualizado com sucesso!", "sucesso"); renderAdminPedidos(); } 
        else { exibirMensagem("Erro interno no servidor.", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};

window.excluirPedido = async function(id) {
    if (!confirm("Atenção: Deseja excluir permanentemente este pedido da base de dados?")) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Excluindo pedido...");
    try {
        const res = await apiFetch('api/pedidos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'excluir', id: id }) });
        if (res && res.sucesso) { exibirMensagem("Pedido excluído permanentemente!", "sucesso"); renderAdminPedidos(); } 
        else { exibirMensagem("Erro ao excluir pedido.", "erro"); }
    } catch (erro) { console.error(erro); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
};
