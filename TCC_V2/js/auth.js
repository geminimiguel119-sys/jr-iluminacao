// ==========================================
// INTEGRAÇÃO SUPABASE & GOOGLE OAUTH
// ==========================================
const SUPABASE_URL = 'https://bfppcxnxqagpesuyjlhe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_idrD2ABOskkGike5BuOqPA_fMjbbw6y';

// Inicialização com storage local explícito para evitar bloqueios de navegador
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    }
}) : null;

// Disparado ao clicar no botão do Google
async function loginComGoogle() {
    if (!supabaseClient) {
        if (typeof exibirMensagem === 'function') {
            exibirMensagem('SDK do Supabase não foi carregado.', 'erro');
        } else {
            alert('SDK do Supabase não foi carregado.');
        }
        return;
    }

    const redirectUrl = window.location.origin + window.location.pathname;

    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: redirectUrl
        }
    });

    if (error) {
        if (typeof exibirMensagem === 'function') {
            exibirMensagem('Erro no login Google: ' + error.message, 'erro');
        } else {
            alert('Erro no login Google: ' + error.message);
        }
    }
}

// Escuta ativamente o retorno do login do Google
if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
            const user = session.user;
            const usuarioFormatado = {
                id: user.id,
                nome: user.user_metadata?.full_name || user.email.split('@')[0],
                email: user.email,
                role: 'cliente'
            };

            // Salva na chave nativa utilizada pela aplicação
            localStorage.setItem('jr_user', JSON.stringify(usuarioFormatado));

            if (typeof renderHeader === 'function') renderHeader();

            if (window.location.hash.includes('login') || window.location.hash.includes('access_token')) {
                window.location.hash = ''; // Limpa os parâmetros de hash da URL
                if (typeof navegar === 'function') navegar('home');
            }
        }
    });
}

// Login tradicional (E-mail e Senha)
async function realizarLogin(event) {
    if (event) event.preventDefault();
    const emailInput = document.getElementById('login-email');
    const senhaInput = document.getElementById('login-senha');

    if (!emailInput || !senhaInput) return;

    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    
    if (!email || !senha) {
        if (typeof exibirMensagem === 'function') exibirMensagem('Preencha e-mail e senha.', 'erro');
        return;
    }
    
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Autenticando...");
    try {
        const res = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await res.json();
        
        if (data.sucesso) {
            const user = { 
                id: data.dados.id, 
                nome: data.dados.nome, 
                email: data.dados.email, 
                role: data.dados.role 
            };
            localStorage.setItem('jr_user', JSON.stringify(user));
            
            if (typeof exibirMensagem === 'function') exibirMensagem(`Bem-vindo, ${user.nome.split(' ')[0]}!`);
            if (typeof renderHeader === 'function') renderHeader();
            if (typeof navegar === 'function') navegar(user.role === 'admin' ? 'admin/dashboard' : 'home');
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem(data.mensagem || 'Credenciais inválidas.', 'erro');
        }
    } catch(e) {
        if (typeof exibirMensagem === 'function') exibirMensagem('Erro de conexão ao servidor.', 'erro');
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
}

async function fazerLogout() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    localStorage.removeItem('jr_user');
    if (typeof exibirMensagem === 'function') exibirMensagem('Sessão encerrada com segurança.');
    if (typeof renderHeader === 'function') renderHeader();
    if (typeof navegar === 'function') navegar('home');
}
