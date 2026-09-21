<?php
header('Content-Type: application/json; charset=utf-8');

// Dados de conexão Supabase
$host = 'aws-0-sa-east-1.pooler.supabase.com'; // Pooler IPv4 recomendado para Render
$port = '6543'; // Porta padrão do pooler (ou 5432 se usar Session mode)
$dbname = 'postgres';
$user = 'postgres.bfppcxnxqagpesuyjlhe'; // Usuário com Project Ref para o pooler
$password = 'An1bal_19691910@'; // Coloque aqui a senha real que você criou no Supabase

// Fallback: se preferir usar a conexão direta informada:
// $host = 'db.bfppcxnxqagpesuyjlhe.supabase.co';
// $port = '5432';
// $user = 'postgres';

try {
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbname};sslmode=require";
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'sucesso' => false,
        'erro' => 'Falha na conexão: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}
