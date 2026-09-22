<?php
// api/clientes.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';
require_once 'conexao.php';
$pdo->exec("SET TIME ZONE 'America/Sao_Paulo'");

$telegramToken = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
$telegramChatId = "5034813131";

function notificarTelegram($msg, $token, $chatId) {
    if (empty($token)) return;
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query([
                'chat_id'    => $chatId,
                'text'       => $msg,
                'parse_mode' => 'Markdown'
            ]),
            'timeout' => 4
        ]
    ]);
    @file_get_contents($url, false, $context);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("
        SELECT u.id, u.nome, u.email, u.role, u.status, 
               COALESCE(TO_CHAR(a.ultimo_login, 'DD/MM/YYYY HH24:MI'), 'Sem Registo') as ultimo_login 
        FROM usuarios u 
        LEFT JOIN autenticacao a ON a.usuario_id = u.id 
        ORDER BY u.id DESC
    ");
    echo json_encode(['sucesso' => true, 'dados' => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true);
    $acao = $dados['acao'] ?? '';
    
    if ($acao === 'aprovar') {
        $id = intval($dados['id'] ?? 0);
        $stmtUser = $pdo->prepare("SELECT nome, email FROM usuarios WHERE id = ?");
        $stmtUser->execute([$id]);
        $u = $stmtUser->fetch(PDO::FETCH_ASSOC);

        $stmt = $pdo->prepare("UPDATE usuarios SET status = 'Aprovado' WHERE id = ?");
        $stmt->execute([$id]);

        if ($u) {
            $msg = "✅ *Conta Aprovada com Sucesso!*\n\n";
            $msg .= "👤 *Cliente:* {$u['nome']}\n";
            $msg .= "📧 *E-mail:* {$u['email']}\n";
            $msg .= "🔓 O cliente já possui autorização total para aceder à loja.";
            notificarTelegram($msg, $telegramToken, $telegramChatId);
        }

        echo json_encode(['sucesso' => true], JSON_UNESCAPED_UNICODE);
    } elseif ($acao === 'salvar') {
        $id = $dados['id'] ?? null;
        $nome = sanitizar($dados['nome']);
        $email = sanitizar($dados['email']);
        $role = sanitizar($dados['role']);
        if ($id) {
            $stmt = $pdo->prepare("UPDATE usuarios SET nome=?, email=?, role=? WHERE id=?");
            $stmt->execute([$nome, $email, $role, $id]);
        }
        echo json_encode(['sucesso' => true], JSON_UNESCAPED_UNICODE);
    } elseif ($acao === 'excluir') {
        $id = intval($dados['id'] ?? 0);
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(['sucesso' => true], JSON_UNESCAPED_UNICODE);
    }
}
?>
