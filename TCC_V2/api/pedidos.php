<?php
// api/pedidos.php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once 'config.php';
require_once 'conexao.php';

$pdo->exec("SET TIME ZONE 'America/Sao_Paulo'");

$telegramToken = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
$telegramChatId = "5034813131";

function notificarTelegram($msg, $token, $chatId) {
    if (empty($token)) return;
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $context = stream_context_create([
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query([
                'chat_id'    => $chatId,
                'text'       => $msg,
                'parse_mode' => 'Markdown'
            ]),
            'timeout' => 4
        ]
    ]);
    @file_get_contents($url, false, $context);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $email = $_GET['email'] ?? null;
    try {
        if ($email) {
            $stmt = $pdo->prepare("
                SELECT p.id, p.total, p.status, p.data_pedido 
                FROM pedidos p 
                JOIN clientes c ON p.cliente_id = c.id 
                WHERE LOWER(c.email) = LOWER(?) 
                ORDER BY p.id DESC
            ");
            $stmt->execute([$email]);
            $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($pedidos as &$ped) {
                $stmtItens = $pdo->prepare("
                    SELECT pr.nome, ip.quantidade, ip.preco_unitario as preco 
                    FROM itens_pedido ip 
                    JOIN produtos pr ON ip.produto_id = pr.id 
                    WHERE ip.pedido_id = ?
                ");
                $stmtItens->execute([$ped['id']]);
                $ped['itens'] = $stmtItens->fetchAll(PDO::FETCH_ASSOC);
            }
            echo json_encode(['sucesso' => true, 'dados' => $pedidos], JSON_UNESCAPED_UNICODE);
        } else {
            $stmt = $pdo->query("
                SELECT p.id, c.nome as cliente_nome, p.total, p.status, p.data_pedido 
                FROM pedidos p 
                LEFT JOIN clientes c ON p.cliente_id = c.id 
                ORDER BY p.id DESC
            ");
            echo json_encode(['sucesso' => true, 'dados' => $stmt->fetchAll(PDO::FETCH_ASSOC)], JSON_UNESCAPED_UNICODE);
        }
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true);
    $acao = $dados['acao'] ?? '';

    if ($acao === 'criar') {
        $email = sanitizar($dados['email'] ?? '');
        $nome = sanitizar($dados['nome'] ?? '');
        $telefone = sanitizar($dados['telefone'] ?? '');
        $total = floatval($dados['total'] ?? 0);
        $itens = $dados['itens'] ?? [];

        if (empty($email) || empty($itens)) {
            erro('Dados da encomenda incompletos.', 400);
        }

        try {
            $pdo->beginTransaction();

            // 1. Identificar ou registar o cliente
            $stmtCli = $pdo->prepare("SELECT id FROM clientes WHERE LOWER(email) = LOWER(?)");
            $stmtCli->execute([$email]);
            $cliente_id = $stmtCli->fetchColumn();

            if (!$cliente_id) {
                $stmtInsCli = $pdo->prepare("INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?) RETURNING id");
                $stmtInsCli->execute([$nome, $email, $telefone]);
                $cliente_id = $stmtInsCli->fetchColumn();
            } else {
                $stmtUpdCli = $pdo->prepare("UPDATE clientes SET telefone = COALESCE(NULLIF(?, ''), telefone) WHERE id = ?");
                $stmtUpdCli->execute([$telefone, $cliente_id]);
            }

            // 2. Verificar e baixar o stock de cada item
            foreach ($itens as $item) {
                $prodId = intval($item['id']);
                $qtdPedida = intval($item['quantidade']);

                $stmtEstoque = $pdo->prepare("SELECT nome, quantidade FROM produtos WHERE id = ? FOR UPDATE");
                $stmtEstoque->execute([$prodId]);
                $prodAtual = $stmtEstoque->fetch(PDO::FETCH_ASSOC);

                if (!$prodAtual) {
                    throw new Exception("Produto ID {$prodId} não encontrado no catálogo.");
                }

                if ($prodAtual['quantidade'] < $qtdPedida) {
                    throw new Exception("Stock insuficiente para '{$prodAtual['nome']}'. Disponível: {$prodAtual['quantidade']} un.");
                }

                // Deduz a quantidade vendida
                $stmtBaixa = $pdo->prepare("UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?");
                $stmtBaixa->execute([$qtdPedida, $prodId]);
            }

            // 3. Registar o Pedido
            $stmtPed = $pdo->prepare("INSERT INTO pedidos (cliente_id, total, status) VALUES (?, ?, 'Pendente') RETURNING id");
            $stmtPed->execute([$cliente_id, $total]);
            $pedido_id = $stmtPed->fetchColumn();

            // 4. Registar Itens da Encomenda
            $stmtItem = $pdo->prepare("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)");
            $resumoItens = "";
            foreach ($itens as $item) {
                $stmtItem->execute([$pedido_id, intval($item['id']), intval($item['quantidade']), floatval($item['preco'])]);
                $resumoItens .= "• {$item['quantidade']}x {$item['nome']}\n";
            }

            $pdo->commit();

            // 5. Notificação de Nova Venda no Telegram
            $msgTG = "🛒 *Nova Encomenda Registada! (#{$pedido_id})*\n\n";
            $msgTG .= "👤 *Cliente:* {$nome}\n";
            $msgTG .= "📧 *E-mail:* {$email}\n";
            $msgTG .= "💰 *Valor Total:* R$ " . number_format($total, 2, ',', '.') . "\n\n";
            $msgTG .= "*Itens Comprados:*\n" . $resumoItens;
            notificarTelegram($msgTG, $telegramToken, $telegramChatId);

            echo json_encode(['sucesso' => true, 'pedido_id' => $pedido_id], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            erro($e->getMessage(), 400);
        }
    } elseif ($acao === 'atualizar_status') {
        $id = intval($dados['id'] ?? 0);
        $status = sanitizar($dados['status'] ?? '');
        try {
            $stmt = $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            echo json_encode(['sucesso' => true], JSON_UNESCAPED_UNICODE);
        } catch (PDOException $e) {
            erro($e->getMessage(), 400);
        }
    } elseif ($acao === 'excluir') {
        $id = intval($dados['id'] ?? 0);
        try {
            $pdo->beginTransaction();
            $pdo->prepare("DELETE FROM itens_pedido WHERE pedido_id = ?")->execute([$id]);
            $pdo->prepare("DELETE FROM pedidos WHERE id = ?")->execute([$id]);
            $pdo->commit();
            echo json_encode(['sucesso' => true], JSON_UNESCAPED_UNICODE);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            erro($e->getMessage(), 400);
        }
    }
}
?>
