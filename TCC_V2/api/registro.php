<?php
require_once 'config.php';
require_once 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') erro("Método não permitido", 405);

$dados = json_decode(file_get_contents("php://input"), true) ?: $_POST;
$nome = sanitizar($dados['nome'] ?? '');
$email = sanitizar($dados['email'] ?? '');
$senha = $dados['senha'] ?? '';
$role = isset($dados['role']) && $dados['role'] === 'admin' ? 'admin' : 'cliente'; // Permite criar admin via API se necessário

if (empty($nome) || empty($email) || empty($senha)) erro('Preencha todos os campos.', 400);

try {
    $pdo->beginTransaction();
    $stmtCheck = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $stmtCheck->execute([$email]);
    if ($stmtCheck->fetch()) throw new Exception("E-mail já cadastrado.");

    $stmtUser = $pdo->prepare("INSERT INTO usuarios (nome, email, role) VALUES (?, ?, ?) RETURNING id");
    $stmtUser->execute([$nome, $email, $role]);
    $usuario_id = $stmtUser->fetchColumn();

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);
    $stmtAuth = $pdo->prepare("INSERT INTO autenticacao (usuario_id, senha) VALUES (?, ?)");
    $stmtAuth->execute([$usuario_id, $senhaHash]);
    
    $pdo->commit();
    sucesso("Conta criada com sucesso");
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    erro($e->getMessage(), 400);
}
?>