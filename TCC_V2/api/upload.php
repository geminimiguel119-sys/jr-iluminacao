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
    erro('Formato de arquivo inválido. Use JPG, PNG ou WEBP.', 400);
}

// =========================================================================
// SOLUÇÃO PARA O RENDER (Disco Efêmero):
// Transformamos a imagem em Base64. Assim, ela será salva como TEXTO 
// direto no Supabase. A imagem nunca mais some quando o Render reiniciar!
// =========================================================================
$conteudoArquivo = file_get_contents($file['tmp_name']);
$base64 = base64_encode($conteudoArquivo);
$tipoMime = mime_content_type($file['tmp_name']);

$caminhoBase64 = 'data:' . $tipoMime . ';base64,' . $base64;

sucesso('Upload realizado com sucesso.', ['caminho' => $caminhoBase64]);
?>
