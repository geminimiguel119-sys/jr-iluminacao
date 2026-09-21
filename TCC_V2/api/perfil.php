<?php
// api/perfil.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$host = "db.bfppcxnxqagpesuyjlhe.supabase.co";
$dbName = "postgres";
$usuario = "postgres";
$senha = "An1bal_19691910@";

try {
    $pdo = new PDO("pgsql:host=$host;port=5432;dbname=$dbName", $usuario, $senha, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $dados = json_decode(file_get_contents("php://input"), true);

    if (isset($dados['id']) && isset($dados['nome']) && isset($dados['email'])) {
        $stmt = $pdo->prepare("UPDATE usuarios SET nome = ?, email = ? WHERE id = ?");
        $stmt->execute([$dados['nome'], $dados['email'], $dados['id']]);
        echo json_encode(['sucesso' => true]);
    } else {
        echo json_encode(['sucesso' => false, 'erro' => 'Dados incompletos.']);
    }
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
}
?>