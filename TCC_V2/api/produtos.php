<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Conexão direta com Supabase via Pooler IPv4
$host = 'aws-0-sa-east-1.pooler.supabase.com';
$port = '6543';
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
    // Fallback: tenta a conexão direta caso o pooler da região seja diferente
    try {
        $hostDireto = 'db.bfppcxnxqagpesuyjlhe.supabase.co';
        $dsnDireto = "pgsql:host={$hostDireto};port=5432;dbname={$dbname};sslmode=require";
        $pdo = new PDO($dsnDireto, 'postgres', $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 10
        ]);
    } catch (PDOException $e2) {
        echo json_encode([
            'sucesso' => false,
            'erro' => 'Erro conexao: ' . $e->getMessage() . ' | Fallback: ' . $e2->getMessage()
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

// Busca os produtos
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
