<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);

$id = intval($dados['id'] ?? 0);
$nome = sanitizar($dados['nome'] ?? '');
$email = sanitizar($dados['email'] ?? '');

if ($id <= 0) erro('ID inválido ou sessão expirada.');

try {
    // Verifica se o e-mail já pertence a outra conta
    $stmtCheck = $pdo->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
    $stmtCheck->execute([$email, $id]);
    if ($stmtCheck->fetch()) erro('E-mail já está em uso.');

    // Salva as alterações
    $stmt = $pdo->prepare("UPDATE usuarios SET nome = ?, email = ? WHERE id = ?");
    $stmt->execute([$nome, $email, $id]);
    
    sucesso('Perfil atualizado com sucesso!');
} catch(PDOException $e) {
    erro('Erro BD: ' . $e->getMessage());
}
?>
