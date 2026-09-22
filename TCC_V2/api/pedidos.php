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

// === FUNÇÃO DE NOTIFICAÇÃO VIA TELEGRAM ===
function notificarAdminTelegram($mensagem) {
    $botToken = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
    $chatId   = "5034813131";
    
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    $dados = [
        'chat_id'    => $chatId,
        'text'       => $mensagem,
        'parse_mode' => 'HTML'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($dados));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    curl_exec($ch);
    curl_close($ch);
}

$host = 'aws-0-us-west-2.pooler.supabase.com';
$port = '5432';
$dbName = 'postgres';
$usuario = 'postgres.bfppcxnxqagpesuyjlhe';
$senha = 'An1bal_19691910@';

try {
    $dsn = "pgsql:host={$host};port={$port};dbname={$dbName};sslmode=require";
    $pdo = new PDO($dsn, $usuario, $senha, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 15
    ]);
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha no banco: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $acao = $dados['acao'] ?? '';
    
    if ($acao === 'criar') {
        try {
            $pdo->beginTransaction();

            $email = trim($dados['email'] ?? '');
            $nome = trim($dados['nome'] ?? '');
            $telefone = trim($dados['telefone'] ?? 'Não informado');
            $cep = trim($dados['cep'] ?? 'Não informado');
            $cidade = trim($dados['cidade'] ?? 'Não informada');
            $endereco = trim($dados['endereco'] ?? 'Não informado');
            $forma_pagamento = trim($dados['forma_pagamento'] ?? 'Não informada');
            $total = floatval($dados['total'] ?? 0);
            
            if (empty($email) || empty($nome)) {
                throw new Exception("Nome e e-mail do cliente são obrigatórios.");
            }
            
            $stmtBusca = $pdo->prepare("SELECT id FROM clientes WHERE LOWER(email) = LOWER(?)");
            $stmtBusca->execute([$email]);
            $cliente_id = $stmtBusca->fetchColumn();
            
            if (!$cliente_id) {
                $stmtNovoCli = $pdo->prepare("INSERT INTO clientes (nome, email, status) VALUES (?, ?, 'Ativo') RETURNING id");
                $stmtNovoCli->execute([$nome, $email]);
                $cliente_id = $stmtNovoCli->fetchColumn();
            }
            
            $stmtPedido = $pdo->prepare("INSERT INTO pedidos (cliente_id, total, status) VALUES (?, ?, 'Pendente') RETURNING id");
            $stmtPedido->execute([$cliente_id, $total]);
            $pedido_id = $stmtPedido->fetchColumn();
            
            $alertasEstoque = [];
            $listaItensMsg = "";

            if (!empty($dados['itens']) && is_array($dados['itens'])) {
                $stmtItem = $pdo->prepare("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)");
                $stmtEstoque = $pdo->prepare("UPDATE produtos SET quantidade = quantidade - ? WHERE id = ? RETURNING nome, quantidade");
                
                foreach ($dados['itens'] as $item) {
                    $qtd = intval($item['quantidade'] ?? 1);
                    $prodId = intval($item['id'] ?? 0);
                    $precoUnit = floatval($item['preco'] ?? 0);
                    $nomeItem = $item['nome'] ?? 'Produto';

                    $stmtItem->execute([$pedido_id, $prodId, $qtd, $precoUnit]);
                    
                    $stmtEstoque->execute([$qtd, $prodId]);
                    $prodAtualizado = $stmtEstoque->fetch(PDO::FETCH_ASSOC);

                    $subTotalItem = number_format($precoUnit * $qtd, 2, ',', '.');
                    $listaItensMsg .= "• {$qtd}x {$nomeItem} (R$ {$subTotalItem})\n";

                    if ($prodAtualizado) {
                        $novoEstoque = intval($prodAtualizado['quantidade']);
                        if ($novoEstoque <= 5) {
                            $alertasEstoque[] = [
                                'nome' => $prodAtualizado['nome'],
                                'restante' => $novoEstoque
                            ];
                        }
                    }
                }
            }
            
            $pdo->commit();

            // === NOTIFICAÇÃO COMPLETA DE NOVO PEDIDO ===
            $totalFormatado = number_format($total, 2, ',', '.');
            $dataHora = date('d/m/Y H:i');

            $msgNovoPedido  = "🎉 <b>NOVO PEDIDO RECEBIDO!</b>\n\n";
            $msgNovoPedido .= "🆔 <b>Pedido:</b> #{$pedido_id}\n";
            $msgNovoPedido .= "💰 <b>Valor Total:</b> R$ {$totalFormatado}\n";
            $msgNovoPedido .= "💳 <b>Pagamento:</b> " . htmlspecialchars($forma_pagamento) . "\n\n";
            $msgNovoPedido .= "👤 <b>DADOS DO CLIENTE:</b>\n";
            $msgNovoPedido .= "Nome: <i>" . htmlspecialchars($nome) . "</i>\n";
            $msgNovoPedido .= "Tel: <i>" . htmlspecialchars($telefone) . "</i>\n\n";
            $msgNovoPedido .= "📍 <b>ENDEREÇO DE ENTREGA:</b>\n";
            $msgNovoPedido .= htmlspecialchars($endereco) . " | " . htmlspecialchars($cidade) . " - CEP: " . htmlspecialchars($cep) . "\n\n";
            $msgNovoPedido .= "🛒 <b>ITENS DA COMPRA:</b>\n{$listaItensMsg}\n";

            notificarAdminTelegram($msgNovoPedido);

            foreach ($alertasEstoque as $alerta) {
                $msgEstoque  = "⚠️ <b>ALERTA DE ESTOQUE CRÍTICO!</b>\n\n";
                $msgEstoque .= "📦 <b>Produto:</b> " . htmlspecialchars($alerta['nome']) . "\n";
                $msgEstoque .= "📉 <b>Estoque Restante:</b> {$alerta['restante']} un.\n";
                notificarAdminTelegram($msgEstoque);
            }

            echo json_encode(['sucesso' => true, 'pedido_id' => $pedido_id], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    
    if ($acao === 'atualizar_status') {
        try {
            $stmt = $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?");
            $stmt->execute([$dados['status'], $dados['id']]);
            echo json_encode(['sucesso' => true], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    if ($acao === 'excluir') {
        try {
            $stmtItens = $pdo->prepare("DELETE FROM itens_pedido WHERE pedido_id = ?");
            $stmtItens->execute([$dados['id']]);
            $stmt = $pdo->prepare("DELETE FROM pedidos WHERE id = ?");
            $stmt->execute([$dados['id']]);
            echo json_encode(['sucesso' => true], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}

// 4. LER OS PEDIDOS (AGORA COM OS ITENS EMBUTIDOS VIA JSON_AGG DO POSTGRES)
if ($metodo === 'GET') {
    try {
        $baseQuery = "SELECT p.id, p.total, p.status, p.data_pedido, c.nome as cliente_nome, 
                             COALESCE((
                                 SELECT json_agg(json_build_object(
                                     'nome', COALESCE(pr.nome, 'Produto Excluído'), 
                                     'quantidade', ip.quantidade, 
                                     'preco', ip.preco_unitario
                                 )) 
                                 FROM itens_pedido ip 
                                 LEFT JOIN produtos pr ON ip.produto_id = pr.id 
                                 WHERE ip.pedido_id = p.id
                             ), '[]'::json) as itens_json 
                      FROM pedidos p 
                      LEFT JOIN clientes c ON p.cliente_id = c.id ";
                      
        if (isset($_GET['email'])) {
            $stmt = $pdo->prepare($baseQuery . "WHERE LOWER(c.email) = LOWER(?) ORDER BY p.data_pedido DESC");
            $stmt->execute([$_GET['email']]);
        } else {
            $stmt = $pdo->query($baseQuery . "ORDER BY p.data_pedido DESC");
        }
        
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decodifica o JSON gerado pelo banco para enviar como array limpo ao front
        foreach ($pedidos as &$p) {
            $p['itens'] = json_decode($p['itens_json'], true) ?: [];
            unset($p['itens_json']);
        }
        
        echo json_encode(['sucesso' => true, 'dados' => $pedidos], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
