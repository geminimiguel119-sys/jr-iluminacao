<?php
$host = "db.bfppcxnxqagpesuyjlhe.supabase.co";
$porta = "5432";
$dbName = "postgres";
$usuario = "postgres";
$senha = "An1bal_19691910@";

try {
    $dsn = "pgsql:host=$host;port=$porta;dbname=$dbName;";
    $pdo = new PDO($dsn, $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Erro na conexão com o banco de dados.']);
    exit;
}
?>