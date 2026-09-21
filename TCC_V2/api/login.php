<?php
// api/login.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$host = "db.bfppcxnxqagpesuyjlhe.supabase.co";
$dbName = "postgres";
$usuario = "postgres";
$senha = "An1bal_19691910@";

try {
    $pdo = new PDO("pgsql:host=$host;port=5432;dbname=$dbName", $usuario, $senha, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha na ligação à base de dados.']);
    exit;
}

// Aceita requisições POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true);
    
    $email = $dados['email'] ?? '';
    $senhaInput = $dados['senha'] ?? '';

    if (empty($email) || empty($senhaInput)) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail ou senha ausentes.']);
        exit;
    }

    try {
        // AQUI ESTÁ O SEGREDO: Pedimos explicitamente o u.id na consulta
        $stmt = $pdo->prepare("SELECT u.id, u.nome, u.email, u.role, a.senha 
                               FROM usuarios u 
                               JOIN autenticacao a ON u.id = a.usuario_id 
                               WHERE u.email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Verifica se o utilizador existe e se a senha bate certo com a hash
        if ($user && password_verify($senhaInput, $user['senha'])) {
            // Remove a senha dos dados por segurança antes de enviar para o JavaScript
            unset($user['senha']);
            
            // Devolve os dados completos, incluindo o ID
            echo json_encode(['sucesso' => true, 'dados' => $user]);
        } else {
            echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail ou senha incorretos.']);
        }
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => 'Erro interno: ' . $e->getMessage()]);
    }
}
?>