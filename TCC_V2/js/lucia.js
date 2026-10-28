// =========================================================
// ASSISTENTE VIRTUAL INTELIGENTE "LÚCIA" - JR ILUMINAÇÃO
// =========================================================

(function inicializarLucia() {
    if (document.getElementById('lucia-widget-root')) return;

    // 1. Estilos CSS nativos com suporte a Responsividade e Dark Mode
    const style = document.createElement('style');
    style.id = 'lucia-styles';
    style.innerHTML = `
        #lucia-widget-root {
            font-family: 'Poppins', sans-serif;
            z-index: 999990;
        }

        /* Botão Flutuante */
        #lucia-fab {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999990;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff;
            border: 2px solid rgba(255, 255, 255, 0.25);
            border-radius: 50px;
            padding: 10px 20px 10px 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 8px 25px rgba(2, 132, 199, 0.4);
            cursor: pointer;
            font-weight: 600;
            font-size: 0.9rem;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        #lucia-fab:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 12px 30px rgba(2, 132, 199, 0.55);
        }

        #lucia-fab-avatar {
             position: relative;
             width: 34px;
             height: 34px;
        }

        #lucia-fab-avatar img {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            object-fit: contain;
            background: #ffffff;
            padding: 2px;
        }

        #lucia-online-dot {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 10px;
            height: 10px;
            background: #22c55e;
            border: 2px solid #ffffff;
            border-radius: 50%;
        }

        #lucia-unread-badge {
            background: #ef4444;
            color: #ffffff;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: 20px;
            margin-left: 2px;
            animation: luciaPulse 2s infinite;
        }

        @keyframes luciaPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.12); }
        }

        /* Janela Principal do Chat */
        #lucia-window {
            position: fixed;
            bottom: 90px;
            right: 24px;
            width: 380px;
            max-width: calc(100vw - 28px);
            height: 550px;
            max-height: calc(100vh - 120px);
            background: #ffffff;
            border-radius: 18px;
            box-shadow: 0 20px 50px rgba(15, 23, 42, 0.28);
            border: 1px solid #e2e8f0;
            display: none;
            flex-direction: column;
            overflow: hidden;
            z-index: 999991;
            animation: luciaSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes luciaSlideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Cabeçalho */
        .lucia-header {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff;
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 3px solid #0284c7;
        }

        .lucia-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .lucia-header-left img {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: #ffffff;
            padding: 2px;
            object-fit: contain;
        }

        .lucia-header-title strong {
            display: block;
            font-size: 0.96rem;
            color: #ffffff;
            line-height: 1.2;
        }

        .lucia-header-title small {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 0.74rem;
            color: #38bdf8;
        }

        .lucia-header-actions {
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .lucia-icon-btn {
            background: rgba(255, 255, 255, 0.08);
            border: none;
            color: #cbd5e1;
            width: 30px;
            height: 30px;
            border-radius: 8px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            transition: all 0.2s ease;
        }

        .lucia-icon-btn:hover {
            background: rgba(255, 255, 255, 0.18);
            color: #ffffff;
        }

        /* Lista de Mensagens */
        #lucia-messages {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            background: #f8fafc;
            scroll-behavior: smooth;
        }

        .lucia-bubble {
            max-width: 88%;
            padding: 11px 14px;
            border-radius: 14px;
            font-size: 0.86rem;
            line-height: 1.5;
            word-wrap: break-word;
            position: relative;
        }

        .lucia-bubble.bot {
            align-self: flex-start;
            background: #ffffff;
            color: #1e293b;
            border: 1px solid #e2e8f0;
            border-bottom-left-radius: 3px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04);
        }

        .lucia-bubble.user {
            align-self: flex-end;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff;
            border-bottom-right-radius: 3px;
            box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25);
        }

        /* Botões Rápidos (Chips) */
        .lucia-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 10px;
        }

        .lucia-chip {
            background: #f0f9ff;
            color: #0369a1;
            border: 1px solid #bae6fd;
            border-radius: 20px;
            padding: 5px 11px;
            font-size: 0.76rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
        }

        .lucia-chip:hover {
            background: #0284c7;
            color: #ffffff;
            border-color: #0284c7;
        }

        /* Mini Card de Produto dentro do Chat */
        .lucia-prod-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 8px 10px;
            margin-top: 8px;
        }

        .lucia-prod-info {
            flex: 1;
            min-width: 0;
        }

        .lucia-prod-info strong {
            display: block;
            font-size: 0.8rem;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .lucia-prod-info span {
            font-size: 0.78rem;
            color: #0284c7;
            font-weight: 700;
        }

        .lucia-prod-btn {
            background: #15803d;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 6px 10px;
            font-size: 0.74rem;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
        }

        .lucia-prod-btn:hover {
            background: #166534;
        }

        /* Indicador Digitando */
        .lucia-typing {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 10px 14px;
        }

        .lucia-typing span {
            width: 6px;
            height: 6px;
            background: #64748b;
            border-radius: 50%;
            animation: luciaBounce 1.3s infinite ease-in-out;
        }

        .lucia-typing span:nth-child(2) { animation-delay: 0.15s; }
        .lucia-typing span:nth-child(3) { animation-delay: 0.3s; }

        @keyframes luciaBounce {
            0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
            40% { transform: scale(1); opacity: 1; }
        }

        /* Barra de Input */
        .lucia-footer {
            display: flex;
            align-items: center;
            padding: 10px 12px;
            background: #ffffff;
            border-top: 1px solid #e2e8f0;
            gap: 8px;
        }

        #lucia-input {
            flex: 1;
            padding: 9px 14px;
            border: 1px solid #cbd5e1;
            border-radius: 22px;
            font-size: 0.85rem;
            outline: none;
            font-family: inherit;
            background: #f8fafc;
            color: #0f172a;
        }

        #lucia-input:focus {
            border-color: #0284c7;
            background: #ffffff;
        }

        #lucia-send {
            background: #0284c7;
            color: #ffffff;
            border: none;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 0.95rem;
            transition: background 0.2s ease;
        }

        #lucia-send:hover {
            background: #0369a1;
        }

        /* Esconder quando o carrinho estiver aberto */
        body.carrinho-aberto #lucia-fab,
        body.carrinho-aberto #lucia-window {
            display: none !important;
        }

        /* Compatibilidade Dark Mode */
        body.dark-mode #lucia-window {
            background: #131d38 !important;
            border-color: #1e293b !important;
        }

        body.dark-mode #lucia-messages {
            background: #0b1329 !important;
        }

        body.dark-mode .lucia-bubble.bot {
            background: #1e293b !important;
            color: #f8fafc !important;
            border-color: #334155 !important;
        }

        body.dark-mode .lucia-prod-card {
            background: #0f172a !important;
            border-color: #334155 !important;
        }

        body.dark-mode .lucia-prod-info strong {
            color: #f8fafc !important;
        }

        body.dark-mode .lucia-chip {
            background: #1e293b !important;
            color: #38bdf8 !important;
            border-color: #0284c7 !important;
        }

        body.dark-mode .lucia-chip:hover {
            background: #0284c7 !important;
            color: #ffffff !important;
        }

        body.dark-mode .lucia-footer {
            background: #131d38 !important;
            border-color: #1e293b !important;
        }

        body.dark-mode #lucia-input {
            background: #0b1329 !important;
            color: #ffffff !important;
            border-color: #334155 !important;
        }

        @media (max-width: 600px) {
            #lucia-fab {
                bottom: 16px;
                right: 14px;
                padding: 8px 14px 8px 10px;
                font-size: 0.82rem;
            }
            #lucia-window {
                bottom: 74px;
                right: 14px;
                width: calc(100vw - 28px);
                height: 490px;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Criação do DOM da Lúcia
    const root = document.createElement('div');
    root.id = 'lucia-widget-root';
    root.innerHTML = `
        <button id="lucia-fab" onclick="alternarChatLucia()" aria-label="Abrir assistente virtual Lúcia">
            <div id="lucia-fab-avatar">
                <img src="img/logo.jpg" alt="Lúcia">
                <span id="lucia-online-dot"></span>
            </div>
            <span>Fale com a Lúcia</span>
            <span id="lucia-unread-badge">1</span>
        </button>

        <div id="lucia-window" role="dialog" aria-label="Assistente Virtual Lúcia">
            <div class="lucia-header">
                <div class="lucia-header-left">
                    <img src="img/logo.jpg" alt="Avatar Lúcia">
                    <div class="lucia-header-title">
                        <strong>Lúcia • IA JR</strong>
                        <small>● Online agora</small>
                    </div>
                </div>
                <div class="lucia-header-actions">
                    <button class="lucia-icon-btn" onclick="reiniciarChatLucia()" title="Limpar conversa">↺</button>
                    <button class="lucia-icon-btn" onclick="alternarChatLucia()" title="Fechar">✕</button>
                </div>
            </div>

            <div id="lucia-messages"></div>

            <form class="lucia-footer" onsubmit="processarEnvioLucia(event)">
                <input type="text" id="lucia-input" placeholder="Ex: fita led, meu pedido, cep 09010-000..." autocomplete="off">
                <button type="submit" id="lucia-send" aria-label="Enviar mensagem">➤</button>
            </form>
        </div>
    `;
    document.body.appendChild(root);

    // Carrega mensagem inicial de boas-vindas
    renderizarBoasVindasLucia();
})();

// =========================================================
// FUNÇÕES DE CONTROLE E INTELIGÊNCIA DA LÚCIA
// =========================================================

window. menuRápidoHTML = function() {
    return `
        <div class="lucia-chips">
            <button type="button" class="lucia-chip" onclick="acaoRapidaLucia('rastreio')">📦 Rastrear Pedido</button>
            <button type="button" class="lucia-chip" onclick="acaoRapidaLucia('catalogo')">💡 Ver Ofertas LED</button>
            <button type="button" class="lucia-chip" onclick="acaoRapidaLucia('calculadora')">📐 Calcular Iluminação</button>
            <button type="button" class="lucia-chip" onclick="acaoRapidaLucia('frete')">🚚 Calcular Prazo/CEP</button>
            <button type="button" class="lucia-chip" onclick="acaoRapidaLucia('humano')">💬 WhatsApp da Loja</button>
        </div>
    `;
};

window.renderizarBoasVindasLucia = function() {
    const msgContainer = document.getElementById('lucia-messages');
    if (!msgContainer) return;

    const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
    const saudacaoNome = user && user.nome ? `, <strong>${escapeHtml(user.nome.split(' ')[0])}</strong>` : '';

    msgContainer.innerHTML = `
        <div class="lucia-bubble bot">
            Olá${saudacaoNome}! Sou a <strong>Lúcia</strong>, assistente virtual inteligente da <strong>JR Iluminação e Leds</strong>. 💡<br><br>
            Consigo consultar o estoque em tempo real, rastrear seus pedidos, calcular a iluminação ideal para o seu ambiente ou estimar o prazo de entrega pelo CEP. Como posso te ajudar?
            ${menuRápidoHTML()}
        </div>
    `;
};

window.reiniciarChatLucia = function() {
    renderizarBoasVindasLucia();
};

window.alternarChatLucia = function() {
    const win = document.getElementById('lucia-window');
    const badge = document.getElementById('lucia-unread-badge');
    if (!win) return;

    const aberto = win.style.display === 'flex';
    win.style.display = aberto ? 'none' : 'flex';

    if (!aberto) {
        if (badge) badge.style.display = 'none';
        setTimeout(() => {
            const input = document.getElementById('lucia-input');
            if (input) input.focus();
        }, 120);
    }
};

window.adicionarBolhaLucia = function(tipo, html) {
    const lista = document.getElementById('lucia-messages');
    if (!lista) return;

    const div = document.createElement('div');
    div.className = `lucia-bubble ${tipo}`;
    div.innerHTML = html;
    lista.appendChild(div);
    lista.scrollTop = lista.scrollHeight;
};

window.mostrarDigitandoLucia = function() {
    const lista = document.getElementById('lucia-messages');
    if (!lista) return null;

    const div = document.createElement('div');
    div.className = 'lucia-bubble bot lucia-typing';
    div.innerHTML = '<span></span><span></span><span></span>';
    lista.appendChild(div);
    lista.scrollTop = lista.scrollHeight;
    return div;
};

window.navegarPelaLucia = function(rota) {
    const win = document.getElementById('lucia-window');
    if (win && window.innerWidth <= 600) {
        win.style.display = 'none';
    }
    if (typeof navegar === 'function') {
        navegar(rota);
    }
};

window.comprarPelaLucia = function(idProduto) {
    const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
    if (!user) {
        adicionarBolhaLucia('bot', `
            Para adicionar produtos ao carrinho com segurança, você precisa entrar na sua conta primeiro. 🔐<br><br>
            <button class="lucia-chip" onclick="navegarPelaLucia('login')">👉 Ir para a tela de Login</button>
        `);
        return;
    }
    if (typeof adicionarAoCarrinho === 'function') {
        adicionarAoCarrinho(idProduto);
    }
};

// Garante que temos a lista de produtos carregada para consulta no chat
async function obterProdutosParaLucia() {
    if (window.produtosGlobais && window.produtosGlobais.length > 0) {
        return window.produtosGlobais;
    }
    try {
        const res = await fetch('api/produtos.php');
        const json = await res.json();
        if (json && json.dados) {
            window.produtosGlobais = json.dados;
            return json.dados;
        }
    } catch (e) {
        console.warn('Lúcia: falha ao buscar produtos.', e);
    }
    return [];
}

// =========================================================
// AÇÕES DOS BOTÕES RÁPIDOS
// =========================================================

window.acaoRapidaLucia = async function(acao) {
    if (acao === 'rastreio') {
        adicionarBolhaLucia('user', '📦 Quero rastrear meu pedido');
        const typing = mostrarDigitandoLucia();

        const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
        if (!user) {
            if (typing) typing.remove();
            adicionarBolhaLucia('bot', `
                Para consultar seus pedidos em tempo real no banco de dados, inicie sessão na loja primeiro:<br><br>
                <button class="lucia-chip" onclick="navegarPelaLucia('login')">🔐 Entrar na minha conta</button>
            `);
            return;
        }

        try {
            const res = await fetch(`api/pedidos.php?email=${encodeURIComponent(user.email)}`);
            const data = await res.json();
            if (typing) typing.remove();

            const pedidos = data.dados || [];
            if (pedidos.length === 0) {
                adicionarBolhaLucia('bot', `
                    Consultei o sistema para <strong>${escapeHtml(user.email)}</strong> e você ainda não possui pedidos registrados.<br>
                    <div class="lucia-chips">
                        <button class="lucia-chip" onclick="navegarPelaLucia('produtos')">🛒 Explorar Catálogo</button>
                    </div>
                `);
            } else {
                const ultimo = pedidos[0];
                const dataFormatada = new Date(ultimo.data_pedido).toLocaleDateString('pt-BR');
                const valorFormatado = parseFloat(ultimo.total).toFixed(2).replace('.', ',');
                const resumoItens = (ultimo.itens || []).map(i => `• ${i.quantidade}x ${escapeHtml(i.nome)}`).join('<br>');

                adicionarBolhaLucia('bot', `
                    Encontrei <strong>${pedidos.length} pedido(s)</strong> no seu histórico! Aqui está o mais recente:<br><br>
                    🧾 <strong>Pedido #${ultimo.id}</strong> (${dataFormatada})<br>
                    📌 <strong>Status:</strong> <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:10px; font-weight:700;">${ultimo.status}</span><br>
                    💰 <strong>Total:</strong> R$ ${valorFormatado}<br>
                    ${resumoItens ? `<div style="margin-top:6px; font-size:0.8rem; color:#64748b;"><strong>Itens:</strong><br>${resumoItens}</div>` : ''}
                    <div class="lucia-chips">
                        <button class="lucia-chip" onclick="navegarPelaLucia('perfil')">👤 Ver Todos no Meu Perfil</button>
                    </div>
                `);
            }
        } catch (err) {
            if (typing) typing.remove();
            adicionarBolhaLucia('bot', 'Não consegui conectar ao servidor de pedidos agora. Você pode visualizar tudo clicando na aba <strong>Histórico de Compras</strong> no topo do site.');
        }
    }

    else if (acao === 'catalogo') {
        adicionarBolhaLucia('user', '💡 Quero ver ofertas em estoque');
        const typing = mostrarDigitandoLucia();
        const produtos = await obterProdutosParaLucia();
        if (typing) typing.remove();

        const disponiveis = produtos.filter(p => Number(p.quantidade) > 0).slice(0, 3);
        if (disponiveis.length === 0) {
            adicionarBolhaLucia('bot', `
                Acesse nosso catálogo completo para conferir todos os lançamentos em LED:<br>
                <div class="lucia-chips">
                    <button class="lucia-chip" onclick="navegarPelaLucia('produtos')">Ir para Produtos ➔</button>
                </div>
            `);
            return;
        }

        const cardsHtml = disponiveis.map(p => {
            const preco = Number(p.preco).toFixed(2).replace('.', ',');
            return `
                <div class="lucia-prod-card">
                    <div class="lucia-prod-info">
                        <strong>${escapeHtml(p.nome)}</strong>
                        <span>R$ ${preco} • (${p.quantidade} un.)</span>
                    </div>
                    <button class="lucia-prod-btn" onclick="comprarPelaLucia('${p.id}')">+ Carrinho</button>
                </div>
            `;
        }).join('');

        adicionarBolhaLucia('bot', `
            Separei alguns destaques disponíveis para pronta entrega no nosso estoque agora:<br>
            ${cardsHtml}
            <div class="lucia-chips">
                <button class="lucia-chip" onclick="navegarPelaLucia('produtos')">🔍 Ver Catálogo Completo</button>
            </div>
        `);
    }

    else if (acao === 'calculadora') {
        adicionarBolhaLucia('user', '📐 Como calcular a iluminação ideal?');
        adicionarBolhaLucia('bot', `
            Eu faço o cálculo luminotécnico para você! 📏✨<br><br>
            Basta digitar aqui no chat a <strong>metragem do seu ambiente</strong> (por exemplo: <em>"12m2"</em> ou <em>"sala de 20 metros"</em>) que eu calculo quantos Lúmens e Watts você precisa!<br><br>
            Ou escolha um ambiente abaixo:
            <div class="lucia-chips">
                <button class="lucia-chip" onclick="simularAmbienteLucia('Sala / Quarto', 15)">🛋️ Sala/Quarto (15m²)</button>
                <button class="lucia-chip" onclick="simularAmbienteLucia('Cozinha / Escritório', 12)">🍳 Cozinha/Escritório (12m²)</button>
            </div>
        `);
    }

    else if (acao === 'frete') {
        adicionarBolhaLucia('user', '🚚 Quero consultar prazo de entrega');
        adicionarBolhaLucia('bot', `
            Para consultar o prazo exato na hora, <strong>digite seu CEP</strong> aqui na conversa (ex: <code>09010-000</code>).<br><br>
            ⚡ <strong>Região do Grande ABC:</strong> Entrega expressa em 1 a 2 dias úteis!<br>
            💳 Aceitamos <strong>PIX com aprovação imediata</strong>, Cartão de Crédito e Boleto.
        `);
    }

    else if (acao === 'humano') {
        adicionarBolhaLucia('user', '💬 Falar com um especialista humano');
        adicionarBolhaLucia('bot', `
            Claro! Nossa equipe de atendimento em <strong>Santo André - SP</strong> está pronta para te atender:<br><br>
            📱 <strong>WhatsApp:</strong> (11) 9988-7766<br>
            📞 <strong>Telefone Fixo:</strong> (11) 4002-8922<br>
            ✉️ <strong>E-mail:</strong> contato@jriluminacao.com.br<br><br>
            <a href="https://wa.me/551199887766?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20JR%20Ilumina%C3%A7%C3%A3o%20e%20falei%20com%20a%20L%C3%BAcia." target="_blank" rel="noopener" class="lucia-chip" style="display:inline-block; text-decoration:none; background:#16a34a; color:#fff; border-color:#16a34a;">📲 Chamar no WhatsApp Agora</a>
        `);
    }
};

window.simularAmbienteLucia = async function(ambiente, metros) {
    adicionarBolhaLucia('user', `Calcular para ${ambiente} (${metros}m²)`);
    const typing = mostrarDigitandoLucia();
    await new Promise(r => setTimeout(r, 350));
    if (typing) typing.remove();

    const lumensPorM2 = ambiente.includes('Cozinha') ? 200 : 150;
    const totalLumens = metros * lumensPorM2;
    const wattsEstimados = Math.ceil(totalLumens / 90);

    adicionarBolhaLucia('bot', `
        📊 <strong>Resultado Luminotécnico (${ambiente} - ${metros}m²):</strong><br><br>
        • <strong>Fluxo Luminoso ideal:</strong> ~${totalLumens} Lúmens<br>
        • <strong>Potência equivalente em LED:</strong> cerca de <strong>${wattsEstimados}W</strong> totais.<br>
        • <strong>Dica JR:</strong> Combine um <em>Painel Plafon LED</em> central com <em>Fita LED</em> ou <em>Spots</em> nas bordas para evitar sombras!
        <div class="lucia-chips">
            <button class="lucia-chip" onclick="acaoRapidaLucia('catalogo')">💡 Ver Produtos Recomendados</button>
        </div>
    `);
};

// =========================================================
// PROCESSAMENTO DE LINGUAGEM NATURAL E BUSCA EM TEMPO REAL
// =========================================================

window.processarEnvioLucia = async function(event) {
    event.preventDefault();
    const input = document.getElementById('lucia-input');
    if (!input) return;

    const textoOriginal = input.value.trim();
    if (!textoOriginal) return;

    input.value = '';
    adicionarBolhaLucia('user', escapeHtml(textoOriginal));

    const texto = textoOriginal.toLowerCase();
    const typing = mostrarDigitandoLucia();

    // 1. Detecta se o usuário digitou um CEP (8 dígitos numéricos)
    const cepMatch = texto.replace(/\D/g, '');
    if (cepMatch.length === 8 && /^\d{8}$/.test(cepMatch)) {
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cepMatch}/json/`);
            const data = await res.json();
            if (typing) typing.remove();

            if (!data.erro) {
                const prazo = typeof calcularPrazoEntrega === 'function'
                    ? calcularPrazoEntrega(cepMatch)
                    : '2 a 5 dias úteis';
                adicionarBolhaLucia('bot', `
                    📍 <strong>Endereço localizado:</strong><br>
                    ${escapeHtml(data.logradouro || 'Endereço geral')}, ${escapeHtml(data.bairro || '')} — <strong>${escapeHtml(data.localidade)}/${escapeHtml(data.uf)}</strong>.<br><br>
                    🚚 <strong>Prazo estimado de entrega:</strong> <span style="color:#0284c7; font-weight:700;">${prazo}</span> após a confirmação do pagamento!
                `);
                return;
            }
        } catch (e) {
            // Segue para o fluxo normal se falhar
        }
    }

    // 2. Detecta metragem para cálculo luminotécnico (ex: "15m2", "20 m²", "10 metros")
    const matchMetros = texto.match(/(\d+)\s*(m2|m²|metros|metro)/i);
    if (matchMetros) {
        if (typing) typing.remove();
        const m2 = parseInt(matchMetros[1], 10);
        const tipoAmb = (texto.includes('cozinha') || texto.includes('escritorio') || texto.includes('escritório'))
            ? 'Cozinha / Escritório'
            : 'Sala / Quarto';
        simularAmbienteLucia(tipoAmb, m2);
        return;
    }

    // 3. Intenção de Rastreio / Pedido
    if (texto.includes('pedido') || texto.includes('rastre') || texto.includes('compra') || texto.includes('entrega') || texto.includes('status')) {
        if (typing) typing.remove();
        acaoRapidaLucia('rastreio');
        return;
    }

    // 4. Intenção de Pagamento / PIX / Cartão / Boleto
    if (texto.includes('pix') || texto.includes('cartao') || texto.includes('cartão') || texto.includes('boleto') || texto.includes('pagamento') || texto.includes('pagar')) {
        if (typing) typing.remove();
        adicionarBolhaLucia('bot', `
            Na <strong>JR Iluminação</strong> você conta com 3 formas seguras de pagamento no Checkout:<br><br>
            ⚡ <strong>PIX:</strong> Gera QR Code e código Copia e Cola com aprovação instantânea.<br>
            💳 <strong>Cartão de Crédito:</strong> Aprovação rápida direto na finalização.<br>
            📄 <strong>Boleto Bancário:</strong> Prazo de 3 dias para compensação.
        `);
        return;
    }

    // 5. Intenção de Contato / WhatsApp / Endereço físico
    if (texto.includes('whats') || texto.includes('telefone') || texto.includes('humano') || texto.includes('atendente') || texto.includes('onde fica') || texto.includes('santo andre') || texto.includes('santo andré')) {
        if (typing) typing.remove();
        acaoRapidaLucia('humano');
        return;
    }

    // 6. Busca Inteligente no Catálogo de Produtos do Banco de Dados
    const produtos = await obterProdutosParaLucia();
    if (typing) typing.remove();

    // Verifica se pediu o produto mais barato
    if (texto.includes('barato') || texto.includes('menor preço') || texto.includes('promo')) {
        const disponiveis = produtos.filter(p => Number(p.quantidade) > 0).sort((a, b) => Number(a.preco) - Number(b.preco));
        if (disponiveis.length > 0) {
            const p = disponiveis[0];
            const preco = Number(p.preco).toFixed(2).replace('.', ',');
            adicionarBolhaLucia('bot', `
                O item com menor preço em estoque hoje é:<br>
                <div class="lucia-prod-card">
                    <div class="lucia-prod-info">
                        <strong>${escapeHtml(p.nome)}</strong>
                        <span>R$ ${preco} • (${p.quantidade} em estoque)</span>
                    </div>
                    <button class="lucia-prod-btn" onclick="comprarPelaLucia('${p.id}')">+ Carrinho</button>
                </div>
            `);
            return;
        }
    }

    // Procura correspondência por palavras nos produtos do banco
    const palavras = texto
        .replace(/[?.,!]/g, '')
        .split(/\s+/)
        .filter(w => w.length >= 3 && !['que', 'tem', 'uma', 'para', 'com', 'quero', 'ver', 'qual', 'preço', 'preco', 'valor'].includes(w));

    if (palavras.length > 0 && produtos.length > 0) {
        const encontrados = produtos.filter(p => {
            const alvo = `${p.nome || ''} ${p.descricao || ''} ${p.categoria || ''}`.toLowerCase();
            return palavras.some(palavra => alvo.includes(palavra));
        }).slice(0, 3);

        if (encontrados.length > 0) {
            const cardsHtml = encontrados.map(p => {
                const preco = Number(p.preco).toFixed(2).replace('.', ',');
                const disp = Number(p.quantidade) > 0;
                return `
                    <div class="lucia-prod-card">
                        <div class="lucia-prod-info">
                            <strong>${escapeHtml(p.nome)}</strong>
                            <span>R$ ${preco} • ${disp ? `${p.quantidade} un. em estoque` : 'Esgotado'}</span>
                        </div>
                        ${disp ? `<button class="lucia-prod-btn" onclick="comprarPelaLucia('${p.id}')">+ Carrinho</button>` : ''}
                    </div>
                `;
            }).join('');

            adicionarBolhaLucia('bot', `
                Encontrei ${encontrados.length} produto(s) no nosso banco de dados para a sua busca:<br>
                ${cardsHtml}
                <div class="lucia-chips">
                    <button class="lucia-chip" onclick="navegarPelaLucia('produtos')">Ver todos no Catálogo ➔</button>
                </div>
            `);
            return;
        }
    }

    // 7. Resposta Padrão Contextual
    adicionarBolhaLucia('bot', `
        Posso te ajudar a encontrar qualquer item do nosso catálogo (experimente digitar <strong>"fita"</strong>, <strong>"lâmpada"</strong>, <strong>"painel"</strong> ou <strong>"spot"</strong>), consultar seu <strong>CEP</strong> ou calcular a iluminação ideal dizendo quantos <strong>m²</strong> tem seu espaço! 😊
        ${menuRápidoHTML()}
    `);
};
