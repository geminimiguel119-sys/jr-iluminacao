<?php
// api/chat.php
error_reporting(0); // Esconde alertas do servidor
header('Content-Type: application/json; charset=utf-8');

$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);
$mensagem = trim($dados['mensagem'] ?? '');

if (empty($mensagem)) {
    echo json_encode(['sucesso' => false, 'erro' => 'Mensagem vazia.']);
    exit;
}

// ==============================================================
// 1. CREDENCIAIS (SUPABASE E GROQ)
// ==============================================================
$groq_api_key = getenv('GROQ_API_KEY');

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
    echo json_encode(['sucesso' => false, 'resposta' => 'Desculpe, meu banco de dados está em manutenção. 🔌']);
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
$palavras = explode(' ', $msgLower);
$termoPrincipal = $palavras[0]; 

$stmt = $pdo->prepare("SELECT id, nome, preco, imagem, quantidade FROM produtos WHERE nome ILIKE ? OR descricao ILIKE ? LIMIT 3");
$stmt->execute(["%{$termoPrincipal}%", "%{$termoPrincipal}%"]);
$produtosEncontrados = $stmt->fetchAll();

if (count($produtosEncontrados) === 0) {
    $stmt = $pdo->query("SELECT id, nome, preco, imagem, quantidade FROM produtos ORDER BY RANDOM() LIMIT 3");
    $produtosEncontrados = $stmt->fetchAll();
}

$contextoEstoque = "";
foreach ($produtosEncontrados as $p) {
    $contextoEstoque .= "- ID: {$p['id']} | Nome: {$p['nome']} | Preço: R$ {$p['preco']} | Estoque: {$p['quantidade']}\n";
}

// ==============================================================
// 4. INTEGRAÇÃO COM LLM (GROQ - LLaMA 3)
// ==============================================================
$prompt = "Você é a Lúcia, assistente virtual e especialista em iluminação da loja JR Iluminação e Leds.
Sua personalidade é amigável, profissional e você usa emojis moderadamente.
REGRAS OBRIGATÓRIAS:
1. Responda em no máximo 2 ou 3 parágrafos curtos, em Português do Brasil.
2. Baseie sua resposta técnica APENAS nestes produtos do nosso catálogo atual: \n{$contextoEstoque}.
3. Se o cliente pedir indicações, recomende explicitamente os produtos acima, pois os cards deles aparecerão na tela.
4. Nunca invente preços, promoções ou produtos que não estão na lista acima.";

$url = "https://api.groq.com/openai/v1/chat/completions";

// Estrutura de mensagens no padrão OpenAI/Groq
$data = [
    "model" => "llama-3.1-8b-instant", // Modelo incrivelmente rápido e eficiente
    "messages" => [
        ["role" => "system", "content" => $prompt],
        ["role" => "user", "content" => $mensagem]
    ],
    "temperature" => 0.4,
    "max_tokens" => 250
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $groq_api_key
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$erroCurl = curl_error($ch);
curl_close($ch);

// ==============================================================
// 5. DEBUG E TRATAMENTO DA RESPOSTA FINAL
// ==============================================================
if ($httpcode == 200 && $response) {
    $resultado = json_decode($response, true);
    // Pega o conteúdo da resposta do modelo Groq
    if (isset($resultado['choices'][0]['message']['content'])) {
        $respostaTexto = $resultado['choices'][0]['message']['content'];
    } else {
        $respostaTexto = "⚠️ A IA respondeu, mas num formato estranho: " . print_r($resultado, true);
    }
} else {
    // MODO DEBUG
    $respostaTexto = "🚨 **ERRO DE COMUNICAÇÃO COM O GROQ**\n\n";
    $respostaTexto .= "- **Código HTTP:** {$httpcode}\n";
    $respostaTexto .= "- **Erro do Servidor:** {$erroCurl}\n";
    $respostaTexto .= "- **Resposta do Groq:** {$response}\n\n";
    $respostaTexto .= "Verifique se a chave que começa com 'gsk_' está colada na linha 16.";
}

echo json_encode([
    'sucesso' => true,
    'resposta' => $respostaTexto,
    'produtos' => $produtosEncontrados
]);
?>
