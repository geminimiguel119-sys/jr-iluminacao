<?php
// api/chat.php
error_reporting(0);
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);
$mensagem = trim($dados['mensagem'] ?? '');

if (empty($mensagem)) {
    echo json_encode(['sucesso' => false, 'erro' => 'Mensagem vazia.']);
    exit;
}

// 1. CREDENCIAIS
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

$msgLower = strtolower($mensagem);

// 2. FUNÇÕES NATIVAS
if (preg_match('/(pedido|rastreio|status|compra)/i', $msgLower)) {
    echo json_encode(['sucesso' => true, 'resposta' => "Para acompanhar a sua compra, clique no seu Avatar no menu superior e acesse **👤 Meu Perfil**.", 'produtos' => []]);
    exit;
}

// ==============================================================
// 3. BUSCA INTELIGENTE DE PRODUTOS NO SUPABASE
// ==============================================================
$msgLimpa = preg_replace('/[^\p{L}\p{N}\s]/u', '', $msgLower);
$palavras = explode(' ', $msgLimpa);

// Lista expandida de palavras que a busca deve ignorar
$stopWords = ['oi', 'ola', 'olá', 'bom', 'dia', 'tarde', 'noite', 'tudo', 'bem', 'estou', 'procurando', 'quero', 'queria', 'gostaria', 'de', 'um', 'uma', 'uns', 'umas', 'tem', 'voces', 'vocês', 'comprar', 'ver', 'para', 'ajudar', 'qual', 'quais', 'sobre', 'preciso', 'precisamos', 'precisando', 'metros', 'metro', 'centimetros', 'tamanho', 'modelo', 'tipo', 'cor'];

$palavrasBusca = array_diff($palavras, $stopWords);

// Filtra as palavras que sobraram e que tenham mais de 2 letras
$termosValidos = array_filter($palavrasBusca, function($p) { 
    return strlen($p) > 2; 
});

$produtosEncontrados = [];

// Se sobrou alguma palavra válida (ex: "fita", "led", "rgb"), faz a busca dinâmica
if (!empty($termosValidos)) {
    $condicoes = [];
    $valores = [];
    
    foreach ($termosValidos as $termo) {
        $condicoes[] = "(nome ILIKE ? OR descricao ILIKE ?)";
        $valores[] = "%{$termo}%";
        $valores[] = "%{$termo}%";
    }
    
    // Junta tudo com OR (Pesquisa por qualquer uma das palavras úteis da frase)
    $sql = "SELECT id, nome, preco, imagem, quantidade FROM produtos WHERE " . implode(" OR ", $condicoes) . " LIMIT 4";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);
    
    // Pega os resultados e remove duplicados caso a mesma fita bata com "fita" e "rgb"
    $produtosEncontrados = $stmt->fetchAll(PDO::FETCH_UNIQUE); 
    // Reindexa o array após o FETCH_UNIQUE
    $produtosEncontrados = array_values($produtosEncontrados); 
}

$contextoEstoque = "";
if (count($produtosEncontrados) > 0) {
    foreach ($produtosEncontrados as $p) {
        $contextoEstoque .= "- Produto: {$p['nome']} | Preço: R$ {$p['preco']}\n";
    }
} else {
    $contextoEstoque = "Nenhum produto específico foi solicitado ou encontrado no banco de dados.";
}

// 4. INTEGRAÇÃO COM LLM (GROQ - QWEN)
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
    "max_tokens" => 150
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Authorization: Bearer ' . $groq_api_key]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 5. TRATAMENTO DA RESPOSTA
if ($httpcode == 200 && $response) {
    $resultado = json_decode($response, true);
    $respostaTexto = $resultado['choices'][0]['message']['content'] ?? "Desculpe, ocorreu um erro ao formatar a resposta.";
} else {
    $respostaTexto = "🚨 **ERRO DE COMUNICAÇÃO**\n- Código: {$httpcode}";
}

echo json_encode(['sucesso' => true, 'resposta' => $respostaTexto, 'produtos' => $produtosEncontrados]);
?>
