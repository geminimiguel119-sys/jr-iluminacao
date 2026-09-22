<?php
// api/registro.php
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

if (empty($nome) || empty($email) || empty($senha)) erro('Preencha todos os campos.', 400);

try {
    $pdo->beginTransaction();
    
    $stmtCheck = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmtCheck->execute([$email]);
    if ($stmtCheck->fetch()) throw new Exception("E-mail já cadastrado.");

    // Clientes comuns iniciam como Pendentes
    $status = ($role === 'admin') ? 'Aprovado' : 'Pendente';

    $stmtUser = $pdo->prepare("INSERT INTO usuarios (nome, email, role, status) VALUES (?, ?, ?, ?) RETURNING id");
    $stmtUser->execute([$nome, $email, $role, $status]);
    $usuario_id = $stmtUser->fetchColumn();

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $stmtAuth = $pdo->prepare("INSERT INTO autenticacao (usuario_id, senha) VALUES (?, ?)");
    $stmtAuth->execute([$usuario_id, $senhaHash]);
    
    // Cadastra também na tabela de clientes
    $stmtCli = $pdo->prepare("INSERT INTO clientes (nome, email) VALUES (?, ?)");
    $stmtCli->execute([$nome, $email]);

    $pdo->commit();

    // ==========================================
    // INTEGRAÇÃO OFICIAL DO TELEGRAM (JR ILUMINAÇÃO)
    // ==========================================
    $telegramToken = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
    $telegramChatId = "5034813131";

    $msg = "🚨 *Novo Cliente Registado!*\n\n";
    $msg .= "👤 *Nome:* {$nome}\n";
    $msg .= "📧 *E-mail:* {$email}\n";
    $msg .= "📌 *Status:* Pendente de aprovação no Painel.";

    $urlTG = "https://api.telegram.org/bot{$telegramToken}/sendMessage?chat_id={$telegramChatId}&parse_mode=Markdown&text=" . urlencode($msg);
    @file_get_contents($urlTG);

    sucesso("Conta criada com sucesso! O seu registo está em análise. Aguarde a aprovação do administrador para efetuar o login.");
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    erro($e->getMessage(), 400);
}
?>
