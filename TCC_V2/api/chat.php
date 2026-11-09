<?php
// api/chat.php
header('Content-Type: application/json; charset=utf-8');

// Recebe os dados do frontend
$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);
$mensagem = strtolower(trim($dados['mensagem'] ?? ''));

if (empty($mensagem)) {
    echo json_encode(['sucesso' => false, 'erro' => 'Mensagem vazia.']);
    exit;
}

// Conexão com o Supabase (a mesma usada no bot e no site)
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

$respostaTexto = "Como consultora de iluminação, recomendo avaliarmos o seu ambiente. Procura algo específico para sala, quarto, cozinha ou fachada?";
$produtosEncontrados = [];

// 1. LÓGICA DE APRESENTAÇÃO E AJUDA
if (preg_match('/(oi|ol[áa]|bom dia|boa tarde|boa noite|ajuda)/i', $mensagem)) {
    $respostaTexto = "Olá! Sou a **Lúcia**, especialista em iluminação e projetos da JR. 💡\n\nPosso te ajudar a:\n1️⃣ Encontrar produtos no catálogo\n2️⃣ Calcular lúmens para o seu ambiente\n3️⃣ Consultar o status do seu pedido\n\nComo posso iluminar o seu dia hoje?";
}

// 2. LÓGICA DA CALCULADORA LUMINOTÉCNICA
elseif (preg_match('/(calcular|cálculo|calculadora|l[uú]mens|luminosidade|projeto)/i', $mensagem)) {
    // Retornamos uma tag especial que o JS vai transformar numa calculadora interativa
    $respostaTexto = "Para garantir a iluminação perfeita (nem escura, nem ofuscante), precisamos fazer o **Cálculo Luminotécnico** básico. Preencha os dados do seu ambiente abaixo:\n\n[WIDGET_CALCULADORA]";
}

// 3. LÓGICA DE PÓS-VENDA E RASTREIO
elseif (preg_match('/(pedido|rastreio|status|compra)/i', $mensagem)) {
    $respostaTexto = "Para acompanhar a sua compra em tempo real, basta clicar no seu Avatar no menu superior e acessar o **👤 Meu Perfil**. Lá você encontra a Linha do Tempo atualizada de todos os seus pedidos!";
}

// 4. LÓGICA DE CONSULTORA (BUSCA REAL NO SUPABASE)
else {
    // Extrai palavras-chave comuns de iluminação da mensagem
    preg_match('/(fita|spot|painel|plafon|l[âa]mpada|pendente|perfil|led)/i', $mensagem, $matches);
    
    $termoBusca = !empty($matches[1]) ? $matches[1] : '';

    if ($termoBusca) {
        // Busca até 3 produtos reais no banco que correspondam à palavra-chave
        $stmt = $pdo->prepare("SELECT id, nome, preco, imagem, quantidade FROM produtos WHERE nome ILIKE ? OR categoria ILIKE ? LIMIT 3");
        $stmt->execute(["%{$termoBusca}%", "%{$termoBusca}%"]);
        $produtosEncontrados = $stmt->fetchAll();

        if (count($produtosEncontrados) > 0) {
            $respostaTexto = "Excelente escolha! Busquei no nosso estoque em tempo real e encontrei ótimas opções de **" . ucfirst($termoBusca) . "** para o seu projeto. Veja só:";
        } else {
            $respostaTexto = "No momento não temos **" . ucfirst($termoBusca) . "** disponível no estoque físico, mas nossa vitrine está sempre sendo atualizada. Posso sugerir outras soluções em LED?";
        }
    } else {
        // Se não entendeu, tenta buscar a mensagem inteira como nome de produto
        $stmt = $pdo->prepare("SELECT id, nome, preco, imagem, quantidade FROM produtos WHERE nome ILIKE ? LIMIT 2");
        $stmt->execute(["%{$mensagem}%"]);
        $produtosEncontrados = $stmt->fetchAll();
        
        if (count($produtosEncontrados) > 0) {
            $respostaTexto = "Encontrei estes itens que podem combinar com o que você procura:";
        } else {
            $respostaTexto = "Interessante! Para que eu possa te recomendar a iluminação ideal, me dê mais detalhes: você procura luz indireta (como fitas LED) ou foco direto (como spots e plafons)?";
        }
    }
}

// Retorna a resposta e a lista de produtos (se houver) para o JavaScript
echo json_encode([
    'sucesso' => true,
    'resposta' => $respostaTexto,
    'produtos' => $produtosEncontrados
]);
?>
