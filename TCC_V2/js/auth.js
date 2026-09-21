// ==========================================
// INTEGRAÇÃO SUPABASE & GOOGLE OAUTH
// ==========================================
const SUPABASE_URL = 'https://bfppcxnxqagpesuyjlhe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_idrD2ABOskkGike5BuOqPA_fMjbbw6y';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

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

// Verifica o retorno da autenticação ao recarregar a página
async function verificarRetornoGoogle() {
    if (!supabaseClient) return;

    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session && session.user) {
        const user = session.user;
        const usuarioFormatado = {
            id: user.id,
            nome: user.user_metadata.full_name || user.email.split('@')[0],
            email: user.email,
            role: 'cliente'
        };

        // Salva a sessão no formato nativo da loja
        localStorage.setItem('jr_user', JSON.stringify(usuarioFormatado));

        if (typeof renderHeader === 'function') renderHeader();

        if (window.location.hash.includes('login') || window.location.hash === '') {
            if (typeof navegar === 'function') navegar('home');
        }
    }
}

document.addEventListener('DOMContentLoaded', verificarRetornoGoogle);


async function realizarLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    
    if(!email || !senha) {
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
        
        if(data.sucesso) {
            // CORREÇÃO: Guardar o ID na memória para o carrinho poder usar
            const user = { 
                id: data.dados.id, 
                nome: data.dados.nome, 
                email: data.dados.email, 
                role: data.dados.role 
            };
            localStorage.setItem('jr_user', JSON.stringify(user));
            
            if (typeof exibirMensagem === 'function') exibirMensagem(`Bem-vindo, ${user.nome.split(' ')[0]}!`);
            renderHeader();
            navegar(user.role === 'admin' ? 'admin/dashboard' : 'home');
        } else {
            if (typeof exibirMensagem === 'function') exibirMensagem(data.mensagem || 'Credenciais inválidas.', 'erro');
        }
    } catch(e) {
        if (typeof exibirMensagem === 'function') exibirMensagem('Erro de conexão ao servidor.', 'erro');
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
}

function fazerLogout(){
    localStorage.removeItem('jr_user');
    exibirMensagem('Sessão encerrada com segurança.');
    renderHeader();
    navegar('home');
}