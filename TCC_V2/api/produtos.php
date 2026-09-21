<?php
// api/produtos.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

// Ligação à Base de Dados Supabase (PostgreSQL)
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

// LÓGICA DE ESCRITA, ATUALIZAÇÃO E EXCLUSÃO (POST)
if ($metodo === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true);
    
    // Ação: Excluir Produto
    if (isset($dados['acao']) && $dados['acao'] === 'excluir') {
        try {
            $stmt = $pdo->prepare("DELETE FROM produtos WHERE id = ?");
            $stmt->execute([$dados['id']]);
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
            exit;
        }
    }

    // Ação: Salvar (Inserir ou Atualizar Produto)
    if (isset($dados['acao']) && $dados['acao'] === 'salvar') {
        try {
            // Se tem um ID válido, é uma atualização
            if (!empty($dados['id'])) {
                $stmt = $pdo->prepare("UPDATE produtos SET nome = ?, descricao = ?, preco = ?, quantidade = ?, imagem = ? WHERE id = ?");
                $stmt->execute([$dados['nome'], $dados['descricao'], $dados['preco'], $dados['quantidade'], $dados['imagem'], $dados['id']]);
            } 
            // Se não tem ID, é um produto novo
            else {
                $stmt = $pdo->prepare("INSERT INTO produtos (nome, descricao, preco, quantidade, imagem) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$dados['nome'], $dados['descricao'], $dados['preco'], $dados['quantidade'], $dados['imagem']]);
            }
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
            exit;
        }
    }
}

// LÓGICA DE LEITURA (GET) - Usada para carregar a tabela e a vitrine
if ($metodo === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM produtos ORDER BY id DESC");
        $produtos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['sucesso' => true, 'dados' => $produtos]);
        exit;
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => 'Erro ao carregar produtos da base de dados.']);
        exit;
    }
}
?>