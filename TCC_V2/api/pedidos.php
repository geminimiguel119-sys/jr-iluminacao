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

// Fuso horário de Brasília
$pdo->exec("SET TIME ZONE 'America/Sao_Paulo'");

// Credenciais do Bot do Telegram (Atualizado com o novo Token)
$telegramToken = "8700166269:AAEgnRWKyNT8Uw8EppsNK7VVSmyHYF9YlYY";
$telegramChatId = "5034813131";

// Função blindada usando cURL (padrão da indústria e aceito pelo Render)
function notificarTelegramHTML($msg, $token, $chatId) {
    if (empty($token) || empty($chatId)) return false;
    
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'chat_id'    => $chatId,
        'text'       => $msg,
        'parse_mode' => 'HTML'
    ]));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Evita erros de certificado HTTPS no Render
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $resultado = curl_exec($ch);
    curl_close($ch);
    
    return $resultado ? true : false;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $email = $_GET['email'] ?? null;
    try {
        if ($email) {
            // Busca os pedidos específicos do cliente logado
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
                // Busca os itens de cada pedido
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
            // Lista todos os pedidos para o painel admin
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
        $cidade = sanitizar($dados['cidade'] ?? '');
        $endereco = sanitizar($dados['endereco'] ?? '');
        $total = floatval($dados['total'] ?? 0);
        $itens = $dados['itens'] ?? [];

        if (empty($email) || empty($itens)) {
            erro('Os dados do pedido estão incompletos.', 400);
        }

        try {
            $pdo->beginTransaction();

            // 1. Verifica ou cria o cliente
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

            // 2. Validação de Estoque (Evita vender o que não tem)
            foreach ($itens as $item) {
                $prodId = intval($item['id']);
                $qtdPedida = intval($item['quantidade']);

                $stmtEstoque = $pdo->prepare("SELECT nome, quantidade FROM produtos WHERE id = ? FOR UPDATE");
                $stmtEstoque->execute([$prodId]);
                $prodAtual = $stmtEstoque->fetch(PDO::FETCH_ASSOC);

                if (!$prodAtual) {
                    throw new Exception("O produto de ID {$prodId} não foi encontrado no catálogo.");
                }

                if ($prodAtual['quantidade'] < $qtdPedida) {
                    throw new Exception("Estoque insuficiente para '{$prodAtual['nome']}'. Disponível: {$prodAtual['quantidade']} unidades.");
                }

                // Dá baixa no estoque
                $stmtBaixa = $pdo->prepare("UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?");
                $stmtBaixa->execute([$qtdPedida, $prodId]);
            }

            // 3. Cria o pedido principal
            $stmtPed = $pdo->prepare("INSERT INTO pedidos (cliente_id, total, status) VALUES (?, ?, 'Pendente') RETURNING id");
            $stmtPed->execute([$cliente_id, $total]);
            $pedido_id = $stmtPed->fetchColumn();

            // 4. Salva os itens do pedido
            $stmtItem = $pdo->prepare("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)");
            $resumoItens = "";
            foreach ($itens as $item) {
                $stmtItem->execute([$pedido_id, intval($item['id']), intval($item['quantidade']), floatval($item['preco'])]);
                $resumoItens .= "🛒 " . htmlspecialchars($item['quantidade']) . "x " . htmlspecialchars($item['nome']) . "\n";
            }

            $pdo->commit();

            // 5. Notificação Elegante no Telegram (Administrador)
            $msgTG = "🎉 <b>NOVO PEDIDO REGISTRADO! (#{$pedido_id})</b>\n";
            $msgTG .= "━━━━━━━━━━━━━━━━━━━━━━\n";
            $msgTG .= "👤 <b>Cliente:</b> " . htmlspecialchars($nome) . "\n";
            $msgTG .= "📧 <b>E-mail:</b> " . htmlspecialchars($email) . "\n";
            if (!empty($telefone)) $msgTG .= "📞 <b>Contato:</b> " . htmlspecialchars($telefone) . "\n";
            if (!empty($cidade)) {
                $msgTG .= "📍 <b>Destino:</b> " . htmlspecialchars($cidade) . "\n";
                $msgTG .= "🏠 <b>Endereço:</b> " . htmlspecialchars($endereco) . "\n";
            }
            $msgTG .= "━━━━━━━━━━━━━━━━━━━━━━\n";
            $msgTG .= "💰 <b>Valor Total:</b> R$ " . number_format($total, 2, ',', '.') . "\n\n";
            $msgTG .= "<b>RESUMO DOS ITENS:</b>\n" . $resumoItens;

            notificarTelegramHTML($msgTG, $telegramToken, $telegramChatId);

            echo json_encode(['sucesso' => true, 'pedido_id' => $pedido_id], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            erro($e->getMessage(), 400);
        }
    } elseif ($acao === 'atualizar_status') {
        // Atualiza a etapa do pedido
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
        // Apaga o pedido (Para o Admin)
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
