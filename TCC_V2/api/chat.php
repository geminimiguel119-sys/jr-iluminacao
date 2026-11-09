<?php
// api/chat.php
error_reporting(0); // Esconde alertas do servidor em produção
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
        'resposta' => "Para garantir a iluminação perfeita, precisamos fazer o **Cálculo Luminotécnico**. Preencha os dados do seu ambiente abaixo:\n\n[WIDGET_CALCULADORA]",
        'produtos' => []
    ]);
    exit;
}

if (preg_match('/(pedido|rastreio|status|compra)/i', $msgLower)) {
    echo json_encode([
        'sucesso' => true,
        'resposta' => "Para acompanhar sua compra, clique no seu Avatar no menu superior e acesse **👤 Meu Perfil**.",
        'produtos' => []
    ]);
    exit;
}

// ==============================================================
// 3. BUSCA INTELIGENTE DE PRODUTOS NO SUPABASE
// ==============================================================
// Limpa pontuações para não atrapalhar a busca
$msgLimpa = preg_replace('/[^\p{L}\p{N}\s]/u', '', $msgLower);
$palavras = explode(' ', $msgLimpa);

// Dicionário de palavras a serem ignoradas na hora de pesquisar no banco
$stopWords = ['oi', 'ola', 'olá', 'bom', 'dia', 'tarde', 'noite', 'tudo', 'bem', 'estou', 'procurando', 'quero', 'queria', 'gostaria', 'de', 'um', 'uma', 'uns', 'umas', 'tem', 'voces', 'vocês', 'comprar', 'ver', 'para', 'ajudar', 'qual', 'quais', 'sobre'];

$palavrasBusca = array_diff($palavras, $stopWords);

// Elege a palavra mais longa restante como o termo principal de busca (ex: "plafon")
$termoPrincipal = '';
foreach ($palavrasBusca as $palavra) {
    if (strlen($palavra) > strlen($termoPrincipal)) {
        $termoPrincipal = $palavra;
    }
}

// Só faz a query no Supabase se encontrar uma palavra válida
if (strlen($termoPrincipal) > 2) {
    $stmt = $pdo->prepare("SELECT id, nome, preco, imagem, quantidade FROM produtos WHERE nome ILIKE ? OR descricao ILIKE ? LIMIT 3");
    $stmt->execute(["%{$termoPrincipal}%", "%{$termoPrincipal}%"]);
    $produtosEncontrados = $stmt->fetchAll();
}

$contextoEstoque = "";
if (count($produtosEncontrados) > 0) {
    foreach ($produtosEncontrados as $p) {
        $contextoEstoque .= "- Produto: {$p['nome']} | Preço: R$ {$p['preco']}\n";
    }
} else {
    $contextoEstoque = "Nenhum produto específico foi solicitado ou encontrado.";
}

// ==============================================================
// 4. INTEGRAÇÃO COM LLM (GROQ - QWEN)
// ==============================================================
$prompt = "Você é a Lúcia, assistente da loja JR Iluminação e Leds.
REGRAS OBRIGATÓRIAS:
1. SEJA EXTREMAMENTE CONCISA E DIRETA. Responda em no máximo 2 ou 3 frases.
2. Não use introduções longas. Entregue apenas a informação essencial.
3. Se houver produtos no contexto abaixo, recomende-os. Se não houver, responda apenas à dúvida.
4. Nunca invente preços ou produtos.
CONTEXTO ATUAL DE PRODUTOS: \n{$contextoEstoque}";

$url = "https://api.groq.com/openai/v1/chat/completions";

$data = [
    "model" => "qwen/qwen3.8-27b",
    "messages" => [
        ["role" => "system", "content" => $prompt],
        ["role" => "user", "content" => $mensagem]
    ],
    "temperature" => 0.3,
    "max_tokens" => 120
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
curl_close($ch);

// ==============================================================
// 5. TRATAMENTO DA RESPOSTA FINAL
// ==============================================================
if ($httpcode == 200 && $response) {
    $resultado = json_decode($response, true);
    if (isset($resultado['choices'][0]['message']['content'])) {
        $respostaTexto = $resultado['choices'][0]['message']['content'];
    } else {
        $respostaTexto = "Desculpe, ocorreu um erro ao formatar a resposta.";
    }
} else {
    $respostaTexto = "🚨 **ERRO DE COMUNICAÇÃO**\n- Código: {$httpcode}";
}

echo json_encode([
    'sucesso' => true,
    'resposta' => $respostaTexto,
    'produtos' => $produtosEncontrados
]);
?>
