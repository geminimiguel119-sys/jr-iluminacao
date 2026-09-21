<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Host exato da região do seu projeto (us-west-2)
$host = 'aws-0-us-west-2.pooler.supabase.com';
$port = '5432'; // Session pooler porta 5432
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
    // Caso a porta 5432 falhe, tenta a 6543 no mesmo host
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
            'erro' => 'Erro conexao (5432): ' . $e->getMessage() . ' | Erro (6543): ' . $e2->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Busca os produtos cadastrados
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
