<?php
// api/chat.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);
$mensagem = $dados['mensagem'] ?? '';

if (empty($mensagem)) {
    echo json_encode(['sucesso' => false, 'resposta' => 'Pode repetir?']);
    exit;
}

// Tenta capturar a chave de 3 formas diferentes (contorna bloqueios do PHP-FPM no Render)
$geminiApiKey = getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? ($_SERVER['GEMINI_API_KEY'] ?? '')); 

if (!empty($geminiApiKey)) {
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $geminiApiKey;
    
    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => "Você é a Lúcia, assistente virtual da JR Iluminação. Responda de forma breve, educada e direta. O cliente perguntou: " . $mensagem]
                ]
            ]
        ]
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    
    // Desativa a verificação SSL que costuma falhar no ambiente gratuito do Render
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
    
    $respostaAPI = curl_exec($ch);
    $erroCurl = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $resultado = json_decode($respostaAPI, true);
    
    if ($httpCode == 200 && isset($resultado['candidates'][0]['content']['parts'][0]['text'])) {
        $textoBot = $resultado['candidates'][0]['content']['parts'][0]['text'];
        echo json_encode(['sucesso' => true, 'resposta' => trim($textoBot)]);
        exit;
    } else {
        // MODO DEBUG: Retorna o erro real do Google ou do Servidor direto no chat
        $detalhes = "HTTP: $httpCode | cURL: $erroCurl | Google: " . substr($respostaAPI, 0, 150);
        echo json_encode(['sucesso' => true, 'resposta' => "🔧 DEBUG API: $detalhes"]);
        exit;
    }
}

// MODO DEBUG: Se o PHP não conseguiu ler a variável no painel
echo json_encode(['sucesso' => true, 'resposta' => "🔧 DEBUG CHAVE: A variável GEMINI_API_KEY não foi encontrada no servidor."]);
?>
