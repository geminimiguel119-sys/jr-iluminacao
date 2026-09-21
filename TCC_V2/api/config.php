<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

function resposta($sucesso = true, $mensagem = '', $dados = null, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode(['sucesso' => $sucesso, 'mensagem' => $mensagem, 'dados' => $dados]);
    exit;
}
function erro($mensagem = 'Erro ao processar', $codigo = 400) { resposta(false, $mensagem, null, $codigo); }
function sucesso($mensagem = '', $dados = null, $codigo = 200) { resposta(true, $mensagem, $dados, $codigo); }
function sanitizar($dado) { return htmlspecialchars(strip_tags(trim($dado))); }
function validarEmail($email) { return filter_var($email, FILTER_VALIDATE_EMAIL); }
?>