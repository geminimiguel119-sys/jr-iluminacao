<?php
// api/cron-diario.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexao.php';

// Proteção para evitar execuções indevidas
$token_esperado = getenv('TELEGRAM_WEBHOOK_SECRET') ?: 'JR_Segredo_Webhook_2026_TCC';
$token_recebido = $_GET['token'] ?? '';

if ($token_recebido !== $token_esperado) {
    http_response_code(403);
    die("Acesso negado.");
}

try {
    // 1. Vendas de Ontem
    $sqlVendas = "SELECT COUNT(id) as qtd_pedidos, COALESCE(SUM(total), 0) as faturamento 
                  FROM pedidos 
                  WHERE status != 'Cancelado' 
                  AND DATE(data_pedido) = CURRENT_DATE - INTERVAL '1 day'";
    $vendas = $pdo->query($sqlVendas)->fetch();
    $faturamento = number_format((float)$vendas['faturamento'], 2, ',', '.');

    // 2. Clientes Pendentes
    $sqlPendentes = "SELECT COUNT(id) as total FROM usuarios WHERE status = 'Pendente' AND role = 'cliente'";
    $pendentes = $pdo->query($sqlPendentes)->fetch();

    // 3. Produtos em Estado Crítico (Preditivo)
    $sqlCriticos = "
        SELECT p.id, p.nome, COALESCE(p.quantidade, 0) AS qtd
        FROM produtos p
        LEFT JOIN itens_pedido ip ON ip.produto_id = p.id
        LEFT JOIN pedidos ped ON ped.id = ip.pedido_id
        GROUP BY p.id, p.nome, p.quantidade
        HAVING COALESCE(p.quantidade, 0) <= 5 
            OR COALESCE(p.quantidade, 0) <= (ROUND((COALESCE(SUM(CASE WHEN ped.id IS NOT NULL AND ped.status != 'Cancelado' AND ped.data_pedido >= NOW() - INTERVAL '30 days' THEN ip.quantidade ELSE 0 END), 0) / 30.0) * 5) + 2)
    ";
    $criticos = $pdo->query($sqlCriticos)->fetchAll();
    $qtdCriticos = count($criticos);

    // 4. Montar a Mensagem de Bom Dia
    $msg = "🌅 <b>Bom dia, Administrador!</b>\n";
    $msg .= "<i>Aqui está o resumo automático da JR Iluminação:</i>\n\n";

    $msg .= "📈 <b>Vendas de Ontem:</b>\n";
    $msg .= "• Pedidos: {$vendas['qtd_pedidos']}\n";
    $msg .= "• Faturamento: R$ {$faturamento}\n\n";

    if ($pendentes['total'] > 0) {
        $msg .= "⏳ <b>Cadastros Pendentes:</b> {$pendentes['total']} cliente(s). Envie /pendentes para aprovar.\n\n";
    } else {
        $msg .= "✅ <b>Cadastros:</b> Nenhuma conta pendente.\n\n";
    }

    if ($qtdCriticos > 0) {
        $msg .= "⚠️ <b>Atenção ao Estoque:</b> {$qtdCriticos} produto(s) entraram no ponto crítico de reposição. Envie /criticos para ver a lista.\n";
    } else {
        $msg .= "📦 <b>Estoque:</b> Saudável e sem previsões de ruptura imediatas.\n";
    }

    // Envia para o Telegram
    enviarNotificacaoTelegram($msg);
    echo "Relatório diário enviado com sucesso!";

} catch (Exception $e) {
    error_log("[JR Cron Diario] Erro: " . $e->getMessage());
    echo "Erro ao gerar o relatório diário.";
}
?>
