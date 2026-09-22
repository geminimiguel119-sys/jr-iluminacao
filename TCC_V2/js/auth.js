// ==========================================
// INTEGRAÇÃO SUPABASE & GOOGLE OAUTH E SEGURANÇA
// ==========================================

// OBS 2: Injetor Dinâmico do SweetAlert2 (Mensagens Estilizadas)
if (!document.getElementById('swal-script')) {
    const script = document.createElement('script');
    script.id = 'swal-script';
    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
    document.head.appendChild(script);
}

// Função Auxiliar de Alertas Bonitos
function mostrarAlertaModerno(titulo, texto, icone) {
    if (typeof Swal !== 'undefined') {
        return Swal.fire({ title: titulo, text: texto, icon: icone, confirmButtonColor: '#0284c7' });
    } else {
        alert(titulo + "\n" + texto);
        return Promise.resolve();
    }
}

const SUPABASE_URL = 'https://bfppcxnxqagpesuyjlhe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_idrD2ABOskkGike5BuOqPA_fMjbbw6y';

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: window.localStorage }
}) : null;

async function loginComGoogle() {
    if (!supabaseClient) return mostrarAlertaModerno('Erro', 'SDK do Supabase não carregado.', 'error');
    const redirectUrl = window.location.origin + window.location.pathname;
    const { error } = await supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: redirectUrl } });
    if (error) mostrarAlertaModerno('Aviso', 'Erro no login Google: ' + error.message, 'error');
}

if (supabaseClient) {
    supabaseClient.auth.onAuthStateChange(async (event, session) => {
        if (session && session.user) {
            const user = session.user;
            const usuarioFormatado = { id: user.id, nome: user.user_metadata?.full_name || user.email.split('@')[0], email: user.email, role: 'cliente' };
            localStorage.setItem('jr_user', JSON.stringify(usuarioFormatado));

            await mostrarAlertaModerno('Acesso Confirmado!', `Bem-vindo(a) de volta, ${usuarioFormatado.nome}.\nA sua sessão foi iniciada.`, 'success');

            if (typeof renderHeader === 'function') renderHeader();
            if (window.location.hash.includes('login') || window.location.hash.includes('access_token')) {
                window.location.hash = ''; 
                if (typeof navegar === 'function') navegar('home');
            }
        }
    });
}

// Login tradicional
async function realizarLogin(event) {
    if (event) event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const senha = document.getElementById('login-senha').value;
    
    if (!email || !senha) return mostrarAlertaModerno('Atenção', 'Preencha e-mail e senha.', 'warning');
    
    if (typeof mostrarLoading === 'function') mostrarLoading(true, "Autenticando...");
    try {
        const res = await fetch('api/login.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, senha })
        });
        const data = await res.json();
        
        if (data.sucesso) {
            const user = { id: data.dados.id, nome: data.dados.nome, email: data.dados.email, role: data.dados.role };
            localStorage.setItem('jr_user', JSON.stringify(user));
            
            await mostrarAlertaModerno('Acesso Confirmado!', `Bem-vindo(a) de volta, ${user.nome}.`, 'success');
            
            if (typeof renderHeader === 'function') renderHeader();
            if (typeof navegar === 'function') navegar(user.role === 'admin' ? 'admin/dashboard' : 'home');
        } else {
            mostrarAlertaModerno('Erro de Acesso', data.erro || data.mensagem, 'error');
        }
    } catch(e) {
        mostrarAlertaModerno('Erro', 'Erro de conexão ao servidor.', 'error');
    } finally {
        if (typeof mostrarLoading === 'function') mostrarLoading(false);
    }
}

async function fazerLogout() {
    if (supabaseClient) await supabaseClient.auth.signOut();
    localStorage.removeItem('jr_user');
    
    await mostrarAlertaModerno('Desconectado', 'Sessão encerrada com segurança.', 'info');
    
    if (typeof renderHeader === 'function') renderHeader();
    if (typeof navegar === 'function') navegar('home');
}

// VALIDAÇÃO NO CHECKOUT (Modernizada)
async function validarFinalizacaoCompra() {
    const userStr = localStorage.getItem('jr_user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user) {
        await mostrarAlertaModerno('Segurança JR', 'É obrigatório iniciar sessão (fazer login) para finalizar a compra.', 'warning');
        if (typeof navegar === 'function') navegar('login');
        return false;
    }
    
    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            title: '🔐 Verificação de Segurança',
            html: `Confirmar pedido no nome de:<br><b>👤 ${user.nome}</b><br><b>✉️ ${user.email}</b>?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#15803d',
            cancelButtonColor: '#dc2626',
            confirmButtonText: 'Sim, Confirmar',
            cancelButtonText: 'Cancelar'
        });
        return result.isConfirmed;
    } else {
        return confirm(`Confirmar a finalização deste pedido para: ${user.nome}?`);
    }
}
