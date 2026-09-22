// === ESTADO GLOBAL ===
window.produtosGlobais = [];
window.categoriaAtual = 'todas';
window.ordemAtual = 'padrao';
window.prazoEntregaAtual = 'A combinar';

// === INJEÇÃO DE ESTILOS CSS AUXILIARES ===
(function injetarEstilosBotoes() {
  if (document.getElementById('jr-btn-fix-styles')) return;
  const style = document.createElement('style');
  style.id = 'jr-btn-fix-styles';
  style.innerHTML = `
    .btn, button.btn, button.brand { transition: all 0.2s ease-in-out !important; }
    .btn-primary { background-color: #0284c7 !important; color: #ffffff !important; border: 1px solid #0284c7 !important; }
    .btn-primary:hover, button.btn-primary:hover, .btn-comprar:hover { background-color: #0369a1 !important; color: #ffffff !important; filter: brightness(1.05); cursor: pointer; }
    .btn-disabled { background-color: #94a3b8 !important; color: #ffffff !important; border: 1px solid #94a3b8 !important; cursor: not-allowed !important; opacity: 0.7; }
    .btn-ghost:hover { background-color: rgba(255, 255, 255, 0.15) !important; color: #ffffff !important; }
    .btn-qtd { background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; width: 26px; height: 26px; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .btn-qtd:hover { background: #e2e8f0; }
    .mobile-user-links { display: none; }
    .desktop-user-dropdown { display: inline-block; }
    @media (max-width: 768px) {
      .desktop-user-dropdown { display: none !important; }
      .mobile-user-links { display: flex !important; flex-direction: column !important; gap: 10px !important; padding-top: 12px !important; margin-top: 8px !important; border-top: 1px solid rgba(255, 255, 255, 0.15) !important; }
      .mobile-user-links a { font-size: 1rem !important; font-weight: 500 !important; }
    }
  `;
  document.head.appendChild(style);
})();

// === FUNÇÕES DE CONTROLE DO MENU MOBILE ===
function alternarMenuMobile() { const nav = document.querySelector('.main-nav'); if (nav) nav.classList.toggle('open'); }
function fecharMenuMobile() { const nav = document.querySelector('.main-nav'); if (nav) nav.classList.remove('open'); }
function alternarUserMenu(e) { if (e) e.stopPropagation(); const menu = document.getElementById('user-menu'); if (menu) menu.style.display = (menu.style.display === 'block') ? 'none' : 'block'; }
function fecharUserMenu() { const menu = document.getElementById('user-menu'); if (menu) menu.style.display = 'none'; }
document.addEventListener('click', (e) => { const userMenu = document.getElementById('user-menu'); const userChip = document.querySelector('.user-chip'); if (userMenu && userChip && !userChip.contains(e.target) && !userMenu.contains(e.target)) { userMenu.style.display = 'none'; } });

// === CABEÇALHO (COM CONFIRMAÇÃO VISUAL DE LOGIN - EXIGÊNCIA PROFESSOR) ===
function renderHeader() {
  const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  const qtdCarrinho = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const header = document.querySelector('header');
  if (!header) return;

  header.innerHTML = `
    <div class="header-container">
      <button class="brand" onclick="fecharMenuMobile(); navegar('home');">
        <img src="img/logo.jpg" alt="JR Iluminação"><span><strong>JR Iluminação</strong><small>e Leds</small></span>
      </button>
      <nav class="main-nav">
        <a href="#" class="nav-link" onclick="fecharMenuMobile(); navegar('home'); return false;">Início</a>
        <a href="#" class="nav-link" onclick="fecharMenuMobile(); navegar('produtos'); return false;">Produtos</a>
        ${user ? `<a href="#" class="nav-link" onclick="fecharMenuMobile(); abrirCarrinho(); return false;" style="color: #38bdf8; font-weight: 600;">🛒 Carrinho (<span id="cart-count">${qtdCarrinho}</span>)</a>` : ''}
        ${user?.role === 'admin' ? `<a href="#" class="nav-link" onclick="fecharMenuMobile(); navegar('admin/dashboard'); return false;">Painel Admin</a>` : ''}
        
        ${user ? `
          <div class="mobile-user-links">
            <a href="#" class="nav-link" style="color: #10b981; font-weight: bold; pointer-events: none;">✅ Sessão Ativa: ${user.nome.split(' ')[0]}</a>
            <a href="#" class="nav-link" onclick="fecharMenuMobile(); navegar('perfil'); return false;" style="color: #e2e8f0;">👤 Histórico de Compras</a>
            <a href="#" class="nav-link" onclick="fecharMenuMobile(); fazerLogout(); return false;" style="color: #f87171 !important;">🚪 Encerrar Sessão</a>
          </div>
          
          <div class="desktop-user-dropdown" style="position: relative;">
            <div class="user-chip" onclick="alternarUserMenu(event)" style="cursor: pointer; display: flex; align-items: center; gap: 8px; background: #dcfce7; padding: 6px 14px; border-radius: 20px; border: 1px solid #bbf7d0;">
                <span style="color: #166534; font-size: 0.9em;">✅ Logado como:</span>
                <strong style="color: #14532d;">${user.nome.split(' ')[0]}</strong>
                <span style="font-size: 0.8rem; color: #14532d;">▼</span>
            </div>
            <div id="user-menu" style="display: none; position: absolute; top: 115%; right: 0; background: #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.18); border-radius: 8px; width: 220px; overflow: hidden; z-index: 100002;">
                <div style="padding: 12px 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; color: #475569; word-break: break-all;">
                    <strong style="color: #1e293b; display:block; margin-bottom: 4px;">Titular da Conta:</strong>
                    ${user.email}
                </div>
              <a href="#" onclick="fecharUserMenu(); navegar('perfil'); return false;" style="display: block; padding: 12px 15px; color: #1e293b; text-decoration: none; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem;">👤 Histórico de Compras</a>
              <a href="#" onclick="fecharUserMenu(); fazerLogout(); return false;" style="display: block; padding: 12px 15px; color: #dc2626; text-decoration: none; font-size: 0.9rem;">🚪 Encerrar Sessão</a>
            </div>
          </div>
        ` : `<button class="btn btn-primary btn-login" onclick="fecharMenuMobile(); navegar('login');">Entrar na Loja</button>`}
      </nav>
      <button class="mobile-menu" aria-label="Abrir menu" onclick="alternarMenuMobile()">☰</button>
    </div>
  `;
}

function renderSidebar() { return `<aside class="admin-sidebar"><div class="sidebar-brand"><span class="brand-mark">JR</span><div><strong>Administração</strong><small>JR Iluminação</small></div></div><nav><a onclick="navegar('admin/dashboard')">▦ <span>Dashboard</span></a><a onclick="navegar('admin/produtos')">▣ <span>Produtos</span></a><a onclick="navegar('admin/clientes')">♙ <span>Clientes</span></a><a onclick="navegar('admin/pedidos')">▤ <span>Pedidos</span></a><a onclick="navegar('admin/relatorios')">◔ <span>Relatórios</span></a></nav><div class="sidebar-bottom"><button onclick="navegar('home')">← Voltar para loja</button></div></aside>`; }
function renderHome() { const app = document.getElementById('app'); if (!app) return; app.className = ''; app.innerHTML = `<section class="hero"><div class="hero-inner"><span class="eyebrow">ILUMINAÇÃO • TECNOLOGIA • DESIGN</span><h1>Ilumine ambientes.<br><span>Transforme espaços.</span></h1><p>Soluções em LED para projetos residenciais e comerciais, com qualidade, economia e estilo.</p><div class="hero-actions"><button class="btn btn-primary btn-lg" onclick="navegar('produtos')">Explorar produtos <span>→</span></button><button class="btn btn-ghost btn-lg" onclick="document.getElementById('diferenciais').scrollIntoView({behavior:'smooth'})">Conheça a JR</button></div><div class="hero-trust"><span>✓ Qualidade garantida</span><span>✓ Atendimento especializado</span><span>✓ Economia de energia</span></div></div><div class="hero-glow"></div></section><section id="diferenciais" class="section"><div class="section-heading"><div><span class="eyebrow dark">POR QUE ESCOLHER A JR?</span><h2>Iluminação pensada para você.</h2></div><p>Produtos selecionados para unir desempenho, durabilidade e um visual moderno em cada projeto.</p></div><div class="feature-grid"><article><div class="feature-icon">✦</div><h3>Alta eficiência</h3><p>Tecnologia LED que entrega mais luminosidade consumindo menos energia.</p></article><article><div class="feature-icon">◇</div><h3>Design moderno</h3><p>Peças que valorizam ambientes residenciais, comerciais e corporativos.</p></article><article><div class="feature-icon">✓</div><h3>Compra segura</h3><p>Processo simples, atendimento próximo e informações claras.</p></article></div></section><section class="cta"><div><span class="eyebrow">CATÁLOGO JR</span><h2>Encontre a iluminação ideal.</h2><p>Veja nosso catálogo e escolha a solução certa para o seu projeto.</p></div><button class="btn btn-primary btn-lg" onclick="navegar('produtos')">Ver catálogo →</button></section>`; }

// === CATÁLOGO COM FILTROS ===
function renderProdutos() {
  const app = document.getElementById('app');
  if (!app) return;
  app.className = 'page-shell';
  app.innerHTML = `
    <div class="page-header" style="margin-bottom: 20px;">
      <div><span class="eyebrow dark">CATÁLOGO</span><h1>Nossos produtos</h1><p>Escolha entre soluções de iluminação para todos os ambientes.</p></div>
      <div class="search-wrap"><span>⌕</span><input id="busca-produtos" placeholder="Buscar produto..." oninput="aplicarFiltrosCatalog()"></div>
    </div>
    <div class="catalog-controls" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #e2e8f0;">
      <div style="display: flex; gap: 8px; overflow-x: auto; -webkit-overflow-scrolling: touch; padding-bottom: 4px;">
        <button class="btn btn-filtro active" data-cat="todas" onclick="selecionarCategoria('todas', this)" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 20px; border: 1px solid #cbd5e1; background: #0284c7; color: #fff; cursor: pointer;">Todos</button>
        <button class="btn btn-filtro" data-cat="fita" onclick="selecionarCategoria('fita', this)" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 20px; border: 1px solid #cbd5e1; background: #fff; color: #475569; cursor: pointer;">Fitas LED</button>
        <button class="btn btn-filtro" data-cat="spot" onclick="selecionarCategoria('spot', this)" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 20px; border: 1px solid #cbd5e1; background: #fff; color: #475569; cursor: pointer;">Spots & Embutidos</button>
        <button class="btn btn-filtro" data-cat="lampada" onclick="selecionarCategoria('lampada', this)" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 20px; border: 1px solid #cbd5e1; background: #fff; color: #475569; cursor: pointer;">Lâmpadas</button>
        <button class="btn btn-filtro" data-cat="painel" onclick="selecionarCategoria('painel', this)" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 20px; border: 1px solid #cbd5e1; background: #fff; color: #475569; cursor: pointer;">Painéis Plafon</button>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <label for="select-ordem" style="font-size: 0.85rem; color: #64748b; font-weight: 500;">Ordenar:</label>
        <select id="select-ordem" onchange="selecionarOrdem(this.value)" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #cbd5e1; background: #fff; color: #334155; font-size: 0.85rem; cursor: pointer;">
          <option value="padrao">Padrão</option><option value="menor_preco">Menor Preço</option><option value="maior_preco">Maior Preço</option><option value="nome_az">Nome (A - Z)</option>
        </select>
      </div>
    </div>
    <div id="produtos-grid" class="product-grid">${renderSkeletonGrid(6)}</div>
  `;
  setTimeout(carregarProdutos, 80);
}

function selecionarCategoria(cat, btn) { window.categoriaAtual = cat; document.querySelectorAll('.btn-filtro').forEach(b => { b.style.background = '#fff'; b.style.color = '#475569'; }); if (btn) { btn.style.background = '#0284c7'; btn.style.color = '#fff'; } aplicarFiltrosCatalog(); }
function selecionarOrdem(ordem) { window.ordemAtual = ordem; aplicarFiltrosCatalog(); }

function aplicarFiltrosCatalog() {
  const termo = String(document.getElementById('busca-produtos')?.value || '').toLowerCase().trim();
  const grid = document.getElementById('produtos-grid');
  if (!grid || !window.produtosGlobais) return;

  // Função interna para remover acentos (Obs 4 - resolve "Lâmpadas" vs "Lampadas")
  const normalizar = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  let filtrados = window.produtosGlobais.filter(p => {
    const nomeNorm = normalizar(String(p.nome || ''));
    const descNorm = normalizar(String(p.descricao || ''));
    const catDbNorm = normalizar(String(p.categoria || ''));
    const termoNorm = normalizar(termo);
    const catSelectNorm = normalizar(window.categoriaAtual);

    const bateTexto = nomeNorm.includes(termoNorm) || descNorm.includes(termoNorm);
    
    if (window.categoriaAtual === 'todas') return bateTexto;
    
    // Confere se bate com a categoria salva no BD, senão procura no nome
    if (catDbNorm.includes(catSelectNorm)) {
        return bateTexto;
    } else {
        return bateTexto && (nomeNorm.includes(catSelectNorm) || descNorm.includes(catSelectNorm));
    }
  });

  if (window.ordemAtual === 'menor_preco') filtrados.sort((a, b) => Number(a.preco) - Number(b.preco));
  else if (window.ordemAtual === 'maior_preco') filtrados.sort((a, b) => Number(b.preco) - Number(a.preco));
  else if (window.ordemAtual === 'nome_az') filtrados.sort((a, b) => String(a.nome).localeCompare(String(b.nome)));

  if (filtrados.length === 0) grid.innerHTML = renderEmptyState('◈', 'Nenhum produto encontrado', 'Tente outro termo ou categoria.');
  else grid.innerHTML = filtrados.map((p, i) => {
    const preco = Number(p.preco || 0).toFixed(2).replace('.', ',');
    const disponivel = Number(p.quantidade || 0) > 0;
    const img = (p.imagem && p.imagem.trim() !== '' && p.imagem !== 'placeholder.jpg') ? p.imagem : 'https://images.unsplash.com/photo-1565814329452-e1efa11c5e89?auto=format&fit=crop&w=600&q=80'; 
    return `
    <article class="product-card" style="animation-delay:${i*45}ms; display: flex; flex-direction: column; justify-content: space-between;">
      <div style="height: 220px; width: 100%; background-image: url('${img}'); background-size: cover; background-position: center; border-bottom: 1px solid #eee;"></div>
      <div class="product-body" style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
        <div class="product-stock ${!disponivel || p.quantidade <= 5 ? 'low' : ''}" style="margin-bottom: 10px; font-size: 0.8rem; font-weight: 600;">
            ${disponivel ? `✓ Em estoque (${p.quantidade} un.)` : '✕ Esgotado'}
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; color: #1e293b;">${p.nome || 'Produto'}</h3>
        <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px; flex: 1;">${p.descricao || 'Solução LED.'}</p>
        <div class="product-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 15px;">
          <strong style="font-size: 1.25rem; color: #0f172a;">R$ ${preco}</strong>
          ${disponivel ? `<button class="btn btn-primary btn-comprar" style="padding: 8px 16px; border: none;" onclick="feedbackCompra(this, '${p.id}')">Comprar</button>` : `<button class="btn btn-disabled" style="padding: 8px 16px;" disabled>Indisponível</button>`}
        </div>
      </div>
    </article>`;
  }).join('');
}
async function carregarProdutos() {
  try { const r = await apiFetch('api/produtos.php'); window.produtosGlobais = (r && r.dados) ? r.dados : []; aplicarFiltrosCatalog(); } 
  catch(e) { const grid = document.getElementById('produtos-grid'); if (grid) grid.innerHTML = renderEmptyState('!', 'Erro', 'Confira a sua ligação.', "carregarProdutos()"); } 
  finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
}

// === LOGIN, REGISTO E RECUPERAÇÃO DE PALAVRA-PASSE ===
function renderLogin() {
  const app = document.getElementById('app');
  if (!app) return;
  app.className = 'login-page';
  app.innerHTML = `
    <div class="login-panel">
      <div class="login-brand" style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <img src="img/logo.jpg" alt="JR Iluminação" style="height: 52px; width: 52px; object-fit: contain; border-radius: 10px; background: #ffffff; padding: 2px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
        <div><strong style="font-size: 1.2rem; color: #0f172a; display: block;">JR Iluminação</strong><small style="color: #64748b; font-size: 0.85rem;">e Leds</small></div>
      </div>
      
      <div id="form-login-area">
        <span class="eyebrow dark">ÁREA RESTRITA</span>
        <h1>Bem-vindo de volta.</h1>
        <form onsubmit="realizarLogin(event)">
          <label>E-mail<input type="email" id="login-email" placeholder="seu@email.com" required></label>
          <label>Senha<input type="password" id="login-senha" placeholder="••••••••" required></label>
          <div style="text-align: right; margin-bottom: 12px;">
            <a href="#" onclick="solicitarRecuperacaoSenha(); return false;" style="font-size: 0.82rem; color: #0284c7; text-decoration: none;">Esqueceu a sua senha?</a>
          </div>
          <button class="btn btn-primary btn-lg full" type="submit">Entrar <span>→</span></button>
        </form>

        <div style="display: flex; align-items: center; margin: 18px 0; gap: 10px;">
          <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
          <span style="color: #94a3b8; font-size: 0.85rem; font-weight: 500;">ou</span>
          <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
        </div>

        <button type="button" onclick="loginComGoogle()" class="btn full" style="display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; border: 1px solid #cbd5e1; background: #ffffff; color: #334155; padding: 12px; border-radius: 8px; cursor: pointer; font-weight: 500; font-family: 'Poppins', sans-serif; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Entrar com o Google
        </button>

        <p style="margin-top: 18px; text-align: center;">Não tem conta? <a href="#" onclick="alternarFormulario('registro'); return false;">Criar agora</a></p>
      </div>

      <div id="form-registro-area" style="display: none;">
        <span class="eyebrow dark">NOVA CONTA</span>
        <h1>Crie seu acesso.</h1>
        <form onsubmit="realizarRegistro(event)">
          <label>Nome Completo<input type="text" id="reg-nome" placeholder="Carlos Eduardo Ramos" required></label>
          <label>E-mail<input type="email" id="reg-email" placeholder="carlos.ramos@email.com" required></label>
          <label>Senha<input type="password" id="reg-senha" placeholder="••••••••" required></label>
          <button class="btn btn-primary btn-lg full" type="submit">Cadastrar <span>→</span></button>
        </form>
        <p style="margin-top: 15px; text-align: center;">Já tem conta? <a href="#" onclick="alternarFormulario('login'); return false;">Fazer Login</a></p>
      </div>
      <button class="back-link" onclick="navegar('home')">← Voltar para a loja</button>
    </div>`;
}

// Modal de Recuperação de Palavra-passe
window.solicitarRecuperacaoSenha = async function() {
    if (typeof Swal === 'undefined') return alert("Funcionalidade temporariamente indisponível.");
    const { value: email } = await Swal.fire({
        title: 'Recuperar Senha',
        input: 'email',
        inputLabel: 'Introduza o seu e-mail cadastrado',
        inputPlaceholder: 'seu@email.com',
        confirmButtonText: 'Enviar Link',
        cancelButtonText: 'Cancelar',
        showCancelButton: true,
        confirmButtonColor: '#0284c7'
    });

    if (email) {
        Swal.fire({
            title: 'Verificação Enviada',
            text: `Se o e-mail ${email} estiver registado na JR Iluminação, enviámos um código temporário de redefinição.`,
            icon: 'info',
            confirmButtonColor: '#0284c7'
        });
    }
};

function alternarFormulario(tipo) {
  document.getElementById('form-login-area').style.display = tipo === 'registro' ? 'none' : 'block';
  document.getElementById('form-registro-area').style.display = tipo === 'registro' ? 'block' : 'none';
}

async function realizarRegistro(event) {
  event.preventDefault();
  
  const nome = document.getElementById('reg-nome').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const senha = document.getElementById('reg-senha').value;

  if (!nome || !email || !senha) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({ title: 'Atenção', text: 'Preencha todos os campos.', icon: 'warning', confirmButtonColor: '#0284c7' });
    } else {
      alert('Preencha todos os campos.');
    }
    return;
  }

  if (typeof mostrarLoading === 'function') mostrarLoading(true, 'A criar conta...');

  try {
    const res = await fetch('api/registro.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });
    
    const data = await res.json();

    if (data.sucesso) {
      if (typeof Swal !== 'undefined') {
        await Swal.fire({
          title: 'Registo Concluído!',
          text: data.mensagem || 'Conta criada com sucesso! O seu registo está em análise.',
          icon: 'success',
          confirmButtonColor: '#0284c7'
        });
      } else {
        alert(data.mensagem);
      }
      alternarFormulario('login');
      const loginEmailInput = document.getElementById('login-email');
      if (loginEmailInput) loginEmailInput.value = email;
    } else {
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          title: 'Não foi possível registar',
          text: data.erro || data.mensagem || 'Verifique os dados informados.',
          icon: 'error',
          confirmButtonColor: '#0284c7'
        });
      } else {
        alert(data.erro || data.mensagem);
      }
    }
  } catch (e) {
    if (typeof Swal !== 'undefined') {
      Swal.fire({ title: 'Erro de Comunicação', text: 'Falha ao ligar à API de registo.', icon: 'error', confirmButtonColor: '#0284c7' });
    } else {
      alert('Erro ao ligar ao servidor.');
    }
  } finally {
    if (typeof mostrarLoading === 'function') mostrarLoading(false);
  }
}
// === PERFIL DO CLIENTE ===
window.renderPerfil = async function() {
    const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
    if (!user) return navegar('login');
    const main = document.querySelector('main');
    if (!main) return;
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A carregar perfil...");

    let pedidosHTML = '';
    try {
        const res = await apiFetch(`api/pedidos.php?email=${encodeURIComponent(user.email)}`);
        const pedidos = res.dados || [];

        if (pedidos.length === 0) {
            pedidosHTML = '<p style="color: #64748b; padding: 15px 0;">Ainda não realizou nenhuma compra conosco.</p>';
        } else {
            const getStatusColor = (status) => {
                switch(status) {
                    case 'Pendente': return 'background: #fff3cd; color: #856404;';
                    case 'Em processamento': return 'background: #cce5ff; color: #004085;';
                    case 'Enviado': return 'background: #e2e3e5; color: #383d41;';
                    case 'Concluído': return 'background: #d4edda; color: #155724;';
                    case 'Entregue': return 'background: #d4edda; color: #155724;';
                    default: return 'background: #e2e8f0; color: #475569;';
                }
            };

            pedidosHTML = `
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${pedidos.map(p => `
                        <div style="border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; overflow: hidden;">
                            <div style="padding: 15px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; background: #fff;" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                                <div>
                                    <strong style="font-size: 1.1rem; color: #0f172a;">Pedido #${p.id}</strong>
                                    <div style="color: #64748b; font-size: 0.85rem; margin-top: 4px;">${new Date(p.data_pedido).toLocaleDateString('pt-BR')} • R$ ${parseFloat(p.total).toFixed(2).replace('.', ',')}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 15px;">
                                    <span style="padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold; ${getStatusColor(p.status)}">${p.status}</span>
                                    <span style="color: #94a3b8; font-size: 0.8rem;">Ver itens ▼</span>
                                </div>
                            </div>
                            <div style="display: none; padding: 15px; border-top: 1px solid #e2e8f0;">
                                <h4 style="margin: 0 0 10px 0; font-size: 0.9rem; color: #475569;">Produtos Comprados:</h4>
                                <ul style="list-style: none; padding: 0; margin: 0;">
                                    ${p.itens && p.itens.length > 0 ? p.itens.map(item => `
                                        <li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #cbd5e1; font-size: 0.9rem;">
                                            <span style="color: #334155;">${item.quantidade}x ${item.nome}</span>
                                            <strong style="color: #0f172a;">R$ ${parseFloat(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</strong>
                                        </li>
                                    `).join('') : '<li style="font-size: 0.85rem; color: #94a3b8;">Nenhum detalhe de item encontrado.</li>'}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (e) { pedidosHTML = '<p style="color: red;">Não foi possível carregar o histórico de compras.</p>'; } 
    finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }

    main.innerHTML = `
    <div class="container" style="max-width: 800px; margin: 30px auto; padding: 15px;">
        <h2 style="margin-bottom: 20px; color: #1e293b;">Área do Cliente</h2>
        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 25px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; margin-bottom: 15px; color: #334155; border-bottom: 1px solid #eee; padding-bottom: 10px;">Dados Pessoais</h3>
            <form onsubmit="atualizarMeuPerfil(event, ${user.id})">
                <div style="margin-bottom: 15px;"><label style="display: block; margin-bottom: 5px; color: #64748b; font-size: 0.9rem;">Nome Completo</label><input type="text" id="perfil-nome" value="${user.nome}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px;" required></div>
                <div style="margin-bottom: 20px;"><label style="display: block; margin-bottom: 5px; color: #64748b; font-size: 0.9rem;">E-mail</label><input type="email" id="perfil-email" value="${user.email}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px;" required></div>
                <button type="submit" class="btn btn-primary" style="padding: 10px 20px; cursor: pointer; width: 100%; max-width: 220px;">Guardar Alterações</button>
            </form>
        </div>
        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; margin-bottom: 15px; color: #334155; border-bottom: 1px solid #eee; padding-bottom: 10px;">O Meu Histórico de Compras</h3>
            ${pedidosHTML}
        </div>
    </div>`;
};

window.atualizarMeuPerfil = async function(event, id) {
    event.preventDefault();
    const nome = document.getElementById('perfil-nome').value;
    const email = document.getElementById('perfil-email').value;
    const user = JSON.parse(localStorage.getItem('jr_user'));

    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A guardar...");
    try {
        const res = await apiFetch('api/perfil.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, nome: nome, email: email }) });
        if (res && res.sucesso) { user.nome = nome; user.email = email; localStorage.setItem('jr_user', JSON.stringify(user)); renderHeader(); if (typeof exibirMensagem === 'function') exibirMensagem("Perfil atualizado com sucesso!", "sucesso"); } 
        else { if (typeof exibirMensagem === 'function') exibirMensagem("Erro na atualização", "erro"); }
    } catch (e) { console.error(e); } finally { if (typeof mostrarLoading === 'function') mostrarLoading(false); }
}

function renderEmptyState(icon, title, desc, action = null) { return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${desc}</p>${action ? `<button class="btn btn-primary" onclick="${action}">Tentar novamente</button>` : ''}</div>`; }
function renderSkeletonGrid(n) { return Array.from({ length: n }, () => '<div class="skeleton-card"><div></div><span></span><span></span></div>').join(''); }

// === CARRINHO ===
function adicionarAoCarrinho(id) {
  const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
  if (!user) { if (typeof exibirMensagem === 'function') exibirMensagem("Precisa de iniciar sessão para comprar.", "aviso"); return navegar('login'); }
  if (!window.produtosGlobais || window.produtosGlobais.length === 0) return;

  const p = window.produtosGlobais.find(x => String(x.id) === String(id));
  if (!p) return;

  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  let item = carrinho.find(x => String(x.id) === String(p.id));
  let qtdAtual = item ? item.quantidade : 0;

  if (qtdAtual + 1 > p.quantidade) { if (typeof exibirMensagem === 'function') exibirMensagem(`Limite atingido! Apenas ${p.quantidade} unidades em stock.`, "aviso"); return; }
  
  if (item) item.quantidade += 1; else carrinho.push({ id: p.id, nome: p.nome, preco: Number(p.preco || 0), imagem: p.imagem, quantidade: 1 });
  localStorage.setItem('carrinho', JSON.stringify(carrinho)); renderHeader(); abrirCarrinho();
}

function alterarQtdCarrinho(index, delta) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  if (!carrinho[index]) return;
  const p = window.produtosGlobais.find(x => String(x.id) === String(carrinho[index].id));
  if (delta > 0 && p && (carrinho[index].quantidade + delta > p.quantidade)) { if (typeof exibirMensagem === 'function') exibirMensagem(`Limite atingido!`, "aviso"); return; }
  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade <= 0) carrinho.splice(index, 1);
  localStorage.setItem('carrinho', JSON.stringify(carrinho)); renderHeader(); renderizarItensCarrinho();
}

function abrirCarrinho() {
  let modal = document.getElementById('modal-carrinho');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-carrinho';
    modal.style.cssText = 'position:fixed; top:0; right:0; width:100%; max-width:420px; height:100%; background:#fff; box-shadow:-5px 0 25px rgba(0,0,0,0.3); z-index:99999; padding:25px; overflow-y:auto; display:flex; flex-direction:column; font-family:inherit; transition: 0.3s;';
    document.body.appendChild(modal);
  }
  renderizarItensCarrinho(); 
  modal.style.display = 'flex';
}

function fecharCarrinho() { const modal = document.getElementById('modal-carrinho'); if (modal) modal.style.display = 'none'; }

function renderizarItensCarrinho() {
  const modal = document.getElementById('modal-carrinho');
  if (!modal) return;
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  let total = 0;

  let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;"><h2 style="margin:0; font-size: 1.4rem;">🛒 O Seu Carrinho</h2><button onclick="fecharCarrinho()" style="background:none; border:none; font-size:28px; cursor:pointer; color: #888;">&times;</button></div><div style="flex:1; overflow-y:auto; padding-right:5px;">`;

  if (carrinho.length === 0) html += `<p style="color:#666; text-align:center; margin-top:40px;">O seu carrinho está vazio.</p></div>`;
  else {
    carrinho.forEach((item, index) => {
      const subtotal = item.preco * item.quantidade;
      total += subtotal;
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:15px;">
          <div><strong style="display:block; margin-bottom:5px; font-size: 0.95rem;">${item.nome}</strong><div style="display:flex; align-items:center; gap:8px; margin-top:5px;"><button class="btn-qtd" onclick="alterarQtdCarrinho(${index}, -1)">−</button><span style="font-weight:600; font-size:0.9rem;">${item.quantidade}</span><button class="btn-qtd" onclick="alterarQtdCarrinho(${index}, 1)">+</button><small style="color:#666; margin-left: 5px;">x R$ ${Number(item.preco).toFixed(2).replace('.', ',')}</small></div></div>
          <div style="text-align:right;"><strong style="display:block; margin-bottom:5px; font-size: 0.95rem;">R$ ${subtotal.toFixed(2).replace('.', ',')}</strong><button onclick="removerDoCarrinho(${index})" style="color:#dc3545; background:none; border:none; cursor:pointer; font-size:12px; font-weight:bold;">Remover</button></div>
        </div>`;
    });
    html += `</div><div style="margin-top:15px; border-top:2px solid #eee; padding-top:15px;"><h3 style="display:flex; justify-content:space-between; margin-bottom:15px; color: #1e293b;"><span>Total:</span> <span>R$ ${total.toFixed(2).replace('.', ',')}</span></h3><button onclick="renderizarCheckout()" class="btn btn-primary btn-lg full" style="width:100%; cursor:pointer; padding: 14px;">Avançar para Entrega ➔</button></div>`;
  }
  modal.innerHTML = html;
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  carrinho.splice(index, 1); localStorage.setItem('carrinho', JSON.stringify(carrinho));
  renderHeader(); renderizarItensCarrinho();
}

// === TELA DE CHECKOUT (COM CÁLCULO DE FRETE E CAMPOS DE CARTÃO) ===
function calcularPrazoEntrega(cep) {
    const cepNum = parseInt(cep.replace(/\D/g, ''), 10);
    if (isNaN(cepNum)) return "";
    
    if (cepNum >= 9000000 && cepNum <= 9299999) return "1 dia útil (Santo André e Região)";
    if (cepNum >= 9300000 && cepNum <= 9999999) return "1 a 2 dias úteis (Grande ABC)";
    if (cepNum >= 1000000 && cepNum <= 8999999) return "2 a 3 dias úteis (Capital - SP)";
    if (cepNum >= 10000000 && cepNum <= 19999999) return "3 a 5 dias úteis (Interior/Litoral SP)";
    return "5 a 10 dias úteis (Outros Estados)";
}

window.alternarCamposPagamento = function(valor) {
    const boxCartao = document.getElementById('box-cartao');
    if (valor === 'Cartão de Crédito') { boxCartao.style.display = 'block'; } 
    else { boxCartao.style.display = 'none'; }
}

window.renderizarCheckout = function() {
  const modal = document.getElementById('modal-carrinho');
  const user = JSON.parse(localStorage.getItem('jr_user') || '{}');
  window.prazoEntregaAtual = 'A combinar';
  
  const html = `
    <div style="display:flex; align-items:center; margin-bottom:15px; gap: 15px;">
      <button onclick="renderizarItensCarrinho()" style="background:none; border:none; font-size:1.2rem; cursor:pointer; color: #0284c7;">⬅ Voltar</button>
      <h2 style="margin:0; font-size: 1.2rem;">📦 Finalizar Pedido</h2>
    </div>
    
    <div style="flex:1; overflow-y:auto; padding-right:5px;">
        <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
            <h4 style="margin: 0 0 12px 0; font-size: 0.95rem; color: #475569;">1. Seus Dados</h4>
            <input type="text" id="chk-nome" value="${user.nome || ''}" placeholder="Nome Completo" style="width:100%; padding:10px; margin-bottom:8px; border:1px solid #cbd5e1; border-radius:4px;" required>
            <input type="text" id="chk-telefone" placeholder="Celular / WhatsApp (11) 90000-0000" style="width:100%; padding:10px; margin-bottom:8px; border:1px solid #cbd5e1; border-radius:4px;" required>
            
            <h4 style="margin: 15px 0 12px 0; font-size: 0.95rem; color: #475569;">2. Endereço de Entrega</h4>
            <div style="display: flex; gap: 8px; margin-bottom: 8px;">
                <input type="text" id="chk-cep" placeholder="CEP" maxlength="9" style="width:40%; padding:10px; border:1px solid #cbd5e1; border-radius:4px;" required>
                <input type="text" id="chk-cidade" placeholder="Cidade" style="width:60%; padding:10px; border:1px solid #cbd5e1; border-radius:4px;" required>
            </div>
            <input type="text" id="chk-endereco" placeholder="Ex: Rua das Lâmpadas, 100 - Centro" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:4px;" required>
            <div id="box-prazo" style="margin-top: 10px; font-size: 0.85rem; color: #0284c7; font-weight: 600; display: none;">🚚 Previsão: <span id="txt-prazo"></span></div>
            
            <h4 style="margin: 20px 0 12px 0; font-size: 0.95rem; color: #475569;">3. Pagamento</h4>
            <select id="chk-pagamento" onchange="alternarCamposPagamento(this.value)" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:4px; font-weight:bold; color:#0f172a; cursor:pointer;">
                <option value="PIX">⚡ PIX (Aprovação Imediata)</option>
                <option value="Cartão de Crédito">💳 Cartão de Crédito</option>
                <option value="Boleto Bancário">📄 Boleto Bancário</option>
            </select>

            <div id="box-cartao" style="display:none; margin-top: 10px; padding: 15px; background: #eff6ff; border-radius: 6px; border: 1px solid #bfdbfe;">
                <input type="text" placeholder="Número do Cartão (Ex: 4111 1111 1111 1111)" maxlength="19" style="width:100%; padding:10px; margin-bottom:8px; border:1px solid #cbd5e1; border-radius:4px;">
                <input type="text" placeholder="Nome Impresso no Cartão" style="width:100%; padding:10px; margin-bottom:8px; border:1px solid #cbd5e1; border-radius:4px;">
                <div style="display:flex; gap:8px;">
                    <input type="text" placeholder="Validade (MM/AA)" maxlength="5" style="width:50%; padding:10px; border:1px solid #cbd5e1; border-radius:4px;">
                    <input type="text" placeholder="CVV (Verso)" maxlength="3" style="width:50%; padding:10px; border:1px solid #cbd5e1; border-radius:4px;">
                </div>
            </div>
        </div>
    </div>

    <div style="margin-top:10px; border-top:2px solid #eee; padding-top:15px;">
        <button id="btn-finalizar" onclick="finalizarPedido(this)" class="btn btn-primary btn-lg full" style="width:100%; cursor:pointer; padding: 14px; font-weight: bold; background: #15803d; border-color: #15803d;">✅ Confirmar Compra</button>
    </div>
  `;
  modal.innerHTML = html;

  const inputTelefone = document.getElementById('chk-telefone');
  if (inputTelefone) { inputTelefone.addEventListener('input', function(e) { let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/); e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : ''); }); }

  const inputCep = document.getElementById('chk-cep');
  if (inputCep) {
      inputCep.addEventListener('input', async function(e) {
          let v = e.target.value.replace(/\D/g, ''); let x = v.match(/(\d{0,5})(\d{0,3})/); e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2];
          if (v.length === 8) {
              const inputCidade = document.getElementById('chk-cidade'); 
              const inputEnd = document.getElementById('chk-endereco');
              const boxPrazo = document.getElementById('box-prazo');
              const txtPrazo = document.getElementById('txt-prazo');

              if (inputCidade) inputCidade.value = "A consultar...";
              try {
                  const res = await fetch(`https://viacep.com.br/ws/${v}/json/`); const data = await res.json();
                  if (!data.erro) { 
                      if (inputCidade) inputCidade.value = `${data.localidade} / ${data.uf}`; 
                      if (inputEnd && !inputEnd.value) inputEnd.value = data.logradouro ? `${data.logradouro}, ${data.bairro}` : ''; 
                      
                      // Cálculo Logístico (Prazo)
                      const prazo = calcularPrazoEntrega(v);
                      window.prazoEntregaAtual = prazo;
                      if (boxPrazo && txtPrazo) {
                          txtPrazo.innerText = prazo;
                          boxPrazo.style.display = 'block';
                      }
                      inputEnd?.focus(); 
                  } 
                  else { if (inputCidade) inputCidade.value = ""; if (typeof exibirMensagem === 'function') exibirMensagem("CEP não encontrado.", "aviso"); }
              } catch (err) { if (inputCidade) inputCidade.value = ""; }
          }
      });
  }
}

// === EXIGÊNCIA DO PROFESSOR: BLINDAGEM DO PEDIDO ===
window.finalizarPedido = async function(btnElement) {
    if (typeof validarFinalizacaoCompra === 'function') {
        const aprovado = await validarFinalizacaoCompra();
        if (!aprovado) return; 
    }

    const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
    const nome = document.getElementById('chk-nome').value.trim();
    const telefone = document.getElementById('chk-telefone').value.trim();
    const cep = document.getElementById('chk-cep').value.trim();
    const cidade = document.getElementById('chk-cidade').value.trim();
    const endereco = document.getElementById('chk-endereco').value.trim();
    const pagamento = document.getElementById('chk-pagamento').value;

    if (!nome || !telefone || !cep || !cidade || !endereco) {
        if (typeof Swal !== 'undefined') Swal.fire('Aviso', 'Preencha todos os campos do endereço.', 'warning');
        return; 
    }

    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    if (carrinho.length === 0) return;
    let total = 0; carrinho.forEach(item => total += (parseFloat(item.preco) * parseInt(item.quantidade)));

    if (btnElement) { btnElement.disabled = true; btnElement.innerHTML = '⏳ A processar...'; btnElement.style.opacity = '0.7'; }

    try {
        const res = await apiFetch('api/pedidos.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ acao: 'criar', email: user.email, nome: nome, telefone: telefone, cep: cep, cidade: cidade, endereco: endereco, forma_pagamento: pagamento, prazo_entrega: window.prazoEntregaAtual, total: total, itens: carrinho })
        });

        if (res && res.sucesso) {
            localStorage.removeItem('carrinho'); fecharCarrinho(); renderHeader();
            exibirComprovantePedido(res.pedido_id, total, cidade, endereco, pagamento);
        } else {
            if (typeof Swal !== 'undefined') Swal.fire('Erro', res.erro || 'Falha na compra', 'error');
            if (btnElement) { btnElement.disabled = false; btnElement.innerHTML = '✅ Confirmar Compra'; btnElement.style.opacity = '1'; }
        }
    } catch (erro) {
        if (typeof Swal !== 'undefined') Swal.fire('Erro', 'Erro ao comunicar com o servidor.', 'error');
        if (btnElement) { btnElement.disabled = false; btnElement.innerHTML = '✅ Confirmar Compra'; btnElement.style.opacity = '1'; }
    }
};

// === COMPROVANTE COM PIX, BOLETO E CARTÃO (SIMULAÇÃO REALISTA) ===
window.exibirComprovantePedido = function(pedidoId, total, cidade, endereco, pagamento) {
  let modalRecibo = document.getElementById('modal-recibo-pedido');
  if (modalRecibo) modalRecibo.remove();

  modalRecibo = document.createElement('div');
  modalRecibo.id = 'modal-recibo-pedido';
  modalRecibo.style.cssText = `position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.85); z-index: 1000000; display: flex; align-items: center; justify-content: center; padding: 20px;`;

  let infoPagamentoHTML = '';

  if (pagamento === 'PIX') {
      const pixFalso = "00020126580014BR.GOV.BCB.PIX0136pix-teste-tcc@jriluminacao.com.br5204000053039865802BR5913JR Iluminacao6009Sao Paulo62070503***63041D3D";
      infoPagamentoHTML = `
          <div style="background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #166534; font-size: 1rem;">⚡ Pagamento via PIX</h4>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(pixFalso)}" alt="QR Code PIX" style="width: 140px; height: 140px; display: block; margin: 0 auto 10px auto; border-radius: 8px;">
              <button onclick="navigator.clipboard.writeText('${pixFalso}'); this.innerHTML='Copiado!'; setTimeout(()=>this.innerHTML='📋 Copiar Código PIX', 2000);" style="background: #16a34a; color: #fff; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 0.85rem; font-weight: bold; width: 100%;">📋 Copiar Código PIX</button>
              <button onclick="simularAprovacaoPedido(${pedidoId}, this)" style="margin-top: 10px; background: #eab308; color: #713f12; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold; width: 100%;">⚡ Simular Pagamento Instantâneo (TCC)</button>
          </div>
      `;
  } else if (pagamento === 'Boleto Bancário') {
      const linhaBoleto = "34191.79001 01043.510047 91020.150008 5 914500000" + Math.floor(total * 100);
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + 3);
      const vencFormatado = dataVencimento.toLocaleDateString('pt-BR');

      infoPagamentoHTML = `
          <div style="background: #f8fafc; border: 2px dashed #64748b; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: left;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <h4 style="margin: 0; color: #1e293b; font-size: 0.95rem;">📄 Boleto Bancário</h4>
                  <small style="color: #dc2626; font-weight: bold;">Vence em: ${vencFormatado}</small>
              </div>
              <p style="margin: 0 0 6px 0; font-size: 0.8rem; color: #64748b;">Linha Digitável:</p>
              <div style="background: #e2e8f0; padding: 8px; border-radius: 4px; font-family: monospace; font-size: 0.8rem; word-break: break-all; margin-bottom: 10px; color: #0f172a;">${linhaBoleto}</div>
              <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                  <button onclick="navigator.clipboard.writeText('${linhaBoleto}'); this.innerHTML='Copiado!'; setTimeout(()=>this.innerHTML='📋 Copiar Código', 2000);" style="flex: 1; background: #475569; color: #fff; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">📋 Copiar Código</button>
                  <button onclick="window.print()" style="flex: 1; background: #fff; color: #334155; border: 1px solid #cbd5e1; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold;">🖨️ Imprimir</button>
              </div>
              <button onclick="simularAprovacaoPedido(${pedidoId}, this)" style="background: #eab308; color: #713f12; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold; width: 100%;">⚡ Simular Compensação do Boleto (TCC)</button>
          </div>
      `;
  } else {
      const codigoAuth = "AUT-" + (Math.floor(Math.random() * 900000) + 100000);
      infoPagamentoHTML = `
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #1e40af; font-size: 0.95rem;">💳 Cartão de Crédito</h4>
              <div style="background: #fff; padding: 10px; border-radius: 4px; border: 1px dashed #93c5fd; text-align: left; margin-bottom: 10px;">
                  <p style="margin: 0 0 5px 0; font-size: 0.8rem; color: #64748b;">Processando cartão final ****</p>
                  <p style="margin: 0 0 5px 0; font-size: 0.8rem; color: #64748b;">Autorização: <strong style="color: #1e40af;">${codigoAuth}</strong></p>
                  <p style="margin: 0; font-size: 0.8rem; color: #64748b;">Status: <strong style="color: #22c55e;">Pré-Autorizado</strong></p>
              </div>
              <button onclick="simularAprovacaoPedido(${pedidoId}, this)" style="background: #eab308; color: #713f12; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: bold; width: 100%;">⚡ Confirmar Captura do Cartão (TCC)</button>
          </div>
      `;
  }

  modalRecibo.innerHTML = `
    <div style="background: #fff; border-radius: 12px; max-width: 440px; width: 100%; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; animation: fadeInToast 0.3s ease;">
      <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 1.5rem;">🎉 Pedido Registado!</h2>
      <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 20px;">Pedido <strong>#${pedidoId}</strong> gerado com sucesso.</p>
      
      ${infoPagamentoHTML}

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: left; margin-bottom: 25px; font-size: 0.9rem;">
        <p style="margin: 0 0 8px 0;"><strong>Valor Total:</strong> R$ ${total.toFixed(2).replace('.', ',')}</p>
        <p style="margin: 0;"><strong>Entrega:</strong> ${cidade} <br><span style="color: #64748b; font-size: 0.85rem;">${endereco}</span></p>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn btn-primary" style="flex: 1; padding: 12px;" onclick="document.getElementById('modal-recibo-pedido').remove(); navegar('perfil');">Ver no Perfil</button>
        <button class="btn" style="flex: 1; padding: 12px; border: 1px solid #cbd5e1; background: #fff; color: #334155;" onclick="document.getElementById('modal-recibo-pedido').remove(); navegar('produtos');">Continuar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalRecibo);
};

// Botão "Mágico" para o TCC
window.simularAprovacaoPedido = async function(pedidoId, btnEl) {
    btnEl.innerHTML = "⏳ Aprovando...";
    btnEl.disabled = true;
    try {
        const res = await apiFetch('api/pedidos.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'atualizar_status', id: pedidoId, status: 'Em processamento' }) });
        if (res && res.sucesso) {
            btnEl.innerHTML = "✅ Aprovado na Hora!";
            btnEl.style.background = "#22c55e";
            btnEl.style.color = "#fff";
            if (typeof exibirMensagem === 'function') exibirMensagem("Webhook recebido: Pedido aprovado!", "sucesso");
        } else {
            btnEl.innerHTML = "❌ Erro ao Aprovar";
        }
    } catch(e) {
        btnEl.innerHTML = "❌ Erro";
    }
}

function feedbackCompra(botao, idProduto) {
    const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
    if (!user) { if (typeof exibirMensagem === 'function') exibirMensagem("Inicie sessão para comprar", "aviso"); return navegar('login'); }
    adicionarAoCarrinho(idProduto);
    const textoOriginal = botao.innerHTML;
    botao.innerHTML = "✓ Adicionado"; botao.style.backgroundColor = "#15803d"; botao.style.color = "#ffffff"; botao.style.pointerEvents = "none";
    setTimeout(() => { botao.innerHTML = textoOriginal; botao.style.backgroundColor = ""; botao.style.color = ""; botao.style.pointerEvents = "auto"; }, 1500);
}

// NOVO CÓDIGO DA MENSAGEM (100% INLINE E BLINDADO A FALHAS)
window.exibirMensagem = function(msg, tipo = 'sucesso') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position:fixed; top:20px; right:20px; z-index:9999999; display:flex; flex-direction:column; gap:10px;';
        document.body.appendChild(container);
    }
    
    let icone = tipo === 'sucesso' ? '✓' : (tipo === 'erro' ? '✕' : '⚠');
    let corFundo = tipo === 'sucesso' ? '#15803d' : (tipo === 'erro' ? '#b91c1c' : '#b45309');
    let corBorda = tipo === 'sucesso' ? '#052e16' : (tipo === 'erro' ? '#450a0a' : '#451a03');

    const toast = document.createElement('div');
    toast.style.cssText = `
        min-width: 250px; max-width: 400px; padding: 14px 18px; border-radius: 8px; 
        box-shadow: 0 4px 14px rgba(0,0,0,0.3); color: #fff; display: flex; align-items: center; 
        gap: 12px; font-size: 0.95rem; font-family: sans-serif;
        background-color: ${corFundo}; border-left: 5px solid ${corBorda};
        transition: opacity 0.3s ease-out; opacity: 1;
    `;
    toast.innerHTML = `<strong>${icone}</strong> <div>${msg}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 300);
    }, 3000); // Exibe por apenas 3 segundos
};
