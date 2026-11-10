// === LÚCIA: INTELIGÊNCIA ARTIFICIAL DA JR ILUMINAÇÃO ===

(function inicializarLucia() {
    if (document.getElementById('lucia-wrapper')) return;

    // === 1. ESTILOS CSS DA LÚCIA (Premium Glassmorphism) ===
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --lucia-primary: #0F4C81; /* Azul Corporativo */
            --lucia-accent: #FFC107;  /* Amarelo/Dourado */
            --lucia-bg: #f8fafc;
            --lucia-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        }

        #lucia-fab {
            position: fixed; bottom: 30px; right: 30px;
            width: 65px; height: 65px;
            background-color: var(--lucia-accent);
            color: var(--lucia-primary);
            border: none; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 6px 16px rgba(255, 193, 7, 0.35);
            cursor: pointer; z-index: 999999;
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease;
        }
        #lucia-fab:hover { transform: scale(1.1); box-shadow: 0 8px 22px rgba(255, 193, 7, 0.5); }
        #lucia-fab svg { width: 35px; height: 35px; fill: var(--lucia-primary); }

        #lucia-window {
            position: fixed; bottom: 110px; right: 30px;
            width: 360px; max-height: calc(100vh - 140px);
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            border-radius: 16px; box-shadow: var(--lucia-shadow);
            border: 1px solid #f1f5f9;
            display: flex; flex-direction: column; overflow: hidden;
            z-index: 999999;
            opacity: 0; transform: translateY(20px) scale(0.95); pointer-events: none;
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            font-family: 'Poppins', sans-serif;
        }
        #lucia-window.active { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }

        .lucia-header {
            background-color: var(--lucia-primary); color: white;
            padding: 16px 20px; display: flex; align-items: center; gap: 12px;
        }
        .lucia-header h3 { margin: 0; font-size: 15px; font-weight: 600; }
        .lucia-header span { font-size: 11px; color: #cbd5e1; }
        .lucia-fechar { margin-left: auto; background: none; border: none; color: #cbd5e1; font-size: 20px; cursor: pointer; }
        .lucia-fechar:hover { color: white; }

        .lucia-body {
            height: 380px; padding: 20px; overflow-y: auto;
            background-color: var(--lucia-bg); display: flex; flex-direction: column; gap: 12px;
        }
        .lucia-body::-webkit-scrollbar { width: 6px; }
        .lucia-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }

        .msg-row { display: flex; width: 100%; animation: slideIn 0.3s ease-out; }
        .msg-lucia { justify-content: flex-start; }
        .msg-user { justify-content: flex-end; }
        
        .bubble {
            max-width: 85%; padding: 12px 16px; border-radius: 16px;
            font-size: 13.5px; line-height: 1.5; box-shadow: 0 2px 5px rgba(0,0,0,0.02);
        }
        .msg-lucia .bubble { background-color: #ffffff; color: #334155; border-bottom-left-radius: 4px; border: 1px solid #e2e8f0; }
        .msg-user .bubble { background-color: var(--lucia-primary); color: white; border-bottom-right-radius: 4px; }

        .lucia-produtos { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; width: 95%; }
        .lucia-card {
            display: flex; align-items: center; gap: 12px; background: #ffffff;
            border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04); cursor: pointer; transition: border-color 0.2s;
        }
        .lucia-card:hover { border-color: var(--lucia-accent); }
        .lucia-card img { width: 50px; height: 50px; border-radius: 8px; object-fit: cover; background: #f1f5f9; }
        .lucia-card-info h4 { margin: 0; font-size: 12px; color: #1e293b; font-weight: 500; }
        .lucia-card-info span { font-size: 13px; font-weight: 700; color: #F57C00; }

        .lucia-footer { display: flex; padding: 15px; background-color: #ffffff; border-top: 1px solid #f1f5f9; align-items: center; }
        .lucia-input {
            flex: 1; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 24px;
            outline: none; font-size: 13px; font-family: inherit; transition: border-color 0.2s;
        }
        .lucia-input:focus { border-color: var(--lucia-primary); }
        .lucia-send {
            background-color: var(--lucia-primary); color: white; border: none; width: 40px; height: 40px;
            border-radius: 50%; margin-left: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;
        }
        .lucia-send:hover { background-color: var(--lucia-accent); color: var(--lucia-primary); }

        .lucia-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
        .lucia-chip { background: #fff; color: var(--lucia-primary); border: 1px solid #e2e8f0; border-radius: 20px; padding: 6px 12px; font-size: 12px; cursor: pointer; transition: 0.2s; }
        .lucia-chip:hover { background: var(--lucia-accent); border-color: var(--lucia-accent); }

        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        @media (max-width: 480px) {
            #lucia-window { width: 100vw; height: 100vh; max-height: 100vh; bottom: 0; right: 0; border-radius: 0; }
            .lucia-header { border-radius: 0; }
        }
    `;
    document.head.appendChild(style);

    // === 2. INJEÇÃO DO HTML ===
    const luciaWidget = document.createElement('div');
    luciaWidget.id = 'lucia-wrapper';
    luciaWidget.innerHTML = `
        <button id="lucia-fab" onclick="window.toggleLucia()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <path d="M50 20 C35 20 25 32 25 45 C25 55 33 63 36 72 L64 72 C67 63 75 55 75 45 C75 32 65 20 50 20 Z" fill="#ffffff" />
                <circle cx="40" cy="42" r="5" fill="#0F4C81" />
                <circle cx="60" cy="42" r="5" fill="#0F4C81" />
                <path d="M42 52 Q50 62 58 52" stroke="#0F4C81" stroke-width="4" fill="transparent" stroke-linecap="round" />
            </svg>
        </button>

        <div id="lucia-window">
            <div class="lucia-header">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="35" height="35">
                    <circle cx="50" cy="50" r="50" fill="#FFC107" />
                    <path d="M50 20 C35 20 25 32 25 45 C25 55 33 63 36 72 L64 72 C67 63 75 55 75 45 C75 32 65 20 50 20 Z" fill="#ffffff" />
                    <circle cx="40" cy="42" r="4" fill="#0F4C81" />
                    <circle cx="60" cy="42" r="4" fill="#0F4C81" />
                    <path d="M42 52 Q50 62 58 52" stroke="#0F4C81" stroke-width="3" fill="transparent" stroke-linecap="round" />
                </svg>
                <div>
                    <h3>Lúcia IA</h3>
                    <span>Especialista JR Iluminação</span>
                </div>
                <button class="lucia-fechar" onclick="window.toggleLucia()">✖</button>
            </div>
            
            <div class="lucia-body" id="lucia-chat-body">
                <div class="msg-row msg-lucia">
                    <div class="bubble">
                        Olá! 👋 Sou a Lúcia, assistente da JR Iluminação. Escolha uma opção ou digite a sua dúvida:
                        <div class="lucia-chips">
                            <span class="lucia-chip" onclick="window.enviarMensagemLucia('Fitas LED')">Fitas LED</span>
                            <span class="lucia-chip" onclick="window.enviarMensagemLucia('Painéis Plafon')">Painéis</span>
                            <span class="lucia-chip" onclick="window.enviarMensagemLucia('Status do Pedido')">Meu Pedido</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="lucia-footer">
                <input type="text" id="lucia-input-field" class="lucia-input" placeholder="Digite sua dúvida..." onkeypress="if(event.key === 'Enter') window.enviarMensagemLucia()">
                <button class="lucia-send" onclick="window.enviarMensagemLucia()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(luciaWidget);

    // === 3. LÓGICA DE COMUNICAÇÃO ===
    const chatBody = document.getElementById('lucia-chat-body');
    const inputField = document.getElementById('lucia-input-field');

    window.toggleLucia = function() {
        const win = document.getElementById('lucia-window');
        win.classList.toggle('active');
        if (win.classList.contains('active')) setTimeout(() => inputField.focus(), 300);
    };

    window.enviarMensagemLucia = async function(textoForcado = null) {
        const mensagem = textoForcado || inputField.value.trim();
        if (!mensagem) return;

        inputField.value = '';
        chatBody.innerHTML += `<div class="msg-row msg-user"><div class="bubble">${escapeHtml(mensagem)}</div></div>`;
        chatBody.scrollTop = chatBody.scrollHeight;

        const idDigitando = "digitando-" + Date.now();
        // AQUI FOI CORRIGIDO: "A pensar..." agora é "Digitando..."
        chatBody.innerHTML += `<div id="${idDigitando}" class="msg-row msg-lucia"><div class="bubble">Digitando...</div></div>`;
        chatBody.scrollTop = chatBody.scrollHeight;

        try {
            const resposta = await fetch('api/chat.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mensagem: mensagem })
            });
            const dados = await resposta.json();
            document.getElementById(idDigitando).remove();

            if (dados.sucesso) {
                const textoFormatado = dados.resposta.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');
                chatBody.innerHTML += `<div class="msg-row msg-lucia"><div class="bubble">${textoFormatado}</div></div>`;
                
                // Desenha os cards se houver produtos recomendados
                if (dados.produtos && dados.produtos.length > 0) {
                    let htmlProdutos = '<div class="lucia-produtos">';
                    dados.produtos.forEach(p => {
                        const precoReal = parseFloat(p.preco).toFixed(2).replace('.', ',');
                        const imgSrc = p.imagem && p.imagem.trim() !== '' ? p.imagem : 'img/produto-padrao.jpg';
                        htmlProdutos += `
                            <div class="lucia-card" onclick="window.location.hash='produtos'; window.toggleLucia();">
                                <img src="${imgSrc}" alt="${escapeHtml(p.nome)}">
                                <div class="lucia-card-info">
                                    <h4>${escapeHtml(p.nome)}</h4>
                                    <span>R$ ${precoReal}</span>
                                </div>
                            </div>
                        `;
                    });
                    htmlProdutos += '</div>';
                    chatBody.innerHTML += `<div class="msg-row msg-lucia">${htmlProdutos}</div>`;
                }
            } else {
                chatBody.innerHTML += `<div class="msg-row msg-lucia"><div class="bubble">Ocorreu um erro de comunicação.</div></div>`;
            }
        } catch (erro) {
            if (document.getElementById(idDigitando)) document.getElementById(idDigitando).remove();
            // AQUI FOI CORRIGIDO: Erro formatado em PT-BR
            chatBody.innerHTML += `<div class="msg-row msg-lucia"><div class="bubble">Erro de conexão. Verifique sua internet.</div></div>`;
        }
        chatBody.scrollTop = chatBody.scrollHeight;
    };
    
    // Função auxiliar para evitar injeção de código
    function escapeHtml(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
})();
