<?php
// testar_modelos.php
error_reporting(E_ALL);
header('Content-Type: application/json; charset=utf-8');

$groq_api_key = getenv('GROQ_API_KEY');

if (!$groq_api_key) {
    echo json_encode(["erro" => "Chave da API nao encontrada no Render."]);
    exit;
}

$ch = curl_init("https://api.groq.com/openai/v1/models");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $groq_api_key
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
