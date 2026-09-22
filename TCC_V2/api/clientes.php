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
        PDO::ATTR_TIMEOUT => 15
    ]);
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha no banco: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $acao = $dados['acao'] ?? '';

    if ($acao === 'salvar') {
        try {
            $id = $dados['id'] ?? null;
            $nome = trim($dados['nome'] ?? '');
            $email = trim($dados['email'] ?? '');
            $role = trim($dados['role'] ?? 'cliente');

            if (empty($nome) || empty($email)) {
                echo json_encode(['sucesso' => false, 'erro' => 'Nome e e-mail são obrigatórios.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            if ($id) {
                // Atualizar cliente existente
                $stmt = $pdo->prepare("UPDATE clientes SET nome = ?, email = ?, role = ? WHERE id = ?");
                $stmt->execute([$nome, $email, $role, $id]);
            } else {
                // Criar novo cliente (com senha padrão 123456)
                $senhaHash = password_hash('123456', PASSWORD_DEFAULT);
                $stmt = $pdo->prepare("INSERT INTO clientes (nome, email, senha, role, status) VALUES (?, ?, ?, ?, 'Ativo')");
                $stmt->execute([$nome, $email, $senhaHash, $role]);
            }

            echo json_encode(['sucesso' => true], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    if ($acao === 'excluir') {
        try {
            $id = $dados['id'] ?? null;
            if ($id) {
                $stmt = $pdo->prepare("DELETE FROM clientes WHERE id = ?");
                $stmt->execute([$id]);
                echo json_encode(['sucesso' => true], JSON_UNESCAPED_UNICODE);
                exit;
            }
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

if ($metodo === 'GET') {
    try {
        // Garante que a coluna role exista ou seleciona com fallback
        $stmt = $pdo->query("SELECT id, nome, email, COALESCE(role, 'cliente') as role, status FROM clientes ORDER BY id DESC");
        $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(['sucesso' => true, 'dados' => $clientes], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
