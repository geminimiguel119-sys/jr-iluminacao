// ==========================================
// PAINEL DE CONTROLO - ADMIN (admin.js)
// ==========================================

// ==========================================
// LAYOUT PADRÃO DO PAINEL ADMINISTRATIVO
// ==========================================
window.adminLayout = function(tituloPagina, subtitulo, conteudoHtml, botaoTopo = '') {
    const appContainer = document.getElementById('app') || document.body;
    
    // Verifica se já existe o layout do admin, senão cria a estrutura base
    let adminWrapper = document.getElementById('admin-wrapper');
    if (!adminWrapper) {
        document.body.innerHTML = `
        <div id="admin-wrapper" style="display: flex; height: 100vh; background: #f4f6f9; font-family: sans-serif;">
            <!-- MENU LATERAL -->
            <aside style="width: 260px; background: #1e293b; color: #fff; display: flex; flex-direction: column;">
                <div style="padding: 20px; font-size: 1.2rem; font-weight: bold; border-bottom: 1px solid #334155; color: #38bdf8;">
                    JR Admin
                </div>
                <nav style="flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 10px;">
                    <a href="#" onclick="navegar('admin/dashboard'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 10px; border-radius: 6px; display: block;">Visão Geral</a>
                    <a href="#" onclick="navegar('admin/produtos'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 10px; border-radius: 6px; display: block;">Produtos</a>
                    <a href="#" onclick="navegar('admin/clientes'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 10px; border-radius: 6px; display: block;">Clientes</a>
                    <a href="#" onclick="navegar('admin/pedidos'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 10px; border-radius: 6px; display: block;">Pedidos</a>
                    
                    <!-- NOVO BOTÃO DE RELATÓRIOS AQUI -->
                    <a href="#" onclick="navegar('admin/relatorios'); return false;" style="color: #cbd5e1; text-decoration: none; padding: 10px; border-radius: 6px; display: block;">Relatórios</a>
                    
                    <!-- BOTÃO VOLTAR AO SITE COM RECARREGAMENTO FORÇADO -->
                    <a href="#" onclick="sairParaSite(); return false;" style="color: #94a3b8; text-decoration: none; padding: 10px; border-radius: 6px; display: block; margin-top: auto; border-top: 1px solid #334155;">⬅ Voltar ao Site</a>
                </nav>
            </aside>
            
            <!-- CONTEÚDO PRINCIPAL -->
            <div style="flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
                <header style="background: #fff; padding: 20px 30px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
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

    // Atualiza o conteúdo dinamicamente
    document.getElementById('admin-page-title').innerText = tituloPagina;
    document.getElementById('admin-page-subtitle').innerText = subtitulo;
    document.getElementById('admin-header-action').innerHTML = botaoTopo;
    document.getElementById('admin-main-content').innerHTML = conteudoHtml;
};

// Nova função para sair do admin e restaurar o site público perfeitamente
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
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto;">
                <div class="card" style="padding: 20px; border-left: 4px solid #1E88E5; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">Produtos</h3>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 0.9rem;">Gerir catálogo e preços</p>
                    <button class="btn btn-primary" style="width: 100%; padding: 8px;" onclick="navegar('admin/produtos')">Gerir Produtos</button>
                </div>
                
                <div class="card" style="padding: 20px; border-left: 4px solid #43A047; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">Clientes</h3>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 0.9rem;">Gerir contas e permissões</p>
                    <button class="btn btn-primary" style="width: 100%; padding: 8px; background: #43A047;" onclick="navegar('admin/clientes')">Gerir Clientes</button>
                </div>

                <div class="card" style="padding: 20px; border-left: 4px solid #F57C00; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); text-align: left;">
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
// CRUD DE PRODUTOS
// ==========================================
window.renderAdminProdutos = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, 'A carregar catálogo...');
    try {
        const res = await apiFetch('api/produtos.php');
        const products = res.dados || [];
        
        adminLayout('Produtos', 'Gerencie o seu catálogo e preços.', `
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
        </div>`);
    } catch (e) {
        console.error("Erro ao carregar CRUD de produtos", e);
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
        } catch (e) {
            console.error(e);
        } finally {
            if (typeof mostrarLoading === 'function') mostrarLoading(false);
        }
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
                <div style="flex: 1;">
                    <label>Preço (R$)</label>
                    <input type="number" id="prod-preco" step="0.01" value="${produto.preco}" required style="width:100%; padding:10px;">
                </div>
                <div style="flex: 1;">
                    <label>Quantidade em Estoque</label>
                    <input type="number" id="prod-quantidade" value="${produto.quantidade}" required style="width:100%; padding:10px;">
                </div>
            </div>
            <div style="margin-bottom: 25px;">
                <label>Nome da Imagem (opcional, ex: produto1.jpg)</label>
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
        const res = await apiFetch('api/produtos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (res && res.sucesso) {
            if (typeof exibirMensagem === 'function') exibirMensagem("Sucesso!", "sucesso");
            navegar('admin/produtos');
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem("Erro: " + (res.erro || "Falha ao guardar"), "erro");
        }
    } catch (erro) {
        console.error("Falha ao salvar produto:", erro);
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
};

window.excluirProduto = async function(id) {
    if (!confirm("Tem a certeza que deseja eliminar este produto?")) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A eliminar produto...");
    try {
        const res = await apiFetch('api/produtos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'excluir', id: id })
        });
        if (res && res.sucesso) {
            if (typeof exibirMensagem === 'function') exibirMensagem("Produto eliminado com sucesso!", "sucesso");
            renderAdminProdutos();
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem("Erro ao eliminar: " + (res.erro || "Falha no servidor"), "erro");
        }
    } catch (erro) {
        console.error("Falha na eliminação:", erro);
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
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
                        ${clients.length === 0 ? `<tr><td colspan="4" style="text-align: center; padding: 20px;">Nenhum cliente encontrado.</td></tr>` : 
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
                                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.85rem; margin-right: 5px; cursor: pointer;" onclick="navegar('admin/clientes/editar', {id: ${c.id}})">Editar</button>
                                    <button class="btn" style="padding: 6px 12px; font-size: 0.85rem; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer;" onclick="excluirCliente(${c.id})">Excluir</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;

        adminLayout('Clientes', 'Gerencie os usuários do sistema e permissões.', html);
    } catch (e) { 
        console.error("Erro ao carregar clientes:", e);
        if (typeof exibirMensagem === 'function') exibirMensagem("Falha ao carregar clientes.", 'erro'); 
    } finally { 
        if (typeof mostrarLoading === 'function') mostrarLoading(false); 
    }
};

window.renderAdminClienteForm = async function(params = {}) {
    const id = params.id || null;
    const isEdit = !!id;
    let cliente = { nome: '', email: '', role: 'cliente' };

    if (isEdit) {
        if (typeof mostrarLoading === 'function') mostrarLoading(true, 'A carregar dados do cliente...');
        try {
            const res = await apiFetch('api/clientes.php');
            if (res.sucesso) {
                const encontrado = res.dados.find(c => c.id == id);
                if (encontrado) cliente = encontrado;
            }
        } catch (e) {
            console.error(e);
        } finally {
            if (typeof mostrarLoading === 'function') mostrarLoading(false);
        }
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
            ${!isEdit ? '<p style="color: #666; font-size: 0.9rem; margin-bottom: 15px;">Nota: Será atribuída a senha padrão <b>123456</b> a este novo utilizador.</p>' : ''}
            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button type="button" class="btn btn-outline" onclick="navegar('admin/clientes')" style="color:#333; border-color:#ccc;">Cancelar</button>
                <button type="submit" class="btn btn-primary">${isEdit ? 'Atualizar Cliente' : 'Guardar Novo Cliente'}</button>
            </div>
        </form>
    </div>`;

    adminLayout(isEdit ? 'Editar Cliente' : 'Novo Cliente', 'Preencha os dados do utilizador.', formHtml);
};

window.salvarCliente = async function(event, id) {
    event.preventDefault();
    const dados = {
        acao: 'salvar',
        id: id || null,
        nome: document.getElementById('cli-nome').value,
        email: document.getElementById('cli-email').value,
        role: document.getElementById('cli-role').value
    };

    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A guardar utilizador...");
    try {
        const res = await apiFetch('api/clientes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (res && res.sucesso) {
            if (typeof exibirMensagem === 'function') exibirMensagem("Utilizador guardado com sucesso!", "sucesso");
            navegar('admin/clientes'); 
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem("Erro: " + (res.erro || "Falha ao guardar"), "erro");
        }
    } catch (erro) {
        console.error("Falha ao salvar cliente:", erro);
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
};

window.excluirCliente = async function(id) {
    if (!confirm("Tem a certeza que deseja eliminar este usuário?")) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A eliminar cliente...");
    try {
        const res = await apiFetch('api/clientes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'excluir', id: id })
        });
        if (res && res.sucesso) {
            if (typeof exibirMensagem === 'function') exibirMensagem("Cliente eliminado com sucesso!", "sucesso");
            renderAdminClientes();
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem("Erro ao eliminar: " + (res.erro || "Falha no servidor"), "erro");
        }
    } catch (erro) {
        console.error("Falha na eliminação:", erro);
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
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
                                <td style="padding: 12px;">
                                    <span class="badge" style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; ${getStatusColor(p.status)}">
                                        ${p.status}
                                    </span>
                                </td>
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
    } catch (e) { 
        console.error("Erro ao carregar pedidos:", e);
        if (typeof exibirMensagem === 'function') exibirMensagem("Falha ao carregar pedidos.", 'erro'); 
    } finally { 
        if (typeof mostrarLoading === 'function') mostrarLoading(false); 
    }
};

window.alterarStatusPedido = async function(id, novoStatus) {
    if (!novoStatus) return; // Se for vazio ("Alterar..."), não faz nada
    
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A atualizar status...");
    try {
        const res = await apiFetch('api/pedidos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'atualizar_status', id: id, status: novoStatus })
        });
        
        if (res && res.sucesso) {
            if (typeof exibirMensagem === 'function') exibirMensagem("Status atualizado com sucesso!", "sucesso");
            renderAdminPedidos(); // Recarrega a tabela para mostrar a nova cor
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem("Erro: " + (res.erro || "Falha no servidor"), "erro");
        }
    } catch (erro) {
        console.error("Falha ao atualizar:", erro);
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
};

window.excluirPedido = async function(id) {
    if (!confirm("Tem a certeza que deseja excluir permanentemente este pedido? Esta ação não pode ser desfeita.")) return;
    
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A excluir pedido...");
    try {
        const res = await apiFetch('api/pedidos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'excluir', id: id })
        });
        
        if (res && res.sucesso) {
            if (typeof exibirMensagem === 'function') exibirMensagem("Pedido excluído!", "sucesso");
            renderAdminPedidos(); // Recarrega a tabela
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem("Erro: " + (res.erro || "Falha no servidor"), "erro");
        }
    } catch (erro) {
        console.error("Falha ao excluir:", erro);
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
};