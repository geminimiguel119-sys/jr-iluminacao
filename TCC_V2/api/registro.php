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

// ==========================================
// 1. VALIDAÇÃO DE DADOS (Prevenção de Erros e Ataques)
// ==========================================
if (empty($nome) || empty($email) || empty($senha)) {
    erro('Preencha todos os campos obrigatórios.', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    erro('Por favor, informe um e-mail válido.', 400);
}

if (strlen($senha) < 6) {
    erro('A senha deve ter no mínimo 6 caracteres por motivos de segurança.', 400);
}

try {
    // Inicia a transação. Se algo falhar, NADA é salvo no banco de dados.
    $pdo->beginTransaction();
    
    // ==========================================
    // 2. PREVENÇÃO DE CONTAS DUPLICADAS
    // ==========================================
    $stmtCheck = $pdo->prepare("SELECT id FROM usuarios WHERE LOWER(email) = LOWER(?)");
    $stmtCheck->execute([$email]);
    if ($stmtCheck->fetch()) {
        throw new Exception("Este e-mail já está cadastrado no sistema.");
    }

    // Define clientes comuns como Pendentes (Aprovação Manual)
    $status = ($role === 'admin') ? 'Aprovado' : 'Pendente';

    // Insere o usuário na tabela principal e retorna o ID gerado
    $stmtUser = $pdo->prepare("INSERT INTO usuarios (nome, email, role, status) VALUES (?, ?, ?, ?) RETURNING id");
    $stmtUser->execute([$nome, $email, $role, $status]);
    $usuario_id = $stmtUser->fetchColumn();

    // ==========================================
    // 3. CRIPTOGRAFIA DE SENHA (HASHING SEGURO - Bcrypt)
    // ==========================================
    // Nunca guardamos a senha em texto puro. O PASSWORD_DEFAULT utiliza o algoritmo Bcrypt moderno.
    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $stmtAuth = $pdo->prepare("INSERT INTO autenticacao (usuario_id, senha) VALUES (?, ?)");
    $stmtAuth->execute([$usuario_id, $senhaHash]);
    
    // Insere o registro na tabela clientes, mantendo o histórico de compras compatível
    try {
        $stmtCliCheck = $pdo->prepare("SELECT id FROM clientes WHERE LOWER(email) = LOWER(?)");
        $stmtCliCheck->execute([$email]);
        if (!$stmtCliCheck->fetch()) {
            $stmtCli = $pdo->prepare("INSERT INTO clientes (nome, email) VALUES (?, ?)");
            $stmtCli->execute([$nome, $email]);
        }
    } catch (Exception $eCli) {
        // Ignora erros silentes caso a tabela clientes possua campos extras obrigatórios não passados aqui
    }

    // Efetiva todas as gravações no banco
    $pdo->commit();

    // ==========================================
    // 4. NOTIFICAÇÃO TELEGRAM COM BOTÕES (Aprovação Imediata)
    // ==========================================
    $telegramToken = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
    $telegramChatId = "5034813131";

    if (!empty($telegramToken)) {
        $msg = "🚨 <b>Novo Cliente Cadastrado!</b>\n\n";
        $msg .= "🆔 <b>ID:</b> {$usuario_id}\n";
        $msg .= "👤 <b>Nome:</b> " . htmlspecialchars($nome, ENT_QUOTES, 'UTF-8') . "\n";
        $msg .= "📧 <b>E-mail:</b> " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "\n";
        $msg .= "📌 <b>Status:</b> Pendente de aprovação.";

        // Teclado com botões clicáveis inline para o Admin aprovar direto pelo Telegram
        $teclado = [
            'inline_keyboard' => [
                [
                    ['text' => '✅ Aprovar', 'callback_data' => 'aprovar_' . $usuario_id],
                    ['text' => '❌ Recusar', 'callback_data' => 'recusar_' . $usuario_id]
                ]
            ]
        ];

        $urlTG = "https://api.telegram.org/bot{$telegramToken}/sendMessage";
        
        $opcoesContexto = [
            'http' => [
                'method'  => 'POST',
                'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
                'content' => http_build_query([
                    'chat_id'      => $telegramChatId,
                    'text'         => $msg,
                    'parse_mode'   => 'HTML',
                    'reply_markup' => json_encode($teclado)
                ]),
                'timeout' => 4 // Impede que o site trave se o Telegram estiver fora do ar
            ]
        ];
        @file_get_contents($urlTG, false, stream_context_create($opcoesContexto));
    }

    sucesso("Conta criada com sucesso! O seu cadastro está em análise. Aguarde a aprovação do administrador para fazer o login.");

} catch (Exception $e) {
    // Em caso de qualquer erro (ex: e-mail duplicado), desfaz tudo que tentou salvar (Rollback)
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    erro($e->getMessage(), 400);
}
?>
