<?php
// api/produtos.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurações com o Pooler us-west-2 do Supabase
$host = 'aws-0-us-west-2.pooler.supabase.com';
$port = '5432';
$dbname = 'postgres';
$user = 'postgres.bfppcxnxqagpesuyjlhe';
$password = 'An1bal_19691910@';

try {
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 15
    ]);
} catch (PDOException $e) {
    try {
        $dsn2 = "pgsql:host={$host};port=6543;dbname={$dbname};sslmode=require";
        $pdo = new PDO($dsn2, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 15
        ]);
    } catch (PDOException $e2) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Erro de conexão: ' . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

$metodo = $_SERVER['REQUEST_METHOD'];

// =======================================================
// 1. CRIAR OU ATUALIZAR PRODUTO (POST OU PUT)
// =======================================================
if ($metodo === 'POST' || $metodo === 'PUT') {
    $dados = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $acao = $dados['acao'] ?? '';
    $id = isset($dados['id']) ? intval($dados['id']) : null;

    // Atualização pontual apenas de quantidade em estoque
    if ($acao === 'atualizar_estoque' || (isset($dados['quantidade']) && count($dados) <= 3 && $id)) {
        try {
            $quantidade = intval($dados['quantidade'] ?? 0);
            $stmt = $pdo->prepare("UPDATE produtos SET quantidade = ? WHERE id = ?");
            $stmt->execute([$quantidade, $id]);

            echo json_encode(['sucesso' => true, 'mensagem' => 'Estoque atualizado com sucesso.'], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => 'Erro ao atualizar estoque: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // Atualização completa do produto (nome, preço, quantidade, etc.)
    if ($id) {
        try {
            $nome = trim($dados['nome'] ?? '');
            $descricao = trim($dados['descricao'] ?? '');
            $preco = floatval($dados['preco'] ?? 0);
            $quantidade = intval($dados['quantidade'] ?? 0);
            $imagem = trim($dados['imagem'] ?? '');

            $stmt = $pdo->prepare("UPDATE produtos 
                                   SET nome = COALESCE(NULLIF(?, ''), nome),
                                       descricao = COALESCE(NULLIF(?, ''), descricao),
                                       preco = ?,
                                       quantidade = ?,
                                       imagem = COALESCE(NULLIF(?, ''), imagem)
                                   WHERE id = ?");
            $stmt->execute([$nome, $descricao, $preco, $quantidade, $imagem, $id]);

            echo json_encode(['sucesso' => true, 'mensagem' => 'Produto atualizado com sucesso.'], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => 'Erro ao atualizar produto: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    // Inserção de novo produto
    try {
        $nome = trim($dados['nome'] ?? '');
        $descricao = trim($dados['descricao'] ?? '');
        $preco = floatval($dados['preco'] ?? 0);
        $quantidade = intval($dados['quantidade'] ?? 0);
        $imagem = trim($dados['imagem'] ?? '');

        if (empty($nome)) {
            echo json_encode(['sucesso' => false, 'erro' => 'Nome do produto é obrigatório.'], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO produtos (nome, descricao, preco, quantidade, imagem) VALUES (?, ?, ?, ?, ?) RETURNING id");
        $stmt->execute([$nome, $descricao, $preco, $quantidade, $imagem]);
        $novoId = $stmt->fetchColumn();

        echo json_encode(['sucesso' => true, 'id' => $novoId, 'mensagem' => 'Produto cadastrado com sucesso.'], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => 'Erro ao cadastrar produto: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// =======================================================
// 2. EXCLUIR PRODUTO (DELETE)
// =======================================================
if ($metodo === 'DELETE') {
    $dados = json_decode(file_get_contents("php://input"), true);
    $id = intval($_GET['id'] ?? $dados['id'] ?? 0);

    if ($id > 0) {
        try {
            $stmt = $pdo->prepare("DELETE FROM produtos WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['sucesso' => true, 'mensagem' => 'Produto removido.'], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => 'Erro ao excluir produto: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// =======================================================
// 3. CONSULTAR PRODUTOS (GET)
// =======================================================
try {
    $stmt = $pdo->query("SELECT * FROM produtos ORDER BY id ASC");
    $produtos = $stmt->fetchAll();

    echo json_encode([
        'sucesso' => true,
        'dados' => $produtos
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Erro ao buscar produtos: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
