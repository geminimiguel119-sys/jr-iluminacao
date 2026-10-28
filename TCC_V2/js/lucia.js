// =========================================================
// ASSISTENTE VIRTUAL INTELIGENTE "LÚCIA" - JR ILUMINAÇÃO
// =========================================================

// 1. FUNÇÕES AUXILIARES SEGURAS (Blindadas contra erros)
window.luciaEscape = function(v) {
    if (typeof escapeHtml === 'function') return escapeHtml(v);
    return String(v ?? '').replace(/[&<>"']/g, function(c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[c];
    });
};

window.getUserLucia = function() {
    try {
        return JSON.parse(localStorage.getItem('jr_user') || 'null');
    } catch(e) {
        return null;
    }
};

window.esperarLucia = function(ms) {
    return new Promise(function(resolve) { setTimeout(resolve, ms); });
};

window.menuRapidoHTML = function() {
    return `
        <div class="lucia-chips">
            <button type="button" class="lucia-chip" onclick="window.acaoRapidaLucia('rastreio')">📦 Rastrear Pedido</button>
            <button type="button" class="lucia-chip" onclick="window.acaoRapidaLucia('catalogo')">💡 Ver Ofertas LED</button>
            <button type="button" class="lucia-chip" onclick="window.acaoRapidaLucia('calculadora')">📐 Calcular Iluminação</button>
            <button type="button" class="lucia-chip" onclick="window.acaoRapidaLucia('frete')">🚚 Calcular Prazo/CEP</button>
            <button type="button" class="lucia-chip" onclick="window.acaoRapidaLucia('humano')">💬 WhatsApp da Loja</button>
        </div>
    `;
};

// 2. FUNÇÕES DE INTERAÇÃO DO CHAT
window.renderizarBoasVindasLucia = async function() {
    const msgContainer = document.getElementById('lucia-messages');
    if (!msgContainer) return;

    msgContainer.innerHTML = '';
    const typing = window.mostrarDigitandoLucia();
    await window.esperarLucia(1000); 
    if (typing) typing.remove();

    const user = window.getUserLucia();
    const saudacaoNome = (user && user.nome) ? `, <strong>${window.luciaEscape(user.nome.split(' ')[0])}</strong>` : '';

    window.adicionarBolhaLucia('bot', `
        Olá${saudacaoNome}! Sou a <strong>Lúcia</strong>, assistente virtual inteligente da <strong>JR Iluminação e Leds</strong>. 💡<br><br>
        Consigo consultar o estoque em tempo real, rastrear seus pedidos, calcular a iluminação ideal para o seu ambiente ou estimar o prazo de entrega pelo CEP. Como posso te ajudar?
        ${window.menuRapidoHTML()}
    `);
};

window.alternarChatLucia = function(event) {
    if (event) { event.preventDefault(); event.stopPropagation(); }
    
    const win = document.getElementById('lucia-window');
    const badge = document.getElementById('lucia-unread-badge');
    if (!win) return;

    const estaAberto = win.classList.contains('lucia-aberta');
    if (estaAberto) {
        win.classList.remove('lucia-aberta');
    } else {
        win.classList.add('lucia-aberta');
        if (badge) badge.style.display = 'none';
        
        const msgContainer = document.getElementById('lucia-messages');
        if (msgContainer && msgContainer.children.length === 0) {
            window.renderizarBoasVindasLucia();
        }

        setTimeout(function() {
            const input = document.getElementById('lucia-input');
            if (input) input.focus();
        }, 120);
    }
};

window.reiniciarChatLucia = function() {
    const msgContainer = document.getElementById('lucia-messages');
    if (msgContainer) msgContainer.innerHTML = '';
    window.renderizarBoasVindasLucia();
};

window.adicionarBolhaLucia = function(tipo, html) {
    const lista = document.getElementById('lucia-messages');
    if (!lista) return;

    const div = document.createElement('div');
    div.className = 'lucia-bubble ' + tipo;
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
        win.classList.remove('lucia-aberta');
    }
    if (typeof navegar === 'function') {
        navegar(rota);
    }
};

window.comprarPelaLucia = function(idProduto) {
    const user = window.getUserLucia();
    if (!user) {
        const typing = window.mostrarDigitandoLucia();
        setTimeout(() => {
            if (typing) typing.remove();
            window.adicionarBolhaLucia('bot', `
                Para adicionar produtos ao carrinho com segurança, você precisa entrar na sua conta primeiro. 🔐<br><br>
                <button type="button" class="lucia-chip" onclick="window.navegarPelaLucia('login')">👉 Ir para a tela de Login</button>
            `);
        }, 600);
        return;
    }
    if (typeof adicionarAoCarrinho === 'function') {
        adicionarAoCarrinho(idProduto);
    }
};

window.obterProdutosParaLucia = async function() {
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
    } catch (e) {}
    return [];
};

// 3. AÇÕES DOS BOTÕES RÁPIDOS
window.acaoRapidaLucia = async function(acao) {
    if (acao === 'rastreio') {
        window.adicionarBolhaLucia('user', '📦 Quero rastrear meu pedido');
        const typing = window.mostrarDigitandoLucia();
        await window.esperarLucia(1000);

        const user = window.getUserLucia();
        if (!user) {
            if (typing) typing.remove();
            window.adicionarBolhaLucia('bot', `
                Para consultar seus pedidos em tempo real no banco de dados, inicie sessão na loja primeiro:<br><br>
                <button type="button" class="lucia-chip" onclick="window.navegarPelaLucia('login')">🔐 Entrar na minha conta</button>
            `);
            return;
        }

        try {
            const res = await fetch('api/pedidos.php?email=' + encodeURIComponent(user.email));
            const data = await res.json();
            if (typing) typing.remove();

            const pedidos = data.dados || [];
            if (pedidos.length === 0) {
                window.adicionarBolhaLucia('bot', `
                    Consultei o sistema para <strong>${window.luciaEscape(user.email)}</strong> e você ainda não possui pedidos registrados.<br>
                    <div class="lucia-chips">
                        <button type="button" class="lucia-chip" onclick="window.navegarPelaLucia('produtos')">🛒 Explorar Catálogo</button>
                    </div>
                `);
            } else {
                const ultimo = pedidos[0];
                const dataFormatada = new Date(ultimo.data_pedido).toLocaleDateString('pt-BR');
                const valorFormatado = parseFloat(ultimo.total).toFixed(2).replace('.', ',');
                const resumoItens = (ultimo.itens || []).map(function(i) {
                    return '• ' + i.quantidade + 'x ' + window.luciaEscape(i.nome);
                }).join('<br>');

                window.adicionarBolhaLucia('bot', `
                    Encontrei <strong>${pedidos.length} pedido(s)</strong> no seu histórico! Aqui está o mais recente:<br><br>
                    🧾 <strong>Pedido #${ultimo.id}</strong> (${dataFormatada})<br>
                    📌 <strong>Status:</strong> <span style="background:#dcfce7; color:#166534; padding:2px 8px; border-radius:10px; font-weight:700;">${ultimo.status}</span><br>
                    💰 <strong>Total:</strong> R$ ${valorFormatado}<br>
                    ${resumoItens ? `<div style="margin-top:6px; font-size:0.8rem; color:#64748b;"><strong>Itens:</strong><br>${resumoItens}</div>` : ''}
                    <div class="lucia-chips">
                        <button type="button" class="lucia-chip" onclick="window.navegarPelaLucia('perfil')">👤 Ver Todos no Meu Perfil</button>
                    </div>
                `);
            }
        } catch (err) {
            if (typing) typing.remove();
            window.adicionarBolhaLucia('bot', 'Não consegui conectar ao servidor de pedidos agora. Você pode visualizar tudo clicando na aba <strong>Histórico de Compras</strong> no topo do site.');
        }
    }

    else if (acao === 'catalogo') {
        window.adicionarBolhaLucia('user', '💡 Quero ver ofertas em estoque');
        const typing = window.mostrarDigitandoLucia();
        await window.esperarLucia(1000);
        
        const produtos = await window.obterProdutosParaLucia();
        if (typing) typing.remove();

        const disponiveis = produtos.filter(function(p) { return Number(p.quantidade) > 0; }).slice(0, 3);
        if (disponiveis.length === 0) {
            window.adicionarBolhaLucia('bot', `
                Acesse nosso catálogo completo para conferir todos os lançamentos em LED:<br>
                <div class="lucia-chips">
                    <button type="button" class="lucia-chip" onclick="window.navegarPelaLucia('produtos')">Ir para Produtos ➔</button>
                </div>
            `);
            return;
        }

        const cardsHtml = disponiveis.map(function(p) {
            const preco = Number(p.preco).toFixed(2).replace('.', ',');
            return `
                <div class="lucia-prod-card">
                    <div class="lucia-prod-info">
                        <strong>${window.luciaEscape(p.nome)}</strong>
                        <span>R$ ${preco} • (${p.quantidade} un.)</span>
                    </div>
                    <button type="button" class="lucia-prod-btn" onclick="window.comprarPelaLucia('${p.id}')">+ Carrinho</button>
                </div>
            `;
        }).join('');

        window.adicionarBolhaLucia('bot', `
            Separei alguns destaques disponíveis para pronta entrega no nosso estoque agora:<br>
            ${cardsHtml}
            <div class="lucia-chips">
                <button type="button" class="lucia-chip" onclick="window.navegarPelaLucia('produtos')">🔍 Ver Catálogo Completo</button>
            </div>
        `);
    }

    else if (acao === 'calculadora') {
        window.adicionarBolhaLucia('user', '📐 Como calcular a iluminação ideal?');
        const typing = window.mostrarDigitandoLucia();
        await window.esperarLucia(1000);
        if (typing) typing.remove();

        window.adicionarBolhaLucia('bot', `
            Eu faço o cálculo luminotécnico para você! 📏✨<br><br>
            Basta digitar aqui no chat a <strong>metragem do seu ambiente</strong> (por exemplo: <em>"12m2"</em> ou <em>"sala de 20 metros"</em>) que eu calculo quantos Lúmens e Watts você precisa!<br><br>
            Ou escolha um ambiente abaixo:
            <div class="lucia-chips">
                <button type="button" class="lucia-chip" onclick="window.simularAmbienteLucia('Sala / Quarto', 15)">🛋️ Sala/Quarto (15m²)</button>
                <button type="button" class="lucia-chip" onclick="window.simularAmbienteLucia('Cozinha / Escritório', 12)">🍳 Cozinha/Escritório (12m²)</button>
            </div>
        `);
    }

    else if (acao === 'frete') {
        window.adicionarBolhaLucia('user', '🚚 Quero consultar prazo de entrega');
        const typing = window.mostrarDigitandoLucia();
        await window.esperarLucia(1000);
        if (typing) typing.remove();

        window.adicionarBolhaLucia('bot', `
            Para consultar o prazo exato na hora, <strong>digite seu CEP</strong> aqui na conversa (ex: <code>09010-000</code>).<br><br>
            ⚡ <strong>Região do Grande ABC:</strong> Entrega expressa em 1 a 2 dias úteis!<br>
            💳 Aceitamos <strong>PIX com aprovação imediata</strong>, Cartão de Crédito e Boleto.
        `);
    }

    else if (acao === 'humano') {
        window.adicionarBolhaLucia('user', '💬 Falar com um especialista humano');
        const typing = window.mostrarDigitandoLucia();
        await window.esperarLucia(1000);
        if (typing) typing.remove();

        window.adicionarBolhaLucia('bot', `
            Claro! Nossa equipe de atendimento em <strong>Santo André - SP</strong> está pronta para te atender:<br><br>
            📱 <strong>WhatsApp:</strong> (11) 9988-7766<br>
            📞 <strong>Telefone Fixo:</strong> (11) 4002-8922<br>
            ✉️ <strong>E-mail:</strong> contato@jriluminacao.com.br<br><br>
            <a href="https://wa.me/551199887766?text=Ol%C3%A1!%20Vim%20pelo%20site%20da%20JR%20Ilumina%C3%A7%C3%A3o%20e%20falei%20com%20a%20L%C3%BAcia." target="_blank" rel="noopener" class="lucia-chip" style="display:inline-block; text-decoration:none; background:#16a34a; color:#fff; border-color:#16a34a;">📲 Chamar no WhatsApp Agora</a>
        `);
    }
};

window.simularAmbienteLucia = async function(ambiente, metros) {
    window.adicionarBolhaLucia('user', 'Calcular para ' + ambiente + ' (' + metros + 'm²)');
    const typing = window.mostrarDigitandoLucia();
    await window.esperarLucia(1200); 
    if (typing) typing.remove();

    const lumensPorM2 = ambiente.indexOf('Cozinha') !== -1 ? 200 : 150;
    const totalLumens = metros * lumensPorM2;
    const wattsEstimados = Math.ceil(totalLumens / 90);

    window.adicionarBolhaLucia('bot', `
        📊 <strong>Resultado Luminotécnico (${ambiente} - ${metros}m²):</strong><br><br>
        • <strong>Fluxo Luminoso ideal:</strong> ~${totalLumens} Lúmens<br>
        • <strong>Potência equivalente em LED:</strong> cerca de <strong>${wattsEstimados}W</strong> totais.<br>
        • <strong>Dica JR:</strong> Combine um <em>Painel Plafon LED</em> central com <em>Fita LED</em> ou <em>Spots</em> nas bordas para evitar sombras!
        <div class="lucia-chips">
            <button type="button" class="lucia-chip" onclick="window.acaoRapidaLucia('catalogo')">💡 Ver Produtos Recomendados</button>
        </div>
    `);
};

// 4. PROCESSAMENTO DE TEXTO DIGITADO (BOT DE IA)
window.processarEnvioLucia = async function(event) {
    event.preventDefault();
    const input = document.getElementById('lucia-input');
    if (!input) return;

    const textoOriginal = input.value.trim();
    if (!textoOriginal) return;

    input.value = '';
    window.adicionarBolhaLucia('user', window.luciaEscape(textoOriginal));

    const texto = textoOriginal.toLowerCase();
    
    const typing = window.mostrarDigitandoLucia();
    await window.esperarLucia(1000);

    // 4.1. Detecta CEP
    const cepMatch = texto.replace(/\D/g, '');
    if (cepMatch.length === 8 && /^\d{8}$/.test(cepMatch)) {
        try {
            const res = await fetch('https://viacep.com.br/ws/' + cepMatch + '/json/');
            const data = await res.json();
            if (typing) typing.remove();

            if (!data.erro) {
                const prazo = typeof calcularPrazoEntrega === 'function' ? calcularPrazoEntrega(cepMatch) : '2 a 5 dias úteis';
                window.adicionarBolhaLucia('bot', `
                    📍 <strong>Endereço localizado:</strong><br>
                    ${window.luciaEscape(data.logradouro || 'Endereço geral')}, ${window.luciaEscape(data.bairro || '')} — <strong>${window.luciaEscape(data.localidade)}/${window.luciaEscape(data.uf)}</strong>.<br><br>
                    🚚 <strong>Prazo estimado de entrega:</strong> <span style="color:#0284c7; font-weight:700;">${prazo}</span> após a confirmação do pagamento!
                `);
                return;
            }
        } catch (e) {}
    }

    // 4.2. Detecta metros para calculadora
    const matchMetros = texto.match(/(\d+)\s*(m2|m²|metros|metro)/i);
    if (matchMetros) {
        if (typing) typing.remove();
        const m2 = parseInt(matchMetros[1], 10);
        const tipoAmb = (texto.includes('cozinha') || texto.includes('escritorio') || texto.includes('escritório')) ? 'Cozinha / Escritório' : 'Sala / Quarto';
        window.simularAmbienteLucia(tipoAmb, m2);
        return;
    }

    // 4.3. Rastreio
    if (texto.includes('pedido') || texto.includes('rastre') || texto.includes('compra') || texto.includes('entrega') || texto.includes('status')) {
        if (typing) typing.remove();
        window.acaoRapidaLucia('rastreio');
        return;
    }

    // 4.4. Pagamento
    if (texto.includes('pix') || texto.includes('cartao') || texto.includes('cartão') || texto.includes('boleto') || texto.includes('pagamento') || texto.includes('pagar')) {
        if (typing) typing.remove();
        window.adicionarBolhaLucia('bot', `
            Na <strong>JR Iluminação</strong> você conta com 3 formas seguras de pagamento no Checkout:<br><br>
            ⚡ <strong>PIX:</strong> Gera QR Code e código Copia e Cola com aprovação instantânea.<br>
            💳 <strong>Cartão de Crédito:</strong> Aprovação rápida direto na finalização.<br>
            📄 <strong>Boleto Bancário:</strong> Prazo de 3 dias para compensação.
        `);
        return;
    }

    // 4.5. Contato
    if (texto.includes('whats') || texto.includes('telefone') || texto.includes('humano') || texto.includes('atendente') || texto.includes('onde fica') || texto.includes('santo andre') || texto.includes('santo andré')) {
        if (typing) typing.remove();
        window.acaoRapidaLucia('humano');
        return;
    }

    // 4.6. Busca no Catálogo
    const produtos = await window.obterProdutosParaLucia();

    if (texto.includes('barato') || texto.includes('menor preço') || texto.includes('promo')) {
        const disponiveis = produtos.filter(function(p) { return Number(p.quantidade) > 0; }).sort(function(a, b) { return Number(a.preco) - Number(b.preco); });
        if (disponiveis.length > 0) {
            if (typing) typing.remove();
            const p = disponiveis[0];
            const preco = Number(p.preco).toFixed(2).replace('.', ',');
            window.adicionarBolhaLucia('bot', `
                O item com menor preço em estoque hoje é:<br>
                <div class="lucia-prod-card">
                    <div class="lucia-prod-info">
                        <strong>${window.luciaEscape(p.nome)}</strong>
                        <span>R$ ${preco} • (${p.quantidade} em estoque)</span>
                    </div>
                    <button type="button" class="lucia-prod-btn" onclick="window.comprarPelaLucia('${p.id}')">+ Carrinho</button>
                </div>
            `);
            return;
        }
    }

    const palavras = texto.replace(/[?.,!]/g, '').split(/\s+/).filter(function(w) { return w.length >= 3 && !['que', 'tem', 'uma', 'para', 'com', 'quero', 'ver', 'qual', 'preço', 'preco', 'valor'].includes(w); });

    if (palavras.length > 0 && produtos.length > 0) {
        const encontrados = produtos.filter(function(p) {
            const alvo = ((p.nome || '') + ' ' + (p.descricao || '') + ' ' + (p.categoria || '')).toLowerCase();
            return palavras.some(function(palavra) { return alvo.includes(palavra); });
        }).slice(0, 3);

        if (encontrados.length > 0) {
            if (typing) typing.remove();
            const cardsHtml = encontrados.map(function(p) {
                const preco = Number(p.preco).toFixed(2).replace('.', ',');
                const disp = Number(p.quantidade) > 0;
                return `
                    <div class="lucia-prod-card">
                        <div class="lucia-prod-info">
                            <strong>${window.luciaEscape(p.nome)}</strong>
                            <span>R$ ${preco} • ${disp ? p.quantidade + ' un. em estoque' : 'Esgotado'}</span>
                        </div>
                        ${disp ? `<button type="button" class="lucia-prod-btn" onclick="window.comprarPelaLucia('${p.id}')">+ Carrinho</button>` : ''}
                    </div>
                `;
            }).join('');

            window.adicionarBolhaLucia('bot', `
                Encontrei ${encontrados.length} produto(s) no nosso banco de dados para a sua busca:<br>
                ${cardsHtml}
                <div class="lucia-chips">
                    <button type="button" class="lucia-chip" onclick="window.navegarPelaLucia('produtos')">Ver todos no Catálogo ➔</button>
                </div>
            `);
            return;
        }
    }

    // Resposta padrão
    if (typing) typing.remove();
    window.adicionarBolhaLucia('bot', `
        Posso te ajudar a encontrar qualquer item do nosso catálogo (experimente digitar <strong>"fita"</strong>, <strong>"lâmpada"</strong>, <strong>"painel"</strong> ou <strong>"spot"</strong>), consultar seu <strong>CEP</strong> ou calcular a iluminação ideal dizendo quantos <strong>m²</strong> tem seu espaço! 😊
        ${window.menuRapidoHTML()}
    `);
};

// 5. INICIALIZAÇÃO DA ESTRUTURA HTML DO WIDGET
window.montarWidgetLucia = function() {
    if (document.getElementById('lucia-widget-root')) return;

    const style = document.createElement('style');
    style.id = 'lucia-styles';
    style.innerHTML = `
        #lucia-widget-root { font-family: 'Poppins', sans-serif; z-index: 999990; }
        
        #lucia-fab {
            position: fixed !important; bottom: 24px !important; right: 24px !important; z-index: 999990 !important;
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important; color: #ffffff !important;
            border: 2px solid rgba(255, 255, 255, 0.25) !important; border-radius: 50px !important;
            padding: 10px 20px 10px 12px !important; display: flex !important; align-items: center !important; gap: 10px !important;
            box-shadow: 0 8px 25px rgba(2, 132, 199, 0.4) !important; cursor: pointer !important;
            font-weight: 600 !important; font-size: 0.9rem !important; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        #lucia-fab:hover { transform: translateY(-3px) scale(1.02) !important; box-shadow: 0 12px 30px rgba(2, 132, 199, 0.55) !important; }
        #lucia-fab-avatar { position: relative; width: 34px; height: 34px; flex-shrink: 0; }
        #lucia-fab-avatar img { width: 34px !important; height: 34px !important; border-radius: 50% !important; object-fit: contain !important; background: #ffffff !important; padding: 2px !important; }
        #lucia-online-dot { position: absolute; bottom: 0; right: 0; width: 10px; height: 10px; background: #22c55e; border: 2px solid #ffffff; border-radius: 50%; }
        #lucia-unread-badge { background: #ef4444; color: #ffffff; font-size: 0.72rem; font-weight: 700; padding: 2px 7px; border-radius: 20px; margin-left: 2px; animation: luciaPulse 2s infinite; }
        
        @keyframes luciaPulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }

        #lucia-window {
            position: fixed !important; bottom: 90px !important; right: 24px !important;
            width: 380px !important; max-width: calc(100vw - 28px) !important; height: 540px !important; max-height: calc(100vh - 120px) !important;
            background: #ffffff !important; border-radius: 18px !important; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.28) !important;
            border: 1px solid #e2e8f0 !important; display: none !important; flex-direction: column !important; overflow: hidden !important; z-index: 999995 !important;
            animation: luciaSlideUp 0.25s ease-out;
        }
        #lucia-window.lucia-aberta { display: flex !important; }
        
        @keyframes luciaSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

        .lucia-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #ffffff; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #0284c7; }
        .lucia-header-left { display: flex; align-items: center; gap: 10px; }
        .lucia-header-left img { width: 38px; height: 38px; border-radius: 50%; background: #ffffff; padding: 2px; object-fit: contain; }
        .lucia-header-title strong { display: block; font-size: 0.96rem; color: #ffffff !important; line-height: 1.2; }
        .lucia-header-title small { display: flex; align-items: center; gap: 5px; font-size: 0.74rem; color: #38bdf8 !important; }
        .lucia-header-actions { display: flex; align-items: center; gap: 6px; }
        
        .lucia-icon-btn { background: rgba(255, 255, 255, 0.08); border: none; color: #cbd5e1; width: 30px; height: 30px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; transition: all 0.2s ease; }
        .lucia-icon-btn:hover { background: rgba(255, 255, 255, 0.18); color: #ffffff; }

        #lucia-messages { flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; background: #f8fafc; scroll-behavior: smooth; }
        .lucia-bubble { max-width: 88%; padding: 11px 14px; border-radius: 14px; font-size: 0.86rem; line-height: 1.5; word-wrap: break-word; position: relative; }
        .lucia-bubble.bot { align-self: flex-start; background: #ffffff; color: #1e293b; border: 1px solid #e2e8f0; border-bottom-left-radius: 3px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.04); }
        .lucia-bubble.user { align-self: flex-end; background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); color: #ffffff; border-bottom-right-radius: 3px; box-shadow: 0 2px 6px rgba(2, 132, 199, 0.25); }

        .lucia-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
        .lucia-chip { background: #f0f9ff; color: #0369a1; border: 1px solid #bae6fd; border-radius: 20px; padding: 5px 11px; font-size: 0.76rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
        .lucia-chip:hover { background: #0284c7; color: #ffffff; border-color: #0284c7; }

        .lucia-prod-card { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 8px 10px; margin-top: 8px; }
        .lucia-prod-info { flex: 1; min-width: 0; }
        .lucia-prod-info strong { display: block; font-size: 0.8rem; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .lucia-prod-info span { font-size: 0.78rem; color: #0284c7; font-weight: 700; }
        .lucia-prod-btn { background: #15803d; color: #ffffff; border: none; border-radius: 6px; padding: 6px 10px; font-size: 0.74rem; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .lucia-prod-btn:hover { background: #166534; }

        .lucia-typing { display: inline-flex; align-items: center; gap: 4px; padding: 10px 14px; }
        .lucia-typing span { width: 6px; height: 6px; background: #64748b; border-radius: 50%; animation: luciaBounce 1.3s infinite ease-in-out; }
        .lucia-typing span:nth-child(2) { animation-delay: 0.15s; }
        .lucia-typing span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes luciaBounce { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }

        .lucia-footer { display: flex; align-items: center; padding: 10px 12px; background: #ffffff; border-top: 1px solid #e2e8f0; gap: 8px; }
        #lucia-input { flex: 1; padding: 9px 14px; border: 1px solid #cbd5e1; border-radius: 22px; font-size: 0.85rem; outline: none; font-family: inherit; background: #f8fafc; color: #0f172a; }
        #lucia-input:focus { border-color: #0284c7; background: #ffffff; }
        #lucia-send { background: #0284c7; color: #ffffff; border: none; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.95rem; transition: background 0.2s ease; }
        #lucia-send:hover { background: #0369a1; }

        body.carrinho-aberto #lucia-fab, body.carrinho-aberto #lucia-window { display: none !important; }

        @media (max-width: 600px) {
            #lucia-fab { bottom: 16px !important; right: 14px !important; padding: 8px 14px 8px 10px !important; font-size: 0.82rem !important; }
            #lucia-window { bottom: 74px !important; right: 14px !important; width: calc(100vw - 28px) !important; height: 480px !important; }
        }
    `;
    document.head.appendChild(style);

    const root = document.createElement('div');
    root.id = 'lucia-widget-root';
    root.innerHTML = `
        <button type="button" id="lucia-fab" onclick="window.alternarChatLucia(event)" aria-label="Abrir assistente virtual Lúcia">
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
                    <button type="button" class="lucia-icon-btn" onclick="window.reiniciarChatLucia()" title="Limpar conversa">↺</button>
                    <button type="button" class="lucia-icon-btn" onclick="window.alternarChatLucia(event)" title="Fechar">✕</button>
                </div>
            </div>
            <div id="lucia-messages"></div>
            <form class="lucia-footer" onsubmit="window.processarEnvioLucia(event)">
                <input type="text" id="lucia-input" placeholder="Ex: fita led, meu pedido, cep 09010-000..." autocomplete="off">
                <button type="submit" id="lucia-send" aria-label="Enviar mensagem">➤</button>
            </form>
        </div>
    `;
    document.body.appendChild(root);
};

// 6. GATILHO SEGURO DE INICIALIZAÇÃO
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', window.montarWidgetLucia);
} else {
    window.montarWidgetLucia();
}
