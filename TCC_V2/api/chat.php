<?php
// api/chat.php
header('Content-Type: application/json; charset=utf-8');

$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);
$mensagem = trim($dados['mensagem'] ?? '');

if (empty($mensagem)) {
    echo json_encode(['sucesso' => false, 'erro' => 'Mensagem vazia.']);
    exit;
}

// ==============================================================
// 1. CREDENCIAIS (SUPABASE E GEMINI)
// ==============================================================
// Coloque aqui a sua chave de API gerada no Google AI Studio
$gemini_api_key = "AQ.Ab8RN6K_NEU0tM2xL0h_PSRfxpJTVpSEUqWlvo_r62mpCpRYnw"; 

$host = 'aws-0-us-west-2.pooler.supabase.com';
$port = '5432';
$dbName = 'postgres';
$usuario = 'postgres.bfppcxnxqagpesuyjlhe';
$senha = 'An1bal_19691910@';

try {
    $pdo = new PDO("pgsql:host={$host};port={$port};dbname={$dbName};sslmode=require", $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'resposta' => 'Desculpe, meu sistema de catálogo está passando por uma manutenção rápida. 🔌']);
    exit;
}

$respostaTexto = "";
$produtosEncontrados = [];

// ==============================================================
// 2. FUNÇÕES NATIVAS FIXAS (Calculadora e Rastreio)
// ==============================================================
$msgLower = strtolower($mensagem);

if (preg_match('/(calcular|cálculo|calculadora|l[uú]mens|luminosidade|projeto)/i', $msgLower)) {
    echo json_encode([
        'sucesso' => true,
        'resposta' => "Para garantir a iluminação perfeita, precisamos fazer o **Cálculo Luminotécnico** básico. Preencha os dados do seu ambiente abaixo:\n\n[WIDGET_CALCULADORA]",
        'produtos' => []
    ]);
    exit;
}

if (preg_match('/(pedido|rastreio|status|compra)/i', $msgLower)) {
    echo json_encode([
        'sucesso' => true,
        'resposta' => "Para acompanhar a sua compra em tempo real, clique no seu Avatar no menu superior e acesse o **👤 Meu Perfil**. Lá você encontra a Linha do Tempo atualizada dos seus pedidos!",
        'produtos' => []
    ]);
    exit;
}

// ==============================================================
// 3. BUSCA DE CONTEXTO NO BANCO DE DADOS (SUPABASE)
// ==============================================================
// Tenta buscar no banco algo relacionado ao que o cliente digitou
$palavras = explode(' ', $msgLower);
$termoPrincipal = $palavras[0]; // Pega a primeira palavra como base de busca rápida

$stmt = $pdo->prepare("SELECT id, nome, preco, imagem, quantidade FROM produtos WHERE nome ILIKE ? OR descricao ILIKE ? LIMIT 3");
$stmt->execute(["%{$termoPrincipal}%", "%{$termoPrincipal}%"]);
$produtosEncontrados = $stmt->fetchAll();

// Se não achou nada com a palavra, pega 3 produtos aleatórios para oferecer como sugestão
if (count($produtosEncontrados) === 0) {
    $stmt = $pdo->query("SELECT id, nome, preco, imagem, quantidade FROM produtos ORDER BY RANDOM() LIMIT 3");
    $produtosEncontrados = $stmt->fetchAll();
}

$contextoEstoque = "";
foreach ($produtosEncontrados as $p) {
    $contextoEstoque .= "- ID: {$p['id']} | Nome: {$p['nome']} | Preço: R$ {$p['preco']} | Estoque: {$p['quantidade']}\n";
}

// ==============================================================
// 4. INTEGRAÇÃO COM LLM (GEMINI API)
// ==============================================================
// Montamos o "System Prompt" invisível para a IA
$prompt = "Você é a Lúcia, assistente virtual e especialista em iluminação da loja JR Iluminação e Leds.
Sua personalidade é amigável, profissional e você usa emojis moderadamente.
REGRAS OBRIGATÓRIAS:
1. Responda em no máximo 2 ou 3 parágrafos curtos.
2. O cliente perguntou: '{$mensagem}'.
3. Baseie sua resposta técnica APENAS nestes produtos do nosso catálogo atual: \n{$contextoEstoque}.
4. Se o cliente pedir indicações, recomende explicitamente os produtos acima, pois os cards deles aparecerão na tela.
5. Se for uma dúvida técnica (temperatura de cor, IRC, lúmens), explique de forma fácil de entender.
6. Nunca invente preços, promoções ou produtos que não estão na lista acima.";

$url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" . $gemini_api_key;
$data = [
    "contents" => [
        ["parts" => [["text" => $prompt]]]
    ],
    "generationConfig" => [
        "temperature" => 0.4, // Temperatura baixa para evitar alucinações e focar nos dados reais
        "maxOutputTokens" => 250
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
// Ignorar verificação SSL localmente caso haja problemas de certificado
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode == 200 && $response) {
    $resultadoGemini = json_decode($response, true);
    $respostaTexto = $resultadoGemini['candidates'][0]['content']['parts'][0]['text'] ?? "Desculpe, tive um pequeno lapso de memória. Pode repetir?";
} else {
    // Fallback de segurança caso a API falhe ou a chave esteja incorreta
    $respostaTexto = "Encontrei estas excelentes opções no nosso catálogo que podem atender perfeitamente ao seu projeto de iluminação. Que tal dar uma olhada?";
}

// ==============================================================
// 5. RESPOSTA FINAL (TEXTO DA IA + CARDS DO SUPABASE)
// ==============================================================
echo json_encode([
    'sucesso' => true,
    'resposta' => $respostaTexto,
    'produtos' => $produtosEncontrados
]);
?>
