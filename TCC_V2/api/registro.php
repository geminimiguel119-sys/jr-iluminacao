<?php
// api/registro.php
require_once 'config.php';
require_once 'conexao.php';

// Teste 4: Força o Fuso Horário de Brasília
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

    // Clientes comuns são bloqueados inicialmente
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
    // OBS 5: INTEGRAÇÃO COM TELEGRAM 
    // Substitua os dados abaixo pelo seu BotFather.
    // ==========================================
    $telegramToken = "SEU_TOKEN_AQUI"; 
    $telegramChatId = "SEU_CHAT_ID_AQUI";       

    if (!empty($telegramToken) && $telegramToken !== "SEU_TOKEN_AQUI") {
        $msg = "🚨 *Novo Cliente* \n👤 Nome: {$nome}\n📧 E-mail: {$email}\n📌 Status: Aguardando aprovação.";
        $urlTG = "https://api.telegram.org/bot{$telegramToken}/sendMessage?chat_id={$telegramChatId}&parse_mode=Markdown&text=" . urlencode($msg);
        @file_get_contents($urlTG);
    }

    // TESTE 1: Mensagem clara sobre aprovação
    sucesso("Conta criada com sucesso! O seu registo está em análise. Aguarde a aprovação do administrador para efetuar o login.");
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    erro($e->getMessage(), 400);
}
?>
