<?php
// api/clientes.php
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

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true);
    
    // EXCLUIR CLIENTE
    if (isset($dados['acao']) && $dados['acao'] === 'excluir') {
        try {
            $stmtAuth = $pdo->prepare("DELETE FROM autenticacao WHERE usuario_id = ?");
            $stmtAuth->execute([$dados['id']]);
            
            $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id = ?");
            $stmt->execute([$dados['id']]);
            
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
            exit;
        }
    }

    // SALVAR CLIENTE (Inserir ou Atualizar)
    if (isset($dados['acao']) && $dados['acao'] === 'salvar') {
        try {
            if (!empty($dados['id'])) {
                $stmt = $pdo->prepare("UPDATE usuarios SET nome = ?, email = ?, role = ? WHERE id = ?");
                $stmt->execute([$dados['nome'], $dados['email'], $dados['role'], $dados['id']]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO usuarios (nome, email, role) VALUES (?, ?, ?) RETURNING id");
                $stmt->execute([$dados['nome'], $dados['email'], $dados['role']]);
                $novoId = $stmt->fetchColumn();
                
                $senhaHash = password_hash('123456', PASSWORD_DEFAULT);
                $stmtAuth = $pdo->prepare("INSERT INTO autenticacao (usuario_id, senha) VALUES (?, ?)");
                $stmtAuth->execute([$novoId, $senhaHash]);
            }
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
            exit;
        }
    }
}

// LISTAR CLIENTES
if ($metodo === 'GET') {
    try {
        $stmt = $pdo->query("SELECT id, nome, email, role FROM usuarios ORDER BY id DESC");
        $clientes = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['sucesso' => true, 'dados' => $clientes]);
        exit;
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => 'Erro ao carregar clientes.']);
        exit;
    }
}
?>