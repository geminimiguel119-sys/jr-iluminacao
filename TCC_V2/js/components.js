// === ESTADO GLOBAL ===
window.produtosGlobais = [];

// === INJEÇÃO DE ESTILOS CSS ===
(function injetarEstilosBotoes() {
  if (document.getElementById('jr-btn-fix-styles')) return;
  const style = document.createElement('style');
  style.id = 'jr-btn-fix-styles';
  style.innerHTML = `
    .btn, button.btn, button.brand {
      transition: all 0.2s ease-in-out !important;
    }
    .btn-primary {
      background-color: #0284c7 !important;
      color: #ffffff !important;
      border: 1px solid #0284c7 !important;
    }
    .btn-primary:hover,
    button.btn-primary:hover,
    .btn-comprar:hover {
      background-color: #0369a1 !important;
      color: #ffffff !important;
      filter: brightness(1.05);
      cursor: pointer;
    }
    .btn-disabled {
      background-color: #94a3b8 !important;
      color: #ffffff !important;
      border: 1px solid #94a3b8 !important;
      cursor: not-allowed !important;
      opacity: 0.7;
    }
    .btn-ghost:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      color: #ffffff !important;
    }
    .btn-qtd {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      width: 26px;
      height: 26px;
      font-weight: bold;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .btn-qtd:hover {
      background: #e2e8f0;
    }
    #toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      min-width: 280px;
      max-width: 420px;
      padding: 14px 18px;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.18);
      color: #fff;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.95rem;
      animation: fadeInToast 0.3s ease-in-out;
    }
    .toast.sucesso { background-color: #15803d; border-left: 5px solid #052e16; }
    .toast.erro { background-color: #b91c1c; border-left: 5px solid #450a0a; }
    .toast.aviso { background-color: #b45309; border-left: 5px solid #451a03; }
    @keyframes fadeInToast {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

// === CABEÇALHO ===
function renderHeader() {
  const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
  const carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  const qtdCarrinho = carrinho.reduce((acc, item) => acc + item.quantidade, 0);

  const header = document.querySelector('header');
  if (!header) return;

  header.innerHTML = `
    <div class="header-container">
      <button class="brand" onclick="navegar('home')" style="display: flex; align-items: center; gap: 10px; background: transparent; border: none; cursor: pointer; padding: 0;">
        <img src="img/logo.jpg" alt="JR Iluminação" style="height: 42px; width: 42px; object-fit: contain; border-radius: 8px; background: #ffffff; padding: 2px;">
        <span><strong style="color: #fff; font-size: 1.05rem;">JR Iluminação</strong><small style="color: #94a3b8; font-size: 0.75rem; display: block;">e Leds</small></span>
      </button>
      <nav class="main-nav">
        <a href="#" class="nav-link" onclick="navegar('home');return false">Início</a>
        <a href="#" class="nav-link" onclick="navegar('produtos');return false">Produtos</a>
        
        ${user ? `
        <a href="#" class="nav-link" onclick="abrirCarrinho();return false" style="color: #00d2ff; font-weight: bold;">
          🛒 Carrinho (<span id="cart-count">${qtdCarrinho}</span>)
        </a>` : ''}
        
        ${user?.role === 'admin' ? '<a href="#" class="nav-link" onclick="navegar(\'admin/dashboard\');return false">Painel</a>' : ''}
        
        ${user ? `
          <div class="user-dropdown" style="position: relative; display: inline-block;">
              <div class="user-chip" onclick="const menu = document.getElementById('user-menu'); menu.style.display = menu.style.display === 'block' ? 'none' : 'block';" style="cursor: pointer; display: flex; align-items: center; gap: 8px;">
                  <span class="avatar">${user.nome.charAt(0)}</span>
                  <span>${user.nome.split(' ')[0]}</span>
                  <span style="font-size: 0.8rem;">▼</span>
              </div>
              <div id="user-menu" style="display: none; position: absolute; top: 100%; right: 0; background: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 8px; width: 160px; overflow: hidden; z-index: 1000; margin-top: 5px;">
                  <a href="#" onclick="document.getElementById('user-menu').style.display='none'; navegar('perfil'); return false;" style="display: block; padding: 12px 15px; color: #333; text-decoration: none; border-bottom: 1px solid #eee;">👤 Meu Perfil</a>
                  <a href="#" onclick="fazerLogout(); return false;" style="display: block; padding: 12px 15px; color: #dc3545; text-decoration: none;">🚪 Sair</a>
              </div>
          </div>
        ` : '<button class="btn btn-primary btn-login" onclick="navegar(\'login\')">Entrar</button>'}
      </nav>
      <button class="mobile-menu" onclick="document.querySelector('.main-nav').classList.toggle('open')">☰</button>
    </div>
  `;
}

function renderSidebar() {
  return `<aside class="admin-sidebar"><div class="sidebar-brand"><span class="brand-mark">JR</span><div><strong>Administração</strong><small>JR Iluminação</small></div></div><nav><a onclick="navegar('admin/dashboard')">▦ <span>Dashboard</span></a><a onclick="navegar('admin/produtos')">▣ <span>Produtos</span></a><a onclick="navegar('admin/clientes')">♙ <span>Clientes</span></a><a onclick="navegar('admin/pedidos')">▤ <span>Pedidos</span></a><a onclick="navegar('admin/relatorios')">◔ <span>Relatórios</span></a></nav><div class="sidebar-bottom"><button onclick="navegar('home')">← Voltar para loja</button></div></aside>`;
}

function renderHome() {
  const app = document.getElementById('app');
  if (!app) return;
  app.className = '';
  app.innerHTML = `<section class="hero"><div class="hero-inner"><span class="eyebrow">ILUMINAÇÃO • TECNOLOGIA • DESIGN</span><h1>Ilumine ambientes.<br><span>Transforme espaços.</span></h1><p>Soluções em LED para projetos residenciais e comerciais, com qualidade, economia e estilo.</p><div class="hero-actions"><button class="btn btn-primary btn-lg" onclick="navegar('produtos')">Explorar produtos <span>→</span></button><button class="btn btn-ghost btn-lg" onclick="document.getElementById('diferenciais').scrollIntoView({behavior:'smooth'})">Conheça a JR</button></div><div class="hero-trust"><span>✓ Qualidade garantida</span><span>✓ Atendimento especializado</span><span>✓ Economia de energia</span></div></div><div class="hero-glow"></div></section><section id="diferenciais" class="section"><div class="section-heading"><div><span class="eyebrow dark">POR QUE ESCOLHER A JR?</span><h2>Iluminação pensada para você.</h2></div><p>Produtos selecionados para unir desempenho, durabilidade e um visual moderno em cada projeto.</p></div><div class="feature-grid"><article><div class="feature-icon">✦</div><h3>Alta eficiência</h3><p>Tecnologia LED que entrega mais luminosidade consumindo menos energia.</p></article><article><div class="feature-icon">◇</div><h3>Design moderno</h3><p>Peças que valorizam ambientes residenciais, comerciais e corporativos.</p></article><article><div class="feature-icon">✓</div><h3>Compra segura</h3><p>Processo simples, atendimento próximo e informações claras.</p></article></div></section><section class="cta"><div><span class="eyebrow">CATÁLOGO JR</span><h2>Encontre a iluminação ideal.</h2><p>Veja nosso catálogo e escolha a solução certa para o seu projeto.</p></div><button class="btn btn-primary btn-lg" onclick="navegar('produtos')">Ver catálogo →</button></section>`;
}

function renderProdutos() {
  const app = document.getElementById('app');
  if (!app) return;
  app.className = 'page-shell';
  app.innerHTML = `<div class="page-header"><div><span class="eyebrow dark">CATÁLOGO</span><h1>Nossos produtos</h1><p>Escolha entre soluções de iluminação para todos os ambientes.</p></div><div class="search-wrap"><span>⌕</span><input id="busca-produtos" placeholder="Buscar produto..." oninput="filtrarProdutos(this.value)"></div></div><div id="produtos-grid" class="product-grid">${renderSkeletonGrid(6)}</div>`;
  setTimeout(carregarProdutos, 80);
}

// === CATÁLOGO COM BLOQUEIO DE STOCK ESGOTADO ===
async function carregarProdutos() {
  const grid = document.getElementById('produtos-grid');
  if (!grid) {
    if (typeof mostrarLoading === 'function') mostrarLoading(false);
    return;
  }

  try {
    const r = await apiFetch('api/produtos.php'); 
    window.produtosGlobais = (r && r.dados) ? r.dados : []; 

    if (window.produtosGlobais.length === 0) {
      grid.innerHTML = renderEmptyState('◈','Catálogo vazio','Nenhum produto disponível no momento.');
      return;
    }

    grid.innerHTML = window.produtosGlobais.map((p, i) => {
      const preco = Number(p.preco || 0).toFixed(2).replace('.', ',');
      const qtd = Number(p.quantidade || 0);
      const disponivel = qtd > 0;
      
      const imagemProduto = (p.imagem && p.imagem.trim() !== '') 
          ? p.imagem 
          : 'https://images.unsplash.com/photo-1565814329452-e1efa11c5e89?auto=format&fit=crop&w=600&q=80'; 
      
      return `
      <article class="product-card" data-name="${(p.nome || '').toLowerCase()}" style="animation-delay:${i*45}ms; display: flex; flex-direction: column; justify-content: space-between;">
        <div style="height: 220px; width: 100%; background-image: url('${imagemProduto}'); background-size: cover; background-position: center; border-bottom: 1px solid #eee;">
        </div>
        
        <div class="product-body" style="padding: 20px; flex: 1; display: flex; flex-direction: column;">
          <div class="product-stock ${!disponivel ? 'low' : (qtd < 5 ? 'low' : '')}" style="margin-bottom: 10px; font-size: 0.8rem; font-weight: 600;">
              ${disponivel ? `✓ Em estoque (${qtd} un.)` : '✕ Esgotado'}
          </div>
          
          <h3 style="margin: 0 0 8px 0; font-size: 1.1rem; color: #1e293b;">${p.nome || 'Produto sem nome'}</h3>
          <p style="color: #64748b; font-size: 0.9rem; margin-bottom: 20px; flex: 1;">${p.descricao || 'Solução de iluminação LED.'}</p>
          
          <div class="product-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f1f5f9; padding-top: 15px;">
            <strong style="font-size: 1.25rem; color: #0f172a;">R$ ${preco}</strong>
            ${disponivel 
              ? `<button class="btn btn-primary btn-comprar" style="padding: 8px 16px; border: none; cursor: pointer;" onclick="feedbackCompra(this, '${p.id}')">Comprar</button>`
              : `<button class="btn btn-disabled" style="padding: 8px 16px;" disabled>Indisponível</button>`
            }
          </div>
        </div>
      </article>`;
    }).join('');

  } catch(e) {
    grid.innerHTML = renderEmptyState('!','Não foi possível carregar','Confira a sua ligação.', "carregarProdutos()");
  } finally {
    if (typeof mostrarLoading === 'function') mostrarLoading(false);
  }
}

function filtrarProdutos(termo) {
  const t = String(termo || '').toLowerCase();
  document.querySelectorAll('.product-card').forEach(c => {
    c.style.display = c.dataset.name.includes(t) ? '' : 'none';
  });
}

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
          <label>Nome Completo<input type="text" id="reg-nome" placeholder="João da Silva" required></label>
          <label>E-mail<input type="email" id="reg-email" placeholder="seu@email.com" required></label>
          <label>Senha<input type="password" id="reg-senha" placeholder="••••••••" required></label>
          <button class="btn btn-primary btn-lg full" type="submit">Cadastrar <span>→</span></button>
        </form>
        <p style="margin-top: 15px; text-align: center;">Já tem conta? <a href="#" onclick="alternarFormulario('login'); return false;">Fazer Login</a></p>
      </div>
      <button class="back-link" onclick="navegar('home')">← Voltar para a loja</button>
    </div>`;
}

function alternarFormulario(tipo) {
  if (tipo === 'registro') {
    document.getElementById('form-login-area').style.display = 'none';
    document.getElementById('form-registro-area').style.display = 'block';
  } else {
    document.getElementById('form-login-area').style.display = 'block';
    document.getElementById('form-registro-area').style.display = 'none';
  }
}

async function realizarRegistro(event) {
  event.preventDefault();
  const nome = document.getElementById('reg-nome').value;
  const email = document.getElementById('reg-email').value;
  const senha = document.getElementById('reg-senha').value;

  try {
    const res = await fetch('api/registro.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha })
    });
    const data = await res.json();
    if (data.sucesso) {
      if (typeof exibirMensagem === 'function') exibirMensagem("Conta criada com sucesso! Faça login para continuar.", "sucesso");
      alternarFormulario('login');
    } else {
      if (typeof exibirMensagem === 'function') exibirMensagem("Erro: " + data.erro, "erro");
    }
  } catch(e) {
    if (typeof exibirMensagem === 'function') exibirMensagem("Erro de conexão ao tentar registrar. Verifique a API.", "erro");
    else alert("Erro de conexão ao tentar registrar. Verifique a API.");
  }
}

// === PERFIL DO CLIENTE ===
window.renderPerfil = async function() {
    const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
    if (!user) {
        navegar('login');
        return;
    }

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
                    default: return 'background: #e2e8f0; color: #475569;';
                }
            };

            pedidosHTML = `
                <div class="table-responsive" style="margin-top: 15px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
                        <thead>
                            <tr style="background: #f8f9fa; border-bottom: 2px solid #dee2e6; text-align: left;">
                                <th style="padding: 12px;">Nº Pedido</th>
                                <th style="padding: 12px;">Data</th>
                                <th style="padding: 12px;">Total</th>
                                <th style="padding: 12px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pedidos.map(p => `
                                <tr style="border-bottom: 1px solid #eee;">
                                    <td style="padding: 12px;"><strong>#${p.id}</strong></td>
                                    <td style="padding: 12px; color: #555;">${new Date(p.data_pedido).toLocaleDateString('pt-BR')}</td>
                                    <td style="padding: 12px;"><strong>R$ ${parseFloat(p.total).toFixed(2).replace('.', ',')}</strong></td>
                                    <td style="padding: 12px;">
                                        <span style="padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; ${getStatusColor(p.status)}">${p.status}</span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }
    } catch (e) {
        pedidosHTML = '<p style="color: red;">Não foi possível carregar o histórico de compras.</p>';
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }

    main.innerHTML = `
    <div class="container" style="max-width: 800px; margin: 40px auto; padding: 20px;">
        <h2 style="margin-bottom: 20px; color: #1e293b;">Área do Cliente</h2>
        
        <div style="background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); margin-bottom: 30px; border: 1px solid #e2e8f0;">
            <h3 style="margin-top: 0; margin-bottom: 15px; color: #334155; border-bottom: 1px solid #eee; padding-bottom: 10px;">Dados Pessoais</h3>
            <form onsubmit="atualizarMeuPerfil(event, ${user.id})">
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px; color: #64748b; font-size: 0.9rem;">Nome Completo</label>
                    <input type="text" id="perfil-nome" value="${user.nome}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px;" required>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 5px; color: #64748b; font-size: 0.9rem;">E-mail (Usado para Login)</label>
                    <input type="email" id="perfil-email" value="${user.email}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 4px;" required>
                </div>
                <button type="submit" class="btn btn-primary" style="padding: 10px 20px; cursor: pointer;">Guardar Alterações</button>
            </form>
        </div>

        <div style="background: #fff; padding: 25px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
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

    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A guardar dados...");
    try {
        const res = await apiFetch('api/perfil.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id, nome: nome, email: email })
        });
        
        if (res && res.sucesso) {
            user.nome = nome;
            user.email = email;
            localStorage.setItem('jr_user', JSON.stringify(user));
            renderHeader(); 
            if (typeof exibirMensagem === 'function') exibirMensagem("Perfil atualizado com sucesso!", "sucesso");
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem("Erro: " + (res.erro || "Falha na atualização"), "erro");
        }
    } catch (e) {
        console.error(e);
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
}

function renderEmptyState(icon, title, desc, action = null) {
  return `<div class="empty-state"><div class="empty-icon">${icon}</div><h3>${title}</h3><p>${desc}</p>${action ? `<button class="btn btn-primary" onclick="${action}">Tentar novamente</button>` : ''}</div>`;
}

function renderSkeletonGrid(n) {
  return Array.from({ length: n }, () => '<div class="skeleton-card"><div></div><span></span><span></span></div>').join('');
}

// === CARRINHO COM AJUSTE DE QUANTIDADE (+ / -) ===
function adicionarAoCarrinho(id) {
  const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
  
  if (!user) {
      if (typeof exibirMensagem === 'function') exibirMensagem("Precisa iniciar sessão para comprar.", "aviso");
      navegar('login');
      return;
  }

  if (!window.produtosGlobais || window.produtosGlobais.length === 0) {
    if (typeof exibirMensagem === 'function') exibirMensagem("Erro: Produtos não carregados.", "erro");
    return;
  }

  const p = window.produtosGlobais.find(x => String(x.id) === String(id));
  if (!p) return;

  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  let item = carrinho.find(x => String(x.id) === String(p.id));

  if (item) {
    item.quantidade += 1;
  } else {
    carrinho.push({ id: p.id, nome: p.nome, preco: Number(p.preco || 0), imagem: p.imagem, quantidade: 1 });
  }

  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  renderHeader();
  abrirCarrinho();
}

function alterarQtdCarrinho(index, delta) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  if (!carrinho[index]) return;

  carrinho[index].quantidade += delta;
  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }

  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  renderHeader();
  renderizarItensCarrinho();
}

function abrirCarrinho() {
  let modal = document.getElementById('modal-carrinho');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'modal-carrinho';
    modal.style.cssText = 'position:fixed; top:0; right:0; width:100%; max-width:390px; height:100%; background:#fff; box-shadow:-5px 0 15px rgba(0,0,0,0.3); z-index:99999; padding:25px; overflow-y:auto; display:flex; flex-direction:column; font-family:inherit; transition: 0.3s;';
    document.body.appendChild(modal);
  }
  renderizarItensCarrinho();
  modal.style.display = 'flex';
}

function fecharCarrinho() {
  const modal = document.getElementById('modal-carrinho');
  if (modal) modal.style.display = 'none';
}

// === RENDERIZAÇÃO DO CARRINHO E AUTO-COMPLETE VIACEP ===
function renderizarItensCarrinho() {
  const modal = document.getElementById('modal-carrinho');
  if (!modal) return;

  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  let total = 0;

  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
      <h2 style="margin:0; font-size: 1.4rem;">🛒 Seu Carrinho</h2>
      <button onclick="fecharCarrinho()" style="background:none; border:none; font-size:28px; cursor:pointer; color: #888;">&times;</button>
    </div>
    <div style="flex:1; overflow-y:auto; padding-right:5px;">
  `;

  if (carrinho.length === 0) {
    html += `<p style="color:#666; text-align:center; margin-top:40px;">Seu carrinho está vazio.</p>`;
  } else {
    carrinho.forEach((item, index) => {
      const subtotal = item.preco * item.quantidade;
      total += subtotal;
      html += `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:15px;">
          <div>
            <strong style="display:block; margin-bottom:5px; font-size: 0.95rem;">${item.nome}</strong>
            <div style="display:flex; align-items:center; gap:8px; margin-top:5px;">
              <button class="btn-qtd" onclick="alterarQtdCarrinho(${index}, -1)">−</button>
              <span style="font-weight:600; font-size:0.9rem;">${item.quantidade}</span>
              <button class="btn-qtd" onclick="alterarQtdCarrinho(${index}, 1)">+</button>
              <small style="color:#666; margin-left: 5px;">x R$ ${Number(item.preco).toFixed(2).replace('.', ',')}</small>
            </div>
          </div>
          <div style="text-align:right;">
            <strong style="display:block; margin-bottom:5px; font-size: 0.95rem;">R$ ${subtotal.toFixed(2).replace('.', ',')}</strong>
            <button onclick="removerDoCarrinho(${index})" style="color:#dc3545; background:none; border:none; cursor:pointer; font-size:12px; font-weight:bold;">Remover</button>
          </div>
        </div>
      `;
    });
  }

  html += `</div>
    <div style="margin-top:15px; border-top:2px solid #eee; padding-top:15px;">
      <h3 style="display:flex; justify-content:space-between; margin-bottom:15px; color: #1e293b;">
          <span>Total:</span> 
          <span>R$ ${total.toFixed(2).replace('.', ',')}</span>
      </h3>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
          <h4 style="margin: 0 0 10px 0; font-size: 0.95rem; color: #475569;">📍 Dados de Entrega</h4>
          
          <input type="text" id="cart-telefone" placeholder="Seu Telefone/WhatsApp" style="width:100%; padding:10px; margin-bottom:8px; border:1px solid #cbd5e1; border-radius:4px; font-size: 0.9rem;" required>
          
          <div style="display: flex; gap: 8px; margin-bottom: 8px;">
              <input type="text" id="cart-cep" placeholder="CEP (Auto)" maxlength="9" style="width:45%; padding:10px; border:1px solid #cbd5e1; border-radius:4px; font-size: 0.9rem;" required>
              <input type="text" id="cart-cidade" placeholder="Cidade / UF" style="width:55%; padding:10px; border:1px solid #cbd5e1; border-radius:4px; font-size: 0.9rem;" required>
          </div>
          
          <input type="text" id="cart-endereco" placeholder="Endereço (Rua, Nº, Bairro)" style="width:100%; padding:10px; border:1px solid #cbd5e1; border-radius:4px; font-size: 0.9rem;" required>
      </div>

      <button onclick="finalizarPedido()" class="btn btn-primary btn-lg full" style="width:100%; cursor:pointer;">Confirmar e Finalizar Compra</button>
    </div>
  `;
  
  modal.innerHTML = html;

  // Formatação do telefone
  const inputTelefone = document.getElementById('cart-telefone');
  if (inputTelefone) {
      inputTelefone.addEventListener('input', function(e) {
          let x = e.target.value.replace(/\D/g, '').match(/(\d{0,2})(\d{0,5})(\d{0,4})/);
          e.target.value = !x[2] ? x[1] : '(' + x[1] + ') ' + x[2] + (x[3] ? '-' + x[3] : '');
      });
  }

  // Preenchimento automático via ViaCEP
  const inputCep = document.getElementById('cart-cep');
  if (inputCep) {
      inputCep.addEventListener('input', async function(e) {
          let v = e.target.value.replace(/\D/g, '');
          let x = v.match(/(\d{0,5})(\d{0,3})/);
          e.target.value = !x[2] ? x[1] : x[1] + '-' + x[2];

          if (v.length === 8) {
              const inputCidade = document.getElementById('cart-cidade');
              const inputEnd = document.getElementById('cart-endereco');
              if (inputCidade) inputCidade.value = "Consultando...";

              try {
                  const res = await fetch(`https://viacep.com.br/ws/${v}/json/`);
                  const data = await res.json();
                  if (!data.erro) {
                      if (inputCidade) inputCidade.value = `${data.localidade} / ${data.uf}`;
                      if (inputEnd && !inputEnd.value) {
                          inputEnd.value = data.logradouro ? `${data.logradouro}, ${data.bairro}` : '';
                      }
                      inputEnd?.focus();
                  } else {
                      if (inputCidade) inputCidade.value = "";
                      if (typeof exibirMensagem === 'function') exibirMensagem("CEP não encontrado.", "aviso");
                  }
              } catch (err) {
                  if (inputCidade) inputCidade.value = "";
              }
          }
      });
  }
}

function removerDoCarrinho(index) {
  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
  carrinho.splice(index, 1);
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  renderHeader();
  renderizarItensCarrinho();
}

// === COMPROVATIVO VISUAL DE ENCOMENDA ===
function exibirComprovantePedido(pedidoId, total, cidade, endereco) {
  let modalRecibo = document.getElementById('modal-recibo-pedido');
  if (modalRecibo) modalRecibo.remove();

  modalRecibo = document.createElement('div');
  modalRecibo.id = 'modal-recibo-pedido';
  modalRecibo.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: rgba(15, 23, 42, 0.7); z-index: 1000000;
    display: flex; align-items: center; justify-content: center; padding: 20px;
  `;

  modalRecibo.innerHTML = `
    <div style="background: #fff; border-radius: 12px; max-width: 440px; width: 100%; padding: 30px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: center; animation: fadeInToast 0.3s ease;">
      <div style="font-size: 3rem; margin-bottom: 10px;">🎉</div>
      <h2 style="margin: 0 0 10px 0; color: #0f172a; font-size: 1.5rem;">Encomenda Concluída!</h2>
      <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 20px;">O seu pedido foi registado com sucesso na base de dados.</p>
      
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; text-align: left; margin-bottom: 25px; font-size: 0.9rem;">
        <p style="margin: 0 0 8px 0;"><strong>Nº do Pedido:</strong> <span style="color: #0284c7; font-weight: bold;">#${pedidoId || 'REGISTADO'}</span></p>
        <p style="margin: 0 0 8px 0;"><strong>Valor Total:</strong> R$ ${total.toFixed(2).replace('.', ',')}</p>
        <p style="margin: 0 0 8px 0;"><strong>Destino:</strong> ${cidade}</p>
        <p style="margin: 0;"><strong>Morada:</strong> ${endereco}</p>
      </div>

      <div style="display: flex; gap: 10px;">
        <button class="btn btn-primary" style="flex: 1; padding: 12px;" onclick="document.getElementById('modal-recibo-pedido').remove(); navegar('perfil');">Ver Encomendas</button>
        <button class="btn" style="flex: 1; padding: 12px; border: 1px solid #cbd5e1; background: #fff; color: #334155;" onclick="document.getElementById('modal-recibo-pedido').remove(); navegar('produtos');">Continuar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalRecibo);
}

// === FINALIZAÇÃO DO PEDIDO ===
window.finalizarPedido = async function() {
    const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
    
    if (!user || !user.email) {
        if (typeof exibirMensagem === 'function') exibirMensagem("Sessão inválida. Faça login novamente.", "erro");
        fecharCarrinho();
        return navegar('login');
    }

    const telefone = document.getElementById('cart-telefone').value.trim();
    const cep = document.getElementById('cart-cep').value.trim();
    const cidade = document.getElementById('cart-cidade').value.trim();
    const endereco = document.getElementById('cart-endereco').value.trim();

    if (!telefone || !cep || !cidade || !endereco) {
        if (typeof exibirMensagem === 'function') exibirMensagem("Por favor, preencha todos os dados de entrega antes de finalizar.", "aviso");
        return; 
    }

    const carrinho = JSON.parse(localStorage.getItem('carrinho') || '[]');
    if (carrinho.length === 0) {
        if (typeof exibirMensagem === 'function') exibirMensagem("O seu carrinho está vazio!", "erro");
        return;
    }

    let total = 0;
    carrinho.forEach(item => {
        total += (parseFloat(item.preco) * parseInt(item.quantidade));
    });

    if (typeof mostrarLoading === 'function') mostrarLoading(true, "A processar a sua encomenda...");

    try {
        const res = await apiFetch('api/pedidos.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                acao: 'criar',
                email: user.email, 
                nome: user.nome,   
                total: total,
                itens: carrinho
            })
        });

        if (res && res.sucesso) {
            localStorage.removeItem('carrinho');
            fecharCarrinho();
            renderHeader();

            exibirComprovantePedido(res.pedido_id, total, cidade, endereco);
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem("Erro: " + (res.erro || "Falha na compra"), "erro");
        }
    } catch (erro) {
        console.error("Erro no checkout:", erro);
        if (typeof exibirMensagem === 'function') exibirMensagem("Erro ao comunicar com a API.", "erro");
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
};

function feedbackCompra(botao, idProduto) {
    const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
    if (!user) {
        if (typeof exibirMensagem === 'function') exibirMensagem("Inicie sessão para comprar", "aviso");
        navegar('login');
        return;
    }

    adicionarAoCarrinho(idProduto);
    const textoOriginal = botao.innerHTML;
    
    botao.innerHTML = "✓ Adicionado";
    botao.style.backgroundColor = "#15803d"; 
    botao.style.color = "#ffffff";
    botao.style.pointerEvents = "none";
    
    setTimeout(() => {
        botao.innerHTML = textoOriginal;
        botao.style.backgroundColor = "";
        botao.style.color = "";
        botao.style.pointerEvents = "auto";
    }, 1500);
}

// Fallback de notificações (6 segundos)
window.exibirMensagem = function(msg, tipo = 'sucesso') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    let icone = tipo === 'sucesso' ? '✓' : (tipo === 'erro' ? '✕' : '⚠');
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `<strong>${icone}</strong> <div>${msg}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease-out';
        toast.style.opacity = '0';
        setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    }, 6000);
};
