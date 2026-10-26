<?php
// api/cron-pagamentos.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexao.php';

// Proteção simples para evitar abusos (opcional, pode passar um token na URL)
$token_esperado = getenv('TELEGRAM_WEBHOOK_SECRET') ?: 'JR_Segredo_Webhook_2026_TCC';
$token_recebido = $_GET['token'] ?? '';

if ($token_recebido !== $token_esperado) {
    http_response_code(403);
    die("Acesso negado.");
}

try {
    // Procura pedidos "Pendentes" feitos há mais de 2 minutos
    $sql = "SELECT p.id, c.nome, p.total 
            FROM pedidos p
            JOIN clientes c ON p.cliente_id = c.id
            WHERE p.status = 'Pendente' 
            AND p.data_pedido <= NOW() - INTERVAL '2 minutes'";
            
    $stmt = $pdo->query($sql);
    $pedidosAprovados = $stmt->fetchAll();

    if (count($pedidosAprovados) > 0) {
        // Atualiza todos para "Em processamento" (Pagamento Confirmado)
        $pdo->query("UPDATE pedidos SET status = 'Em processamento' WHERE status = 'Pendente' AND data_pedido <= NOW() - INTERVAL '2 minutes'");

        // Avisa o Administrador no Telegram
        foreach ($pedidosAprovados as $ped) {
            $totalFormatado = number_format((float)$ped['total'], 2, ',', '.');
            $msg = "💰 <b>PAGAMENTO APROVADO (Simulação)</b>\n\n";
            $msg .= "🧾 <b>Pedido:</b> #{$ped['id']}\n";
            $msg .= "👤 <b>Cliente:</b> {$ped['nome']}\n";
            $msg .= "💵 <b>Valor:</b> R$ {$totalFormatado}\n\n";
            $msg .= "✅ <i>Status atualizado para 'Em processamento'.</i>";
            
            enviarNotificacaoTelegram($msg);
        }
        
        echo "Foram aprovados " . count($pedidosAprovados) . " pedido(s).";
    } else {
        echo "Nenhum pedido pendente aguardando simulação.";
    }

} catch (Exception $e) {
    error_log("[JR Cron Pagamentos] Erro: " . $e->getMessage());
    echo "Erro ao processar pagamentos.";
}
?>
