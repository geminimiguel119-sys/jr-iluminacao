<?php
// api/chat.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$conteudo = file_get_contents("php://input");
$dados = json_decode($conteudo, true);
$mensagem = strtolower(trim($dados['mensagem'] ?? ''));

// Se o usuário mandar vazio
if (empty($mensagem)) {
    echo json_encode(['sucesso' => true, 'resposta' => 'Desculpe, não entendi. Pode repetir?']);
    exit;
}

// Resposta padrão caso ela não encontre a palavra-chave
$resposta = "Não encontrei exatamente o que você procura. Mas fique à vontade para navegar pelo nosso catálogo de Produtos ou acessar sua Área do Cliente! 💡";

// ==============================================================
// MOTOR DE BUSCA INTERNO DA LÚCIA (100% LOCAL E BLINDADO)
// ==============================================================

if (strpos($mensagem, 'fita') !== false || strpos($mensagem, 'led') !== false) {
    $resposta = "Temos excelentes opções de **Fitas LED** (Branco Frio, Quente e RGB)! Para ver todas, clique no menu **Produtos** e selecione o filtro 'Fitas LED'. ✨";
} 
elseif (strpos($mensagem, 'spot') !== false || strpos($mensagem, 'embutir') !== false || strpos($mensagem, 'embutido') !== false) {
    $resposta = "Buscando por **Spots e Embutidos**? Nós temos modelos perfeitos para teto de gesso e sanca. Dê uma olhada na nossa aba de Produtos! 🎯";
} 
elseif (strpos($mensagem, 'lâmpada') !== false || strpos($mensagem, 'lampada') !== false) {
    $resposta = "Temos **Lâmpadas LED** de várias potências, super econômicas e duráveis. Você pode conferir nosso estoque completo acessando o Catálogo. 💡";
} 
elseif (strpos($mensagem, 'painel') !== false || strpos($mensagem, 'plafon') !== false) {
    $resposta = "Os **Painéis e Plafons LED** são ideais para iluminação geral e deixam o ambiente super moderno. Recomendo usar o filtro 'Painéis Plafon' na aba de Produtos! 🏢";
} 
elseif (strpos($mensagem, 'pedido') !== false || strpos($mensagem, 'status') !== false || strpos($mensagem, 'rastreio') !== false) {
    $resposta = "Para acompanhar o status do seu pedido, faça login e acesse o seu **Histórico de Compras** no seu Perfil. Lá você encontra todas as atualizações! 📦";
} 
elseif (strpos($mensagem, 'pagamento') !== false || strpos($mensagem, 'pix') !== false || strpos($mensagem, 'cartão') !== false) {
    $resposta = "Aceitamos pagamentos via **PIX (aprovação na hora)**, Boleto e Cartão de Crédito. Tudo com muita segurança para o seu projeto! 💳";
} 
elseif (strpos($mensagem, 'olá') !== false || strpos($mensagem, 'oi') !== false || strpos($mensagem, 'boa') !== false || strpos($mensagem, 'bom') !== false) {
    $resposta = "Olá! 👋 Sou a Lúcia, assistente virtual da JR Iluminação. Posso te ajudar a encontrar algum produto ou tirar dúvidas sobre o seu pedido?";
}

// Retorna a resposta para a tela
echo json_encode(['sucesso' => true, 'resposta' => $resposta]);
?>
