<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Credenciais exatas do Supabase Pooler IPv4
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
        PDO::ATTR_TIMEOUT => 10
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Falha na conexão: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Consulta e exibição dos produtos
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
        'erro' => 'Erro na consulta: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
