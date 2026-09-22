<?php
// api/login.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = 'aws-0-us-west-2.pooler.supabase.com';
$port = '5432';
$dbName = 'postgres';
$usuario = 'postgres.bfppcxnxqagpesuyjlhe';
$senha = 'An1bal_19691910@';

// Telegram Bot Credentials
$telegramToken = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
$telegramChatId = "5034813131";

function notificarTelegramGoogle($nome, $email, $token, $chatId) {
    try {
        $msg = "🔔 <b>Novo Cadastro via Google!</b>\n\n";
        $msg .= "👤 <b>Nome:</b> " . htmlspecialchars($nome) . "\n";
        $msg .= "📧 <b>E-mail:</b> " . htmlspecialchars($email) . "\n";
        $msg .= "⏳ <i>Aguardando aprovação no painel admin.</i>";

        $url = "https://api.telegram.org/bot{$token}/sendMessage";
        $postData = http_build_query([
            'chat_id' => $chatId,
            'text' => $msg,
            'parse_mode' => 'HTML'
        ]);

        $opts = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                'content' => $postData,
                'timeout' => 4
            ]
        ];
        $context = stream_context_create($opts);
        @file_get_contents($url, false, $context);
    } catch (Exception $e) {
        // Silencia falha do webhook externo para não travar a API
    }
}

try {
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbName};sslmode=require";
    $pdo = new PDO($dsn, $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 10
    ]);
    
    // Fuso Horário de Brasília
    $pdo->exec("SET TIME ZONE 'America/Sao_Paulo'");
    
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha na conexão: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $tipo = $dados['tipo'] ?? 'tradicional';

    // ==========================================
    // FLUXO GOOGLE OAUTH
    // ==========================================
    if ($tipo === 'google') {
        $email = trim($dados['email'] ?? '');
        $nome = trim($dados['nome'] ?? '');

        if (empty($email)) {
            echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail do Google não informado.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        try {
            $stmt = $pdo->prepare("SELECT id, nome, email, role, status FROM usuarios WHERE LOWER(email) = LOWER(?)");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // 1. Se for primeiro acesso via Google: cria na tabela usuarios com status Pendente
            if (!$user) {
                $stmtIns = $pdo->prepare("INSERT INTO usuarios (nome, email, role, status) VALUES (?, ?, 'cliente', 'Pendente') RETURNING id, nome, email, role, status");
                $stmtIns->execute([$nome, $email]);
                $user = $stmtIns->fetch(PDO::FETCH_ASSOC);

                // Cria o registro na autenticacao para vincular ID
                $pdo->prepare("INSERT INTO autenticacao (usuario_id, senha, ultimo_login) VALUES (?, 'OAUTH_GOOGLE', CURRENT_TIMESTAMP) ON CONFLICT (usuario_id) DO NOTHING")->execute([$user['id']]);

                // Notifica no Telegram
                notificarTelegramGoogle($nome, $email, $telegramToken, $telegramChatId);

                echo json_encode([
                    'sucesso' => false,
                    'pendente' => true,
                    'mensagem' => 'A sua conta criada via Google aguarda aprovação da administração.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // 2. Se a conta já existe mas o admin ainda não aprovou
            if ($user['role'] !== 'admin' && ($user['status'] ?? 'Pendente') === 'Pendente') {
                echo json_encode([
                    'sucesso' => false,
                    'pendente' => true,
                    'mensagem' => 'A sua conta cadastrada com Google está em análise. Aguarde a aprovação do administrador para aceder à loja.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // 3. Usuário aprovado
            $pdo->prepare("INSERT INTO autenticacao (usuario_id, senha, ultimo_login) VALUES (?, 'OAUTH_GOOGLE', CURRENT_TIMESTAMP) ON CONFLICT (usuario_id) DO UPDATE SET ultimo_login = CURRENT_TIMESTAMP")->execute([$user['id']]);

            echo json_encode(['sucesso' => true, 'dados' => $user], JSON_UNESCAPED_UNICODE);
            exit;

        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => 'Erro na validação Google: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // ==========================================
    // FLUXO LOGIN TRADICIONAL
    // ==========================================
    $email = trim($dados['email'] ?? '');
    $senhaInput = $dados['senha'] ?? '';

    if (empty($email) || empty($senhaInput)) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail ou senha ausentes.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT u.id, u.nome, u.email, u.role, u.status, a.senha 
                               FROM usuarios u 
                               JOIN autenticacao a ON u.id = a.usuario_id 
                               WHERE LOWER(u.email) = LOWER(?)");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($senhaInput, $user['senha'])) {
            
            if ($user['role'] !== 'admin' && $user['status'] === 'Pendente') {
                echo json_encode(['sucesso' => false, 'mensagem' => 'A sua conta está em análise. Aguarde a aprovação do administrador para aceder à loja.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $updateStmt = $pdo->prepare("UPDATE autenticacao SET ultimo_login = CURRENT_TIMESTAMP WHERE usuario_id = ?");
            $updateStmt->execute([$user['id']]);

            unset($user['senha']); 
            echo json_encode(['sucesso' => true, 'dados' => $user], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail ou senha incorretos.'], JSON_UNESCAPED_UNICODE);
        }
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => 'Erro na consulta: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}
?>
