// ==========================================
// FUNÇÕES ESTENDIDAS DO ADMIN
// ==========================================

// Deixamos a tabela de pedidos correta e completa aqui para evitar conflitos
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

window.renderAdminRelatorios = async function() {
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A gerar relatório detalhado...");
    try {
        const resPedidos = await apiFetch('api/pedidos.php');
        const resProdutos = await apiFetch('api/produtos.php');
        
        const pedidos = resPedidos.dados || [];
        const produtos = resProdutos.dados || [];
        
        // 1. Cálculos Gerais e Separação por Status
        let totalFaturado = 0;
        let contagemStatus = { 'Pendente': 0, 'Em processamento': 0, 'Enviado': 0, 'Concluído': 0 };
        
        pedidos.forEach(p => {
            totalFaturado += parseFloat(p.total);
            if (contagemStatus[p.status] !== undefined) {
                contagemStatus[p.status]++;
            }
        });
        
        // 2. Filtrar Produtos com Baixo Estoque (5 ou menos unidades)
        const produtosCriticos = produtos
            .filter(p => parseInt(p.quantidade) <= 5)
            .sort((a, b) => parseInt(a.quantidade) - parseInt(b.quantidade));

        // 3. Pegar apenas os 5 pedidos mais recentes para o extrato
        const ultimosPedidos = pedidos.slice(0, 5);

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
            <h3 style="margin-bottom: 20px; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Visão Geral de Desempenho</h3>
            
            <!-- Cartões Principais -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;">
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

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;">
                
                <!-- Progresso por Status -->
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <h4 style="margin-top: 0; color: #334155; margin-bottom: 15px;">Pedidos por Status</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Pendente</span> <strong>${contagemStatus['Pendente']}</strong>
                        </li>
                        <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Em processamento</span> <strong>${contagemStatus['Em processamento']}</strong>
                        </li>
                        <li style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b;">Enviado</span> <strong>${contagemStatus['Enviado']}</strong>
                        </li>
                        <li style="display: flex; justify-content: space-between; padding: 8px 0;">
                            <span style="color: #64748b;">Concluído</span> <strong style="color: #10b981;">${contagemStatus['Concluído']}</strong>
                        </li>
                    </ul>
                </div>

                <!-- Alerta de Estoque -->
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
                    </div>
                    `}
                </div>
            </div>

            <!-- Últimas Vendas -->
            <h4 style="color: #334155; margin-bottom: 10px;">Últimas 5 Vendas</h4>
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
                                <td style="padding: 10px;">
                                    <span style="padding: 3px 6px; border-radius: 4px; font-size: 0.75rem; ${getStatusColor(p.status)}">${p.status}</span>
                                </td>
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