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
    echo json_encode(['sucesso' => false, 'resposta' => 'Desculpe, a nossa base de dados está em manutenção de rotina. Volto em breve! 🔌', 'produtos' => []]);
    exit;
}

$msgLower = strtolower($mensagem);

// 2. RESPOSTAS RÁPIDAS (NATIVAS) - Sem gastar API
if (preg_match('/(pedido|rastreio|status|compra|comprei)/i', $msgLower)) {
    echo json_encode(['sucesso' => true, 'resposta' => "Para acompanhar a entrega da sua compra, clique no seu Avatar no menu superior e acesse **👤 Meu Perfil**.", 'produtos' => []]);
    exit;
}

if (preg_match('/(contato|telefone|whatsapp|email|falar com)/i', $msgLower)) {
    echo json_encode(['sucesso' => true, 'resposta' => "Pode nos contatar pelo WhatsApp **(11) 9988-7766** ou pelo email **contato@jriluminacao.com.br**. Ficamos em Santo André - SP!", 'produtos' => []]);
    exit;
}

// ==============================================================
// 3. BUSCA INTELIGENTE DE PRODUTOS NO SUPABASE
// ==============================================================
$msgLimpa = preg_replace('/[^\p{L}\p{N}\s]/u', '', $msgLower);
$palavras = explode(' ', $msgLimpa);

// Lista expandida de Stop Words para a busca no DB ser cirúrgica
$stopWords = ['oi', 'ola', 'olá', 'bom', 'dia', 'tarde', 'noite', 'tudo', 'bem', 'estou', 'procurando', 'quero', 'queria', 'gostaria', 'de', 'um', 'uma', 'uns', 'umas', 'tem', 'voces', 'vocês', 'comprar', 'ver', 'para', 'ajudar', 'qual', 'quais', 'sobre', 'preciso', 'precisamos', 'precisando', 'metros', 'metro', 'centimetros', 'tamanho', 'modelo', 'tipo', 'cor', 'você', 'voce', 'sabe', 'me', 'falar', 'preco', 'preço', 'valor', 'custa'];

$palavrasBusca = array_diff($palavras, $stopWords);
$termosValidos = array_filter($palavrasBusca, function($p) { return strlen($p) > 2; });
$produtosEncontrados = [];

if (!empty($termosValidos)) {
    $condicoes = [];
    $valores = [];
    
    // Busca tipo OR (mais amigável para o cliente que digita termos amplos)
    foreach ($termosValidos as $termo) {
        $condicoes[] = "(nome ILIKE ? OR descricao ILIKE ? OR categoria ILIKE ?)";
        $valores[] = "%{$termo}%";
        $valores[] = "%{$termo}%";
        $valores[] = "%{$termo}%";
    }
    
    $sql = "SELECT id, nome, preco, imagem, quantidade FROM produtos WHERE " . implode(" OR ", $condicoes) . " LIMIT 4";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($valores);
    
    $produtosEncontrados = $stmt->fetchAll(PDO::FETCH_ASSOC); 
}

$contextoEstoque = "";
if (count($produtosEncontrados) > 0) {
    foreach ($produtosEncontrados as $p) {
        $contextoEstoque .= "- {$p['nome']} (Preço: R$ {$p['preco']})\n";
    }
} else {
    $contextoEstoque = "[NENHUM PRODUTO ENCONTRADO PARA ESTA BUSCA]";
}

// ==============================================================
// 4. INTEGRAÇÃO BLINDADA COM LLM (GROQ)
// ==============================================================
if (empty($groq_api_key)) {
    // Se esquecer a chave no Render, a Lúcia não quebra
    if (count($produtosEncontrados) > 0) {
        echo json_encode(['sucesso' => true, 'resposta' => "Encontrei estas opções no nosso catálogo para você! Pode clicar no card abaixo para ver na loja:", 'produtos' => $produtosEncontrados]);
    } else {
        echo json_encode(['sucesso' => true, 'resposta' => "Desculpe, não consegui encontrar esse produto no momento. Tente usar a barra de pesquisa na aba de Produtos!", 'produtos' => []]);
    }
    exit;
}

$prompt = "Você é Lúcia, vendedora especialista da JR Iluminação e Leds. 
Você é amigável, direta e cirúrgica. Você NÃO É UMA IA GENÉRICA, você é funcionária da loja.
SEU OBJETIVO: Ajudar o cliente a encontrar o produto certo.

REGRAS DE OURO:
1. SEJA EXTREMAMENTE CONCISA. Máximo de 2 frases curtas. NUNCA faça textos longos.
2. FALE SEMPRE EM PORTUGUÊS DO BRASIL (PT-BR). Use 'você' em vez de 'tu' ou 'si'. Nunca use gírias de Portugal.
3. NUNCA MENCIONE as palavras 'LLM', 'IA', 'Prompt', 'Groq', 'Inteligência Artificial' ou 'Sistema'.
4. O cliente perguntou algo. Abaixo está o resultado da busca no banco de dados da loja. 
   -> SE O RESULTADO LISTA PRODUTOS: Diga algo como 'Encontrei estas opções perfeitas para você!' e cite o nome/preço de apenas 1 deles para incentivar a compra.
   -> SE O RESULTADO FOR [NENHUM PRODUTO ENCONTRADO PARA ESTA BUSCA]: Diga educadamente que não temos esse item no momento, mas ofereça visitar nossa seção de Produtos.
5. NUNCA invente um produto ou um preço que não esteja na lista abaixo.

ESTOQUE RETORNADO PELO SISTEMA:
{$contextoEstoque}";

// Usando o Mixtral ou Llama que são extremamente rápidos
$url = "https://api.groq.com/openai/v1/chat/completions";
$data = [
    "model" => "llama3-8b-8192", // Modelo mais rápido, ideal para chats curtos de TCC
    "messages" => [
        ["role" => "system", "content" => $prompt],
        ["role" => "user", "content" => $mensagem]
    ],
    "temperature" => 0.2, // Baixa criatividade para não alucinar produtos
    "max_tokens" => 80    // Respostas bem curtinhas
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Authorization: Bearer ' . $groq_api_key]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); 
curl_setopt($ch, CURLOPT_TIMEOUT, 6); // Timeout de 6 segundos para a apresentação não travar
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 5. TRATAMENTO DA RESPOSTA
if ($httpcode == 200 && $response) {
    $resultado = json_decode($response, true);
    $respostaTexto = trim($resultado['choices'][0]['message']['content']);
} else {
    // Fallback 100% PT-BR
    if (count($produtosEncontrados) > 0) {
        $respostaTexto = "Achei estas opções incríveis aqui no nosso estoque para você!";
    } else {
        $respostaTexto = "Não encontrei exatamente isso. Gostaria de dar uma olhada na nossa seção de Fitas LED?";
    }
}

echo json_encode(['sucesso' => true, 'resposta' => $respostaTexto, 'produtos' => $produtosEncontrados], JSON_UNESCAPED_UNICODE);
?>
