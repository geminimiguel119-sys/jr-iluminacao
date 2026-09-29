<?php
// TCC_V2/api/telegram-bot.php
header('Content-Type: application/json; charset=utf-8');

$token = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
$chatIdAutorizado = "5034813131";

$conteudo = file_get_contents("php://input");
$update = json_decode($conteudo, true);

if (!$update) {
    exit;
}

// Conexão com o Supabase PostgreSQL
$host = 'aws-0-us-west-2.pooler.supabase.com';
$port = '5432';
$dbName = 'postgres';
$usuario = 'postgres.bfppcxnxqagpesuyjlhe';
$senha = 'An1bal_19691910@';

try {
    $pdo = new PDO("pgsql:host={$host};port={$port};dbname={$dbName};sslmode=require", $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    $pdo->exec("SET TIME ZONE 'America/Sao_Paulo'");
} catch (PDOException $e) {
    exit;
}

// ==========================================
// 1. TRATAMENTO DE CLIQUES EM BOTÕES INLINE (CALLBACK QUERY)
// ==========================================
if (isset($update['callback_query'])) {
    $callback = $update['callback_query'];
    $callbackId = $callback['id'];
    $chatId = $callback['message']['chat']['id'];
    $messageId = $callback['message']['message_id'];
    $dados = $callback['data'];

    // Trava de segurança: apenas o administrador pode clicar nos botões
    if ((string)$chatId !== (string)$chatIdAutorizado) {
        responderAlertaCallback($callbackId, "⛔ Acesso negado à administração.", $token);
        exit;
    }

    if (strpos($dados, 'aprovar_') === 0) {
        $idAlvo = intval(str_replace('aprovar_', '', $dados));
        
        $stmt = $pdo->prepare("SELECT nome, email, status FROM usuarios WHERE id = ?");
        $stmt->execute([$idAlvo]);
        $user = $stmt->fetch();

        if ($user) {
            $pdo->prepare("UPDATE usuarios SET status = 'Aprovado' WHERE id = ?")->execute([$idAlvo]);
            
            $novoTexto = "✅ <b>Conta Aprovada com Sucesso!</b>\n\n";
            $novoTexto .= "👤 <b>Nome:</b> {$user['nome']}\n";
            $novoTexto .= "📧 <b>E-mail:</b> {$user['email']}\n";
            $novoTexto .= "🔓 <i>Acesso desbloqueado via Botão Interativo.</i>";
            
            editarMensagem($chatId, $messageId, $novoTexto, $token);
            responderAlertaCallback($callbackId, "Conta #{$idAlvo} aprovada!", $token);
        } else {
            responderAlertaCallback($callbackId, "Utilizador não encontrado.", $token);
        }
    } 
    elseif (strpos($dados, 'recusar_') === 0) {
        $idAlvo = intval(str_replace('recusar_', '', $dados));
        
        $stmt = $pdo->prepare("SELECT nome FROM usuarios WHERE id = ?");
        $stmt->execute([$idAlvo]);
        $user = $stmt->fetch();

        if ($user) {
            $pdo->prepare("UPDATE usuarios SET status = 'Recusado' WHERE id = ?")->execute([$idAlvo]);
            
            $novoTexto = "❌ <b>Acesso Recusado</b>\n\n";
            $novoTexto .= "👤 <b>Nome:</b> {$user['nome']} (ID: {$idAlvo})\n";
            $novoTexto .= "🔒 <i>O cadastro foi reprovado pela gerência.</i>";
            
            editarMensagem($chatId, $messageId, $novoTexto, $token);
            responderAlertaCallback($callbackId, "Conta #{$idAlvo} recusada.", $token);
        }
    }
    exit;
}

// ==========================================
// 2. PROCESSAMENTO DE COMANDOS DE TEXTO
// ==========================================
if (!isset($update['message'])) {
    exit;
}

$chatId = $update['message']['chat']['id'];
$texto = trim($update['message']['text'] ?? '');

// Trava de segurança: apenas o administrador executa comandos
if ((string)$chatId !== (string)$chatIdAutorizado) {
    enviarMensagem($chatId, "⛔ Acesso negado. Bot restrito à administração.", $token);
    exit;
}

$partes = explode(' ', $texto);
$comando = strtolower($partes[0]);

switch ($comando) {
    case '/start':
    case '/ajuda':
        $resposta = "💡 <b>JR Iluminação - Comandos Admin</b>\n\n";
        $resposta .= "📊 /resumo - Métricas e faturamento da loja\n";
        $resposta .= "⏳ /pendentes - Clientes aguardando aprovação (com botões)\n";
        $resposta .= "⚠️ /criticos - Alerta de produtos com baixo estoque\n";
        $resposta .= "✅ /aprovar [id] - Aprovar conta por ID via texto\n";
        enviarMensagem($chatId, $resposta, $token);
        break;

    case '/resumo':
        $pedidos = $pdo->query("SELECT COUNT(id) as total, COALESCE(SUM(total), 0) as fat FROM pedidos")->fetch();
        $estoque = $pdo->query("SELECT COALESCE(SUM(quantidade), 0) as total FROM produtos")->fetch();
        $clientes = $pdo->query("SELECT COUNT(id) as total FROM usuarios WHERE role = 'cliente'")->fetch();

        $faturacao = number_format($pedidos['fat'], 2, ',', '.');
        $resposta = "📊 <b>Resumo da Loja em Tempo Real</b>\n\n";
        $resposta .= "💰 <b>Faturação:</b> R$ {$faturacao}\n";
        $resposta .= "🛒 <b>Total Pedidos:</b> {$pedidos['total']}\n";
        $resposta .= "📦 <b>Estoque Total:</b> {$estoque['total']} un.\n";
        $resposta .= "👥 <b>Clientes Registados:</b> {$clientes['total']}";
        enviarMensagem($chatId, $resposta, $token);
        break;

    case '/pendentes':
        $stmt = $pdo->query("SELECT id, nome, email FROM usuarios WHERE status = 'Pendente' AND role = 'cliente' ORDER BY id ASC");
        $pendentes = $stmt->fetchAll();

        if (empty($pendentes)) {
            enviarMensagem($chatId, "✅ Não existem contas pendentes no momento.", $token);
        } else {
            foreach ($pendentes as $p) {
                $msgIndividual = "⏳ <b>Novo Cadastro Pendente</b>\n\n";
                $msgIndividual .= "🆔 <b>ID:</b> {$p['id']}\n";
                $msgIndividual .= "👤 <b>Nome:</b> {$p['nome']}\n";
                $msgIndividual .= "📧 <b>E-mail:</b> {$p['email']}";
                
                $teclado = [
                    'inline_keyboard' => [
                        [
                            ['text' => '✅ Aprovar', 'callback_data' => 'aprovar_' . $p['id']],
                            ['text' => '❌ Recusar', 'callback_data' => 'recusar_' . $p['id']]
                        ]
                    ]
                ];
                
                enviarMensagemComBotoes($chatId, $msgIndividual, $teclado, $token);
            }
        }
        break;

    case '/criticos':
        $stmt = $pdo->query("SELECT id, nome, quantidade FROM produtos WHERE quantidade <= 5 ORDER BY quantidade ASC");
        $criticos = $stmt->fetchAll();

        if (empty($criticos)) {
            enviarMensagem($chatId, "✅ <b>Estoque Saudável!</b> Todos os produtos possuem mais de 5 unidades.", $token);
        } else {
            $msg = "⚠️ <b>Alerta Preditivo: Estoque Crítico (<= 5 un.)</b>\n\n";
            foreach ($criticos as $item) {
                $msg .= "• <b>{$item['nome']}</b>: {$item['quantidade']} un. restantes\n";
            }
            $msg .= "\n<i>Sugestão: Realizar reposição com fornecedores.</i>";
            enviarMensagem($chatId, $msg, $token);
        }
        break;

    case '/aprovar':
        $idAlvo = isset($partes[1]) ? intval($partes[1]) : 0;
        if ($idAlvo <= 0) {
            enviarMensagem($chatId, "⚠️ Envie: <code>/aprovar [ID]</code>", $token);
            break;
        }

        $stmtVerifica = $pdo->prepare("SELECT nome, email, status FROM usuarios WHERE id = ?");
        $stmtVerifica->execute([$idAlvo]);
        $user = $stmtVerifica->fetch();

        if (!$user) {
            enviarMensagem($chatId, "❌ Utilizador ID {$idAlvo} não encontrado.", $token);
        } elseif ($user['status'] === 'Aprovado') {
            enviarMensagem($chatId, "ℹ️ O utilizador <b>{$user['nome']}</b> já está aprovado.", $token);
        } else {
            $pdo->prepare("UPDATE usuarios SET status = 'Aprovado' WHERE id = ?")->execute([$idAlvo]);
            enviarMensagem($chatId, "✅ <b>Conta Aprovada via Telegram!</b>\n\n👤 <b>Nome:</b> {$user['nome']}\n📧 <b>E-mail:</b> {$user['email']}\n🔓 Acesso autorizado.", $token);
        }
        break;

    default:
        enviarMensagem($chatId, "Comando não reconhecido. Envie /ajuda para consultar as opções.", $token);
        break;
}

// ==========================================
// FUNÇÕES AUXILIARES DA API DO TELEGRAM
// ==========================================
function enviarMensagem($chatId, $texto, $token) {
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $dados = [
        'chat_id' => $chatId,
        'text' => $texto,
        'parse_mode' => 'HTML'
    ];
    chamarApiTelegram($url, $dados);
}

function enviarMensagemComBotoes($chatId, $texto, $teclado, $token) {
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $dados = [
        'chat_id' => $chatId,
        'text' => $texto,
        'parse_mode' => 'HTML',
        'reply_markup' => json_encode($teclado)
    ];
    chamarApiTelegram($url, $dados);
}

function editarMensagem($chatId, $messageId, $novoTexto, $token) {
    $url = "https://api.telegram.org/bot{$token}/editMessageText";
    $dados = [
        'chat_id' => $chatId,
        'message_id' => $messageId,
        'text' => $novoTexto,
        'parse_mode' => 'HTML'
    ];
    chamarApiTelegram($url, $dados);
}

function responderAlertaCallback($callbackId, $texto, $token) {
    $url = "https://api.telegram.org/bot{$token}/answerCallbackQuery";
    $dados = [
        'callback_query_id' => $callbackId,
        'text' => $texto,
        'show_alert' => false
    ];
    chamarApiTelegram($url, $dados);
}

function chamarApiTelegram($url, $dados) {
    $opcoes = [
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query($dados),
            'timeout' => 4
        ]
    ];
    @file_get_contents($url, false, stream_context_create($opcoes));
}
