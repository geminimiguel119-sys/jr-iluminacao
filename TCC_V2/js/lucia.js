// === LÚCIA: INTELIGÊNCIA ARTIFICIAL E CONSULTORA DA JR ILUMINAÇÃO ===

(function inicializarLucia() {
    if (document.getElementById('lucia-wrapper')) return;

    // === 1. ESTILOS CSS AVANÇADOS DA LÚCIA ===
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --lucia-primary: #0284c7;
            --lucia-dark: #0f172a;
            --lucia-bg: #f8fafc;
            --lucia-light: #ffffff;
            --lucia-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        #lucia-fab {
            position: fixed; bottom: 25px; right: 25px;
            width: 60px; height: 60px;
            background: linear-gradient(135deg, var(--lucia-primary), #0369a1);
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 15px rgba(2, 132, 199, 0.4);
            cursor: pointer; z-index: 999999;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border: 2px solid rgba(255,255,255,0.2);
        }
        #lucia-fab:hover { transform: scale(1.08) translateY(-5px); box-shadow: 0 8px 25px rgba(2, 132, 199, 0.5); }
        #lucia-fab svg { width: 30px; height: 30px; fill: white; animation: pulseGlow 2s infinite; }

        @keyframes pulseGlow { 0% { filter: drop-shadow(0 0 2px rgba(255,255,255,0.5)); } 50% { filter: drop-shadow(0 0 8px rgba(255,255,255,0.9)); } 100% { filter: drop-shadow(0 0 2px rgba(255,255,255,0.5)); } }

        #lucia-window {
            position: fixed; bottom: 100px; right: 25px;
            width: 380px; height: 600px; max-height: calc(100vh - 120px);
            background: rgba(255, 255, 255, 0.98);
            border-radius: 20px; box-shadow: var(--lucia-shadow);
            border: 1px solid rgba(2,132,199,0.2);
            display: flex; flex-direction: column; overflow: hidden;
            z-index: 999999;
            transform: translateY(20px); opacity: 0; pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #lucia-window.active { transform: translateY(0); opacity: 1; pointer-events: auto; }

        .lucia-header {
            background: var(--lucia-dark); color: white;
            padding: 15px 20px; display: flex; align-items: center; justify-content: space-between;
        }
        .lucia-perfil { display: flex; align-items: center; gap: 12px; }
        .lucia-avatar {
            width: 40px; height: 40px; background: linear-gradient(135deg, var(--lucia-primary), #38bdf8);
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 1.2rem; border: 2px solid rgba(255,255,255,0.2);
        }
        .lucia-info h3 { margin: 0; font-size: 1rem; font-family: 'Poppins', sans-serif; }
        .lucia-info span { font-size: 0.75rem; color: #cbd5e1; display: flex; align-items: center; gap: 4px; }
        .lucia-info span::before { content: ''; display: block; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: blink 1.5s infinite; }
        .lucia-fechar { background: transparent; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; transition: color 0.2s; }
        .lucia-fechar:hover { color: white; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .lucia-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background: var(--lucia-bg); scroll-behavior: smooth; }
        .lucia-body::-webkit-scrollbar { width: 6px; }
        .lucia-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        .msg-row { display: flex; width: 100%; animation: slideIn 0.3s ease-out; flex-direction: column; }
        .msg-lucia { align-items: flex-start; }
        .msg-user { align-items: flex-end; }
        
        .bubble { max-width: 85%; padding: 12px 16px; border-radius: 16px; font-size: 0.9rem; line-height: 1.5; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .msg-lucia .bubble { background: #ffffff; color: #334155; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; }
        .msg-user .bubble { background: var(--lucia-primary); color: #ffffff; border-bottom-right-radius: 4px; }

        /* Estilos dos Cards de Produtos na Lúcia */
        .lucia-products-container { display: flex; flex-direction: column; gap: 10px; margin-top: 10px; width: 100%; max-width: 280px; }
        .lucia-product-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; display: flex; align-items: center; padding: 10px; gap: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: transform 0.2s; }
        .lucia-product-card:hover { transform: translateY(-2px); border-color: #bae6fd; }
        .lucia-product-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; background: #f1f5f9; }
        .lucia-product-info { flex: 1; }
        .lucia-product-info h4 { margin: 0 0 4px 0; font-size: 0.85rem; color: #0f172a; line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .lucia-product-info p { margin: 0; font-size: 0.95rem; font-weight: bold; color: #0284c7; }
        .lucia-btn-comprar { background: #15803d; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.8rem; font-weight: bold; cursor: pointer; transition: 0.2s; margin-top: 6px; width: 100%; }
        .lucia-btn-comprar:hover { background: #166534; }

        /* Estilos da Calculadora Widget */
        .lucia-widget { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 15px; margin-top: 10px; width: 100%; max-width: 280px; }
        .lucia-widget h4 { margin: 0 0 10px 0; font-size: 0.9rem; color: #0f172a; text-align: center; }
        .lucia-widget label { font-size: 0.8rem; color: #475569; display: block; margin-bottom: 4px; font-weight: 500; }
        .lucia-widget input, .lucia-widget select { width: 100%; padding: 8px; margin-bottom: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.85rem; }
        .lucia-widget button { width: 100%; background: #0f172a; color: white; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.85rem; }
        .lucia-widget button:hover { background: #1e293b; }

        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .lucia-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .lucia-chip { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .lucia-chip:hover { background: #0284c7; color: #fff; }

        .lucia-footer { padding: 15px; background: #ffffff; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; align-items: center; }
        .lucia-input { flex: 1; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px 15px; border-radius: 24px; outline: none; font-size: 0.9rem; transition: border 0.2s; }
        .lucia-input:focus { border-color: var(--lucia-primary); background: #ffffff; }
        .lucia-send { background: var(--lucia-primary); color: white; border: none; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, background 0.2s; }
        .lucia-send:hover { background: #0369a1; transform: scale(1.05); }
        .lucia-send svg { width: 18px; height: 18px; fill: currentColor; margin-left: 2px; }

        .typing-indicator { display: flex; gap: 4px; padding: 4px 8px; }
        .typing-indicator span { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

        @media (max-width: 480px) {
            #lucia-window { width: 100vw; height: 100vh; max-height: 100vh; bottom: 0; right: 0; border-radius: 0; border: none; }
            .lucia-footer { padding-bottom: 25px; } 
        }
    `;
    document.head.appendChild(style);

    // === 2. INJEÇÃO DO HTML ===
    const luciaWidget = document.createElement('div');
    luciaWidget.id = 'lucia-wrapper';
    luciaWidget.innerHTML = `
        <div id="lucia-fab" onclick="window.toggleLucia()">
            <svg viewBox="0 0 24 24"><path d="M19.28,8.6L18,5.82L15.22,4.54C14.71,4.3 14.71,3.7 15.22,3.46L18,2.18L19.28,-0.6C19.5,-1.1 20.1,-1.1 20.32,-0.6L21.6,2.18L24.38,3.46C24.89,3.7 24.89,4.3 24.38,4.54L21.6,5.82L20.32,8.6C20.1,9.1 19.5,9.1 19.28,8.6M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,10.66 19.67,9.39 19.1,8.27L20.67,6.7C21.5,8.23 22,10.05 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2C14.05,2 15.87,2.5 17.4,3.33L15.83,4.9C14.71,4.33 13.44,4 12,4M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" transform="translate(0, 1.5)"/></svg>
        </div>

        <div id="lucia-window">
            <div class="lucia-header">
                <div class="lucia-perfil">
                    <div class="lucia-avatar">✨</div>
                    <div class="lucia-info">
                        <h3>Lúcia | Consultora JR</h3>
                        <span>Inteligência Artificial</span>
                    </div>
                </div>
                <button class="lucia-fechar" onclick="window.toggleLucia()">&times;</button>
            </div>
            
            <div class="lucia-body" id="lucia-chat-body">
                <div class="msg-row msg-lucia">
                    <div class="bubble">
                        Olá! Sou a <strong>Lúcia</strong>, a sua Projetista e Especialista em Iluminação. 💡<br><br>
                        Posso buscar produtos no estoque ou calcular a luz exata para o seu ambiente.
                        <div class="lucia-chips">
                            <span class="lucia-chip" onclick="window.enviarMensagemLucia('Quero calcular os lúmens')">📏 Calculadora de Lúmens</span>
                            <span class="lucia-chip" onclick="window.enviarMensagemLucia('Quero ver Fitas LED')">🎨 Ver Fitas LED</span>
                            <span class="lucia-chip" onclick="window.enviarMensagemLucia('Preciso de Spots')">🔦 Ver Spots</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lucia-footer">
                <input type="text" id="lucia-input-field" class="lucia-input" placeholder="Pergunte sobre um produto ou projeto..." onkeypress="if(event.key === 'Enter') window.enviarMensagemLucia()">
                <button class="lucia-send" id="lucia-btn-send" onclick="window.enviarMensagemLucia()">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(luciaWidget);

    // === 3. LÓGICA DE FUNCIONAMENTO MISTO (API + NATIVA) ===
    const chatBody = document.getElementById('lucia-chat-body');
    const inputField = document.getElementById('lucia-input-field');
    const btnSend = document.getElementById('lucia-btn-send');

    window.toggleLucia = function() {
        const win = document.getElementById('lucia-window');
        win.classList.toggle('active');
        if (win.classList.contains('active')) {
            setTimeout(() => inputField.focus(), 300);
        }
    };

    window.adicionarMensagemNaTela = function(texto, quem, produtos = null) {
        const row = document.createElement('div');
        row.className = `msg-row msg-${quem}`;
        
        // Verifica se é a tag especial da calculadora
        if (texto.includes('[WIDGET_CALCULADORA]')) {
            texto = texto.replace('[WIDGET_CALCULADORA]', `
                <div class="lucia-widget">
                    <h4>📏 Calculadora Luminotécnica</h4>
                    <label>Ambiente:</label>
                    <select id="calc-ambiente">
                        <option value="150">Sala de Estar / Quarto (150 lx)</option>
                        <option value="300">Cozinha / Banheiro (300 lx)</option>
                        <option value="500">Escritório / Leitura (500 lx)</option>
                    </select>
                    <div style="display:flex; gap:10px;">
                        <div style="flex:1;">
                            <label>Largura (m):</label>
                            <input type="number" id="calc-larg" placeholder="Ex: 4" step="0.1">
                        </div>
                        <div style="flex:1;">
                            <label>Comprimento (m):</label>
                            <input type="number" id="calc-comp" placeholder="Ex: 5" step="0.1">
                        </div>
                    </div>
                    <button onclick="window.executarCalculoLumens()">Calcular Projeto</button>
                </div>
            `);
        }

        let conteudoBase = `<div class="bubble">${texto}</div>`;
        
        // Renderiza os Cards de Produtos se vierem do Banco (Supabase)
        if (produtos && produtos.length > 0) {
            let cardsHtml = '<div class="lucia-products-container">';
            produtos.forEach(p => {
                const precoFmt = parseFloat(p.preco).toFixed(2).replace('.', ',');
                const imgValida = (p.imagem && p.imagem !== '') ? p.imagem : 'https://placehold.co/100x100/eeeeee/111827.jpg?text=Sem+Foto';
                cardsHtml += `
                    <div class="lucia-product-card">
                        <img src="${imgValida}" class="lucia-product-img">
                        <div class="lucia-product-info">
                            <h4>${p.nome}</h4>
                            <p>R$ ${precoFmt}</p>
                            <button class="lucia-btn-comprar" onclick="feedbackCompra(this, '${p.id}')">🛒 Comprar</button>
                        </div>
                    </div>
                `;
            });
            cardsHtml += '</div>';
            conteudoBase += cardsHtml;
        }

        row.innerHTML = conteudoBase;
        chatBody.appendChild(row);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    window.executarCalculoLumens = function() {
        const lux = document.getElementById('calc-ambiente').value;
        const larg = parseFloat(document.getElementById('calc-larg').value);
        const comp = parseFloat(document.getElementById('calc-comp').value);

        if (!larg || !comp) {
            window.adicionarMensagemNaTela('Por favor, preencha a largura e o comprimento para eu calcular! 😊', 'lucia');
            return;
        }

        const area = larg * comp;
        const lumensNecessarios = area * lux;
        const qtdPainel18w = Math.ceil(lumensNecessarios / 1400); // Média de um painel de 18W

        const respostaProjeto = `
            📊 **Análise do seu Projeto:**\n
            - Área do ambiente: **${area.toFixed(1)} m²**
            - Fluxo luminoso total necessário: **${lumensNecessarios} lúmens**\n
            💡 **Minha sugestão profissional:**
            Você vai precisar de aproximadamente **${qtdPainel18w} painéis/luminárias de 18W** (ou equivalente a ~1400 lúmens cada) bem distribuídos pelo teto para garantir uma luz perfeita.\n
            Quer que eu busque painéis LED no estoque para você?
        `.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        window.adicionarMensagemNaTela(respostaProjeto, 'lucia');
    };

    window.mostrarDigitando = function() {
        const row = document.createElement('div');
        row.className = 'msg-row msg-lucia';
        row.id = 'lucia-typing';
        row.innerHTML = `<div class="bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
        chatBody.appendChild(row);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    window.removerDigitando = function() {
        const typingNode = document.getElementById('lucia-typing');
        if (typingNode) typingNode.remove();
    };

    window.enviarMensagemLucia = async function(textoForcado = null) {
        const mensagem = textoForcado || inputField.value.trim();
        if (!mensagem) return;

        inputField.value = '';
        inputField.disabled = true;
        btnSend.disabled = true;
        window.adicionarMensagemNaTela(mensagem, 'user');
        window.mostrarDigitando();

        try {
            const respostaServidor = await fetch('api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: mensagem })
            });
            
            const dados = await respostaServidor.json();
            window.removerDigitando();

            if (dados.sucesso) {
                let textoFormatado = dados.resposta.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                window.adicionarMensagemNaTela(textoFormatado, 'lucia', dados.produtos);
            } else {
                window.adicionarMensagemNaTela('Desculpe, meu cérebro deu um pequeno curto-circuito. Pode repetir? 🔌', 'lucia');
            }
        } catch (erro) {
            window.removerDigitando();
            window.adicionarMensagemNaTela('Erro de conexão. O servidor da loja parece estar offline no momento. 🚨', 'lucia');
        } finally {
            inputField.disabled = false;
            btnSend.disabled = false;
            if (!textoForcado) inputField.focus();
        }
    };
})();
