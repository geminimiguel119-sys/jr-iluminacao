function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(valor) || 0);
}

function escapeHtml(v) {
  return String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;'
  }[c]));
}

function checkSessao() {
  if (typeof renderHeader === 'function') renderHeader();
  const user = JSON.parse(localStorage.getItem('jr_user') || 'null');
  const last = localStorage.getItem('jr_last_page') || 'home';
  const params = JSON.parse(localStorage.getItem('jr_last_params') || '{}');
  if (typeof navegar === 'function') {
    navegar(user && typeof routes !== 'undefined' && routes[last] ? last : 'home', user ? params : {});
  }
}

async function apiFetch(url, options = {}) {
  if (typeof mostrarLoading === 'function') mostrarLoading(true, 'A processar...');
  
  // INJEÇÃO DO TOKEN DE SEGURANÇA (JWT)
  const token = localStorage.getItem('jr_token');
  if (token) {
      if (!options.headers) options.headers = {};
      options.headers['Authorization'] = 'Bearer ' + token;
  }
  
  try {
    const r = await fetch(url, options);
    const text = await r.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (jsonErr) {
      console.error("O servidor PHP não devolveu um JSON válido. Devolveu isto:", text);
      throw new Error("Erro de comunicação com o servidor. Verifique a Consola (F12).");
    }
    
    if (!r.ok) throw new Error(data.mensagem || data.erro || 'Erro na requisição');
    return data;
    
  } catch (err) {
    console.error("Erro na chamada apiFetch para", url, ":", err);
    if (typeof exibirMensagem === 'function') exibirMensagem(err.message, 'erro');
    throw err;
    
  } finally {
    if (typeof mostrarLoading === 'function') mostrarLoading(false);
  }
}
