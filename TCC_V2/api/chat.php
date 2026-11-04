<?php
// api/chat.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);
$mensagem = $dados['mensagem'] ?? '';

if (empty($mensagem)) {
    echo json_encode(['sucesso' => false, 'resposta' => 'Pode repetir? Não entendi.']);
    exit;
}

$geminiApiKey = getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? ($_SERVER['GEMINI_API_KEY'] ?? '')); 

if (!empty($geminiApiKey)) {
    // Usando a versão v1 estável e o modelo gemini-1.5-flash
    $url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" . $geminiApiKey;
    
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
        // MODO DEBUG 2 ATIVADO
        $detalhes = "HTTP: $httpCode | cURL: $erroCurl | Google: " . substr($respostaAPI, 0, 200);
        echo json_encode(['sucesso' => true, 'resposta' => "🔧 DEBUG 2: $detalhes"]);
        exit;
    }
}

echo json_encode(['sucesso' => true, 'resposta' => "🔧 DEBUG: A variável GEMINI_API_KEY não foi encontrada no servidor."]);
?>
