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

// Configurações alinhadas com a região us-west-2 do Supabase
$host = 'aws-0-us-west-2.pooler.supabase.com';
$port = '5432';
$dbName = 'postgres';
$usuario = 'postgres.bfppcxnxqagpesuyjlhe';
$senha = 'An1bal_19691910@';

try {
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbName};sslmode=require";
    $pdo = new PDO($dsn, $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 10
    ]);
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha na conexão com o banco: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

// Aceita requisições POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    
    $email = trim($dados['email'] ?? '');
    $senhaInput = $dados['senha'] ?? '';

    if (empty($email) || empty($senhaInput)) {
        echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail ou senha ausentes.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $stmt = $pdo->prepare("SELECT u.id, u.nome, u.email, u.role, a.senha 
                               FROM usuarios u 
                               JOIN autenticacao a ON u.id = a.usuario_id 
                               WHERE LOWER(u.email) = LOWER(?)");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        // Valida se o utilizador existe e se a senha confere
        if ($user && password_verify($senhaInput, $user['senha'])) {
            
            // EXIGÊNCIA DO PROFESSOR: Atualizar a data/hora do último login
            $updateStmt = $pdo->prepare("UPDATE autenticacao SET ultimo_login = CURRENT_TIMESTAMP WHERE usuario_id = ?");
            $updateStmt->execute([$user['id']]);

            unset($user['senha']); // Remove hash antes de retornar
            echo json_encode(['sucesso' => true, 'dados' => $user], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['sucesso' => false, 'mensagem' => 'E-mail ou senha incorretos.'], JSON_UNESCAPED_UNICODE);
        }
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => 'Erro na consulta: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}
?>
