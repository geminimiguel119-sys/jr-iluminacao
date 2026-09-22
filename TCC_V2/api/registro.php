<?php
// api/registro.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';
require_once 'conexao.php';

// Fuso Horário de Brasília
$pdo->exec("SET TIME ZONE 'America/Sao_Paulo'");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') erro("Método não permitido", 405);

$dados = json_decode(file_get_contents("php://input"), true) ?: $_POST;
$nome = sanitizar($dados['nome'] ?? '');
$email = sanitizar($dados['email'] ?? '');
$senha = $dados['senha'] ?? '';
$role = isset($dados['role']) && $dados['role'] === 'admin' ? 'admin' : 'cliente';

if (empty($nome) || empty($email) || empty($senha)) {
    erro('Preencha todos os campos obrigatórios.', 400);
}

try {
    $pdo->beginTransaction();
    
    // Verifica se já existe utilizador com este e-mail
    $stmtCheck = $pdo->prepare("SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?)");
    $stmtCheck->execute([$email]);
    if ($stmtCheck->fetch()) {
        throw new Exception("Este e-mail já se encontra registado no sistema.");
    }

    // Define clientes comuns como Pendentes
    $status = ($role === 'admin') ? 'Aprovado' : 'Pendente';

    // Insere utilizador na tabela de acessos
    $stmtUser = $pdo->prepare("INSERT INTO usuarios (nome, email, role, status) VALUES (?, ?, ?, ?) RETURNING id");
    $stmtUser->execute([$nome, $email, $role, $status]);
    $usuario_id = $stmtUser->fetchColumn();

    // Cria a hash de autenticação
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $stmtAuth = $pdo->prepare("INSERT INTO autenticacao (usuario_id, senha) VALUES (?, ?)");
    $stmtAuth->execute([$usuario_id, $senhaHash]);
    
    // Regista o cliente de forma compatível
    try {
        $stmtCliCheck = $pdo->prepare("SELECT id FROM clientes WHERE LOWER(email) = LOWER(?)");
        $stmtCliCheck->execute([$email]);
        if (!$stmtCliCheck->fetch()) {
            $stmtCli = $pdo->prepare("INSERT INTO clientes (nome, email) VALUES (?, ?)");
            $stmtCli->execute([$nome, $email]);
        }
    } catch (Exception $eCli) {
        // Ignora caso a tabela clientes tenha campos extras não preenchidos
    }

    $pdo->commit();

    // ==========================================
    // NOTIFICAÇÃO TELEGRAM
    // ==========================================
    $telegramToken = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
    $telegramChatId = "5034813131";

    if (!empty($telegramToken)) {
        $msg = "🚨 *Novo Cliente Registado!*\n\n";
        $msg .= "👤 *Nome:* " . str_replace(['_', '*', '['], '', $nome) . "\n";
        $msg .= "📧 *E-mail:* " . str_replace(['_', '*', '['], '', $email) . "\n";
        $msg .= "📌 *Status:* Pendente de aprovação.";

        $urlTG = "https://api.telegram.org/bot{$telegramToken}/sendMessage";
        
        $opcoesContexto = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query([
                    'chat_id'    => $telegramChatId,
                    'text'       => $msg,
                    'parse_mode' => 'Markdown'
                ]),
                'timeout' => 4
            ]
        ];
        @file_get_contents($urlTG, false, stream_context_create($opcoesContexto));
    }

    sucesso("Conta criada com sucesso! O seu registo está em análise. Aguarde a aprovação do administrador para efetuar o login.");

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    erro($e->getMessage(), 400);
}
?>
