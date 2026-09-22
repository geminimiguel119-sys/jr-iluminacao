<?php
// api/registro.php
require_once 'config.php';
require_once 'conexao.php';

// Fuso Horário do Brasil para garantir a data/hora correta (Teste 4)
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

    // Define clientes comuns como Pendentes
    $status = ($role === 'admin') ? 'Aprovado' : 'Pendente';

    $stmtUser = $pdo->prepare("INSERT INTO usuarios (nome, email, role, status) VALUES (?, ?, ?, ?) RETURNING id");
    $stmtUser->execute([$nome, $email, $role, $status]);
    $usuario_id = $stmtUser->fetchColumn();

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $stmtAuth = $pdo->prepare("INSERT INTO autenticacao (usuario_id, senha) VALUES (?, ?)");
    $stmtAuth->execute([$usuario_id, $senhaHash]);
    
    $pdo->commit();

    // ==========================================
    // INTEGRAÇÃO COM TELEGRAM (Notifica o Administrador)
    // Substitua os valores de Token e Chat_ID pelos seus dados do bot.
    // ==========================================
    $telegramToken = "SEU_TOKEN_TELEGRAM_AQUI"; 
    $telegramChatId = "SEU_CHAT_ID_AQUI";       

    if (!empty($telegramToken) && $telegramToken !== "SEU_TOKEN_TELEGRAM_AQUI") {
        $mensagemTG = "🚨 *Novo Registo de Cliente*\n\n";
        $mensagemTG .= "👤 Nome: {$nome}\n";
        $mensagemTG .= "📧 E-mail: {$email}\n";
        $mensagemTG .= "📌 Status: A aguardar aprovação no painel.";
        
        $urlTG = "https://api.telegram.org/bot{$telegramToken}/sendMessage?chat_id={$telegramChatId}&parse_mode=Markdown&text=" . urlencode($mensagemTG);
        
        // Dispara de forma silenciosa para não atrasar a requisição
        @file_get_contents($urlTG);
    }

    // TESTE 1: Mensagem correta retornada ao cliente
    sucesso("Conta criada com sucesso! A sua conta foi enviada para análise e será aprovada pelo administrador em breve.");
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    erro($e->getMessage(), 400);
}
?>
