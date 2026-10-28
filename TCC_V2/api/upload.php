<?php
// api/upload.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'config.php';

// Protege a rota: apenas administradores com Token válido podem fazer upload
validarAdmin();

if (!isset($_FILES['imagem']) || $_FILES['imagem']['error'] !== UPLOAD_ERR_OK) {
    erro('Nenhuma imagem foi enviada ou ocorreu um erro no upload.', 400);
}

$file = $_FILES['imagem'];
$ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$allowed = ['jpg', 'jpeg', 'png', 'webp'];

if (!in_array($ext, $allowed)) {
    erro('Formato inválido. Use JPG, PNG ou WEBP.', 400);
}

// Criar pasta 'uploads' na raiz do projeto, caso não exista
$uploadDir = '../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Gera um nome único para a imagem para não sobrepor outras
$novoNome = uniqid('prod_') . '.' . $ext;
$caminhoCompleto = $uploadDir . $novoNome;
$caminhoRelativo = 'uploads/' . $novoNome;

if (move_uploaded_file($file['tmp_name'], $caminhoCompleto)) {
    sucesso('Upload realizado.', ['caminho' => $caminhoRelativo]);
} else {
    erro('Erro ao guardar o ficheiro no servidor.', 500);
}
?>
