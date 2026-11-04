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

// Puxa a chave segura do Render de forma robusta
$geminiApiKey = getenv('GEMINI_API_KEY') ?: ($_ENV['GEMINI_API_KEY'] ?? ($_SERVER['GEMINI_API_KEY'] ?? '')); 

if (!empty($geminiApiKey)) {
    // CORREÇÃO: Adicionado o sufixo '-latest' no nome do modelo
    $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" . $geminiApiKey;
    
    $payload = [
        "contents" => [
            [
                "parts" => [
                    ["text" => "Você é a Lúcia, uma assistente virtual simpática da loja de e-commerce JR Iluminação e Leds. Seja muito breve, educada e direta. O cliente perguntou: " . $mensagem]
                ]
            ]
        ]
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    
    // Contorna bloqueios de SSL do Render
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
    
    $respostaAPI = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $resultado = json_decode($respostaAPI, true);
    
    // Se a IA responder com sucesso, exibe a resposta real e encerra
    if ($httpCode == 200 && isset($resultado['candidates'][0]['content']['parts'][0]['text'])) {
        $textoBot = $resultado['candidates'][0]['content']['parts'][0]['text'];
        echo json_encode(['sucesso' => true, 'resposta' => trim($textoBot)]);
        exit;
    }
}

// ==============================================================
// MODO SALVA-VIDAS (Fallback)
// ==============================================================
$msgLower = strtolower($mensagem);
$resposta = "Como sou uma IA em fase de ajustes para o TCC, ainda estou aprendendo! Mas na JR Iluminação temos as melhores opções em LED para você. 💡";

if (strpos($msgLower, 'lúmen') !== false || strpos($msgLower, 'calcul') !== false) {
    $resposta = "Para calcular a iluminação, recomendamos entre **150 a 200 lúmens por metro quadrado** para salas e quartos. Quer dar uma olhada nos nossos Painéis LED? ✨";
} elseif (strpos($msgLower, 'fita') !== false || strpos($msgLower, 'led') !== false) {
    $resposta = "Temos excelentes **Fitas LED** no nosso catálogo! Trabalhamos com Branco Frio, Quente e RGB com controle. Acesse nossa página de Produtos para ver os detalhes.";
} elseif (strpos($msgLower, 'pedido') !== false || strpos($msgLower, 'status') !== false) {
    $resposta = "Para ver o status do seu pedido, basta entrar na sua **Área do Cliente** clicando em Histórico de Compras. Lá estão todas as informações! 📦";
} elseif (strpos($msgLower, 'olá') !== false || strpos($msgLower, 'oi') !== false || strpos($msgLower, 'bom dia') !== false) {
    $resposta = "Olá! Seja muito bem-vindo à JR Iluminação. Como posso te ajudar a iluminar o seu ambiente hoje?";
}

echo json_encode(['sucesso' => true, 'resposta' => $resposta]);
?>
