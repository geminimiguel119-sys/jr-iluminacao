// === LÚCIA: INTELIGÊNCIA ARTIFICIAL DA JR ILUMINAÇÃO ===

(function inicializarLucia() {
    if (document.getElementById('lucia-wrapper')) return;

    // === 1. ESTILOS CSS DA LÚCIA ===
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --lucia-primary: #0284c7;
            --lucia-dark: #0f172a;
            --lucia-bg: #f8fafc;
            --lucia-light: #ffffff;
            --lucia-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        /* Botão Flutuante */
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

        /* Janela de Chat */
        #lucia-window {
            position: fixed; bottom: 100px; right: 25px;
            width: 380px; height: 550px; max-height: calc(100vh - 120px);
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px; box-shadow: var(--lucia-shadow);
            border: 1px solid rgba(255,255,255,0.5);
            display: flex; flex-direction: column; overflow: hidden;
            z-index: 999999;
            transform: translateY(20px); opacity: 0; pointer-events: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        #lucia-window.active { transform: translateY(0); opacity: 1; pointer-events: auto; }

        /* Header */
        .lucia-header {
            background: var(--lucia-dark); color: white;
            padding: 20px; display: flex; align-items: center; justify-content: space-between;
            border-radius: 20px 20px 0 0;
        }
        .lucia-perfil { display: flex; align-items: center; gap: 12px; }
        .lucia-avatar {
            width: 44px; height: 44px; background: linear-gradient(135deg, var(--lucia-primary), #38bdf8);
            border-radius: 50%; display: flex; align-items: center; justify-content: center;
            font-weight: bold; font-size: 1.2rem; border: 2px solid rgba(255,255,255,0.2);
        }
        .lucia-info h3 { margin: 0; font-size: 1.05rem; font-family: 'Poppins', sans-serif; letter-spacing: 0.5px; }
        .lucia-info span { font-size: 0.75rem; color: #cbd5e1; display: flex; align-items: center; gap: 4px; }
        .lucia-info span::before { content: ''; display: block; width: 6px; height: 6px; background: #22c55e; border-radius: 50%; animation: blink 1.5s infinite; }
        .lucia-fechar { background: transparent; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; transition: color 0.2s; }
        .lucia-fechar:hover { color: white; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        /* Área de Mensagens */
        .lucia-body { flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; background: var(--lucia-bg); scroll-behavior: smooth; }
        .lucia-body::-webkit-scrollbar { width: 6px; }
        .lucia-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        /* Balões de Mensagem */
        .msg-row { display: flex; width: 100%; animation: slideIn 0.3s ease-out; }
        .msg-lucia { justify-content: flex-start; }
        .msg-user { justify-content: flex-end; }
        
        .bubble { max-width: 80%; padding: 12px 16px; border-radius: 16px; font-size: 0.9rem; line-height: 1.4; position: relative; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .msg-lucia .bubble { background: #ffffff; color: #334155; border: 1px solid #e2e8f0; border-bottom-left-radius: 4px; }
        .msg-user .bubble { background: var(--lucia-primary); color: #ffffff; border-bottom-right-radius: 4px; }

        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        /* Botões de Ação Rápida (Chips) */
        .lucia-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 5px; }
        .lucia-chip { background: #e0f2fe; color: #0284c7; border: 1px solid #bae6fd; padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; font-weight: 500; }
        .lucia-chip:hover { background: #0284c7; color: #fff; }

        /* Rodapé / Input */
        .lucia-footer { padding: 15px; background: #ffffff; border-top: 1px solid #e2e8f0; border-radius: 0 0 20px 20px; display: flex; gap: 10px; align-items: center; }
        .lucia-input { flex: 1; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 12px 15px; border-radius: 24px; outline: none; font-size: 0.9rem; transition: border 0.2s; }
        .lucia-input:focus { border-color: var(--lucia-primary); background: #ffffff; }
        .lucia-send { background: var(--lucia-primary); color: white; border: none; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s, background 0.2s; }
        .lucia-send:hover { background: #0369a1; transform: scale(1.05); }
        .lucia-send svg { width: 18px; height: 18px; fill: currentColor; margin-left: 2px; }
        .lucia-send:disabled { background: #cbd5e1; cursor: not-allowed; transform: scale(1); }

        /* Efeito de Digitação */
        .typing-indicator { display: flex; gap: 4px; padding: 4px 8px; }
        .typing-indicator span { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
        @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

        /* Responsividade para Celular */
        @media (max-width: 480px) {
            #lucia-window { width: 100vw; height: 100vh; max-height: 100vh; bottom: 0; right: 0; border-radius: 0; border: none; }
            .lucia-header { border-radius: 0; }
            .lucia-footer { border-radius: 0; padding-bottom: 25px; } /* Área segura do iPhone */
        }
    `;
    document.head.appendChild(style);

    // === 2. INJEÇÃO DO HTML ===
    const luciaWidget = document.createElement('div');
    luciaWidget.id = 'lucia-wrapper';
    luciaWidget.innerHTML = `
        <!-- Botão Flutuante -->
        <div id="lucia-fab" onclick="window.toggleLucia()">
            <!-- Ícone de Estrelas/IA moderno -->
            <svg viewBox="0 0 24 24"><path d="M19.28,8.6L18,5.82L15.22,4.54C14.71,4.3 14.71,3.7 15.22,3.46L18,2.18L19.28,-0.6C19.5,-1.1 20.1,-1.1 20.32,-0.6L21.6,2.18L24.38,3.46C24.89,3.7 24.89,4.3 24.38,4.54L21.6,5.82L20.32,8.6C20.1,9.1 19.5,9.1 19.28,8.6M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,10.66 19.67,9.39 19.1,8.27L20.67,6.7C21.5,8.23 22,10.05 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2C14.05,2 15.87,2.5 17.4,3.33L15.83,4.9C14.71,4.33 13.44,4 12,4M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z" transform="translate(0, 1.5)"/></svg>
        </div>

        <!-- Janela do Chat -->
        <div id="lucia-window">
            <div class="lucia-header">
                <div class="lucia-perfil">
                    <div class="lucia-avatar">✨</div>
                    <div class="lucia-info">
                        <h3>Lúcia IA</h3>
                        <span>Online agora</span>
                    </div>
                </div>
                <button class="lucia-fechar" onclick="window.toggleLucia()">&times;</button>
            </div>
            
            <div class="lucia-body" id="lucia-chat-body">
                <!-- Mensagem Inicial de Boas-vindas -->
                <div class="msg-row msg-lucia">
                    <div class="bubble">
                        Olá! Sou a <strong>Lúcia</strong>, a assistente inteligente da JR Iluminação. 💡<br><br>
                        Como posso ajudar no seu projeto hoje?
                        <div class="lucia-chips">
                            <span class="lucia-chip" onclick="window.enviarMensagemLucia('Como calcular lúmens?')">Cálculo de Lúmens</span>
                            <span class="lucia-chip" onclick="window.enviarMensagemLucia('Quero ver as Fitas LED')">Ver Fitas LED</span>
                            <span class="lucia-chip" onclick="window.enviarMensagemLucia('Preciso de ajuda com meu pedido')">Status do Pedido</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lucia-footer">
                <input type="text" id="lucia-input-field" class="lucia-input" placeholder="Digite sua pergunta..." onkeypress="if(event.key === 'Enter') window.enviarMensagemLucia()">
                <button class="lucia-send" id="lucia-btn-send" onclick="window.enviarMensagemLucia()" title="Enviar">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(luciaWidget);

    // === 3. LÓGICA DE FUNCIONAMENTO ===
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

    window.adicionarMensagemNaTela = function(texto, quem) {
        const row = document.createElement('div');
        row.className = `msg-row msg-${quem}`;
        row.innerHTML = `<div class="bubble">${texto}</div>`;
        chatBody.appendChild(row);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    window.mostrarDigitando = function() {
        const row = document.createElement('div');
        row.className = 'msg-row msg-lucia';
        row.id = 'lucia-typing';
        row.innerHTML = `
            <div class="bubble">
                <div class="typing-indicator"><span></span><span></span><span></span></div>
            </div>
        `;
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

        // 1. Limpa o input e exibe a mensagem do usuário
        inputField.value = '';
        inputField.disabled = true;
        btnSend.disabled = true;
        window.adicionarMensagemNaTela(mensagem, 'user');
        
        // 2. Mostra animação de digitação
        window.mostrarDigitando();

        try {
            // *** INTEGRAÇÃO COM O BACKEND (API GEMINI / PHP) ***
            // Substitua 'api/chat.php' pelo endereço real da sua API da Lúcia se necessário
            const respostaServidor = await fetch('api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: mensagem })
            });
            
            const dados = await respostaServidor.json();
            window.removerDigitando();

            if (dados.sucesso && dados.resposta) {
                // Converte quebras de linha em <br> e **negrito** em tags <strong> para o HTML formatar bonito
                let textoFormatado = dados.resposta
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                window.adicionarMensagemNaTela(textoFormatado, 'lucia');
            } else {
                window.adicionarMensagemNaTela('Desculpe, tive um pequeno curto-circuito. Pode repetir? 🔌', 'lucia');
            }
        } catch (erro) {
            console.error("Erro na Lúcia:", erro);
            window.removerDigitando();
            // Resposta de simulação caso a API não esteja conectada ainda no TCC:
            setTimeout(() => {
                window.adicionarMensagemNaTela('Estou em manutenção para o TCC! Mas em breve responderei a tudo sobre: <strong>' + mensagem + '</strong> 💡', 'lucia');
            }, 800);
        } finally {
            inputField.disabled = false;
            btnSend.disabled = false;
            if (!textoForcado) inputField.focus();
        }
    };
})();
