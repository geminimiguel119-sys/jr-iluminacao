<?php
// api/produtos.php
require_once 'config.php';
require_once 'conexao.php';
$pdo->exec("SET TIME ZONE 'America/Sao_Paulo'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("SELECT * FROM produtos ORDER BY id DESC");
    echo json_encode(['sucesso' => true, 'dados' => $stmt->fetchAll()]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true);
    $acao = $dados['acao'] ?? '';
    
    if ($acao === 'salvar') {
        $id = $dados['id'] ?? null;
        $nome = $dados['nome'];
        $categoria = $dados['categoria'] ?? 'Outros';
        $preco = $dados['preco'];
        $qtd = $dados['quantidade'];
        $desc = $dados['descricao'];
        $img = $dados['imagem'];
        
        if (!$id) {
            // TESTE 6: Bloqueia duplicação pelo nome
            $check = $pdo->prepare("SELECT id FROM produtos WHERE LOWER(nome) = LOWER(?)");
            $check->execute([$nome]);
            if ($check->fetch()) {
                echo json_encode(['sucesso' => false, 'erro' => 'Já existe um produto com este nome.']);
                exit;
            }
            $stmt = $pdo->prepare("INSERT INTO produtos (nome, categoria, preco, quantidade, descricao, imagem) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$nome, $categoria, $preco, $qtd, $desc, $img]);
        } else {
            $stmt = $pdo->prepare("UPDATE produtos SET nome=?, categoria=?, preco=?, quantidade=?, descricao=?, imagem=? WHERE id=?");
            $stmt->execute([$nome, $categoria, $preco, $qtd, $desc, $img, $id]);
        }
        echo json_encode(['sucesso' => true]);
    } elseif ($acao === 'excluir') {
        $stmt = $pdo->prepare("DELETE FROM produtos WHERE id=?");
        $stmt->execute([$dados['id']]);
        echo json_encode(['sucesso' => true]);
    }
}
?>
