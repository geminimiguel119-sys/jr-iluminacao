<?php
// api/clientes.php
require_once 'config.php';
require_once 'conexao.php';
$pdo->exec("SET TIME ZONE 'America/Sao_Paulo'");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Traz o status e o último login para exibir na Web
    $stmt = $pdo->query("SELECT u.id, u.nome, u.email, u.role, u.status, COALESCE(TO_CHAR(a.ultimo_login, 'DD/MM/YYYY HH24:MI'), 'Sem Registo') as ultimo_login FROM usuarios u LEFT JOIN autenticacao a ON a.usuario_id = u.id ORDER BY u.id DESC");
    echo json_encode(['sucesso' => true, 'dados' => $stmt->fetchAll()]);
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true);
    $acao = $dados['acao'] ?? '';
    
    // Nova função: Aprovação através da WEB
    if ($acao === 'aprovar') {
        $stmt = $pdo->prepare("UPDATE usuarios SET status = 'Aprovado' WHERE id = ?");
        $stmt->execute([$dados['id']]);
        echo json_encode(['sucesso' => true]);
    } elseif ($acao === 'salvar') {
        $id = $dados['id'] ?? null;
        $nome = $dados['nome'];
        $email = $dados['email'];
        $role = $dados['role'];
        if ($id) {
            $stmt = $pdo->prepare("UPDATE usuarios SET nome=?, email=?, role=? WHERE id=?");
            $stmt->execute([$nome, $email, $role, $id]);
        }
        echo json_encode(['sucesso' => true]);
    } elseif ($acao === 'excluir') {
        $stmt = $pdo->prepare("DELETE FROM usuarios WHERE id=?");
        $stmt->execute([$dados['id']]);
        echo json_encode(['sucesso' => true]);
    }
}
?>
