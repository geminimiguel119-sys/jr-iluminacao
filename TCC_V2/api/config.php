<?php
// api/config.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

define('SECRET_KEY', 'JR_ILUMINACAO_TCC_2026_SUPER_SECRETO');

function resposta($sucesso = true, $mensagem = '', $dados = null, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode(['sucesso' => $sucesso, 'mensagem' => $mensagem, 'dados' => $dados]);
    exit;
}
function erro($mensagem = 'Erro ao processar', $codigo = 400) { resposta(false, $mensagem, null, $codigo); }
function sucesso($mensagem = '', $dados = null, $codigo = 200) { resposta(true, $mensagem, $dados, $codigo); }
function sanitizar($dado) { return htmlspecialchars(strip_tags(trim($dado))); }
function validarEmail($email) { return filter_var($email, FILTER_VALIDATE_EMAIL); }

// ==========================================
// SEGURANÇA: GERAÇÃO E VALIDAÇÃO DE TOKENS
// ==========================================
function gerarToken($user_id, $role) {
    $header = base64_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = base64_encode(json_encode(['id' => $user_id, 'role' => $role, 'exp' => time() + 86400]));
    $signature = hash_hmac('sha256', "$header.$payload", SECRET_KEY);
    return "$header.$payload.$signature";
}

function obterCabecalhoAutorizacao() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) $headers = trim($_SERVER["Authorization"]);
    else if (isset($_SERVER['HTTP_AUTHORIZATION'])) $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    elseif (function_exists('apache_request_headers')) {
        $reqHeaders = apache_request_headers();
        if (isset($reqHeaders['Authorization'])) $headers = trim($reqHeaders['Authorization']);
    }
    return $headers;
}

function validarAdmin() {
    $authHeader = obterCabecalhoAutorizacao();
    
    // CORREÇÃO: Garante que $authHeader é sempre uma string (mesmo que vazia) para evitar o erro do PHP 8.2
    $authHeader = $authHeader ? $authHeader : '';

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $partes = explode('.', $token);
        if (count($partes) === 3) {
            $signature = hash_hmac('sha256', "$partes[0].$partes[1]", SECRET_KEY);
            if (hash_equals($signature, $partes[2])) {
                $payload = json_decode(base64_decode($partes[1]), true);
                if ($payload && isset($payload['role']) && $payload['role'] === 'admin' && $payload['exp'] > time()) {
                    return true; 
                }
            }
        }
    }
    erro('Acesso Negado. Autenticação inválida ou sem permissões de administrador.', 401);
}
?>
