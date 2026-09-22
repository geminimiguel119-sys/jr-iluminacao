<?php
// TCC_V2/api/telegram-bot.php
header('Content-Type: application/json; charset=utf-8');

$token = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
$chatIdAutorizado = "5034813131";

$conteudo = file_get_contents("php://input");
$update = json_decode($conteudo, true);

if (!$update || !isset($update['message'])) {
    exit;
}

$chatId = $update['message']['chat']['id'];
$texto = trim($update['message']['text'] ?? '');

// Trava de segurança: apenas o administrador executa comandos
if ((string)$chatId !== (string)$chatIdAutorizado) {
    enviarMensagem($chatId, "⛔ Acesso negado. Bot restrito à administração.", $token);
    exit;
}

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
    enviarMensagem($chatId, "⚠️ Erro de conexão com a base de dados.", $token);
    exit;
}

$partes = explode(' ', $texto);
$comando = strtolower($partes[0]);

switch ($comando) {
    case '/start':
    case '/ajuda':
        $resposta = "💡 <b>JR Iluminação - Comandos Admin</b>\n\n";
        $resposta .= "📊 /resumo - Métricas gerais da loja\n";
        $resposta .= "⏳ /pendentes - Clientes aguardando aprovação\n";
        $resposta .= "✅ /aprovar [id] - Aprovar conta por ID (Ex: <code>/aprovar 12</code>)\n";
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
        $resposta .= "👥 <b>Clientes:</b> {$clientes['total']}";
        enviarMensagem($chatId, $resposta, $token);
        break;

    case '/pendentes':
        $stmt = $pdo->query("SELECT id, nome, email FROM usuarios WHERE status = 'Pendente' AND role = 'cliente' ORDER BY id ASC");
        $pendentes = $stmt->fetchAll();

        if (empty($pendentes)) {
            enviarMensagem($chatId, "✅ Não existem contas pendentes no momento.", $token);
        } else {
            $resposta = "⏳ <b>Contas Pendentes de Aprovação:</b>\n\n";
            foreach ($pendentes as $p) {
                $resposta .= "🆔 <b>ID:</b> {$p['id']}\n";
                $resposta .= "👤 <b>Nome:</b> {$p['nome']}\n";
                $resposta .= "📧 <b>E-mail:</b> {$p['email']}\n";
                $resposta .= "👉 Comando: <code>/aprovar {$p['id']}</code>\n\n";
            }
            enviarMensagem($chatId, $resposta, $token);
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
        enviarMensagem($chatId, "Comando não reconhecido. Envie /ajuda para ver as opções.", $token);
        break;
}

function enviarMensagem($chatId, $texto, $token) {
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $dados = [
        'chat_id' => $chatId,
        'text' => $texto,
        'parse_mode' => 'HTML'
    ];
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
