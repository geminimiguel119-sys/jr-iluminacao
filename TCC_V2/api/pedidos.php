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
    curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Timeout para não prender o checkout
    curl_exec($ch);
    curl_close($ch);
}

// Configurações alinhadas com o Pooler IPv4 da região us-west-2
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
    echo json_encode([
        'sucesso' => false, 
        'erro' => 'Falha na conexão com o banco: ' . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true) ?: $_POST;
    $acao = $dados['acao'] ?? '';
    
    // 1. CRIAR NOVO PEDIDO, ITENS E DISPARAR NOTIFICAÇÕES
    if ($acao === 'criar') {
        try {
            $pdo->beginTransaction();

            $email = trim($dados['email'] ?? '');
            $nome = trim($dados['nome'] ?? '');
            $total = floatval($dados['total'] ?? 0);
            
            if (empty($email) || empty($nome)) {
                throw new Exception("Nome e e-mail do cliente são obrigatórios.");
            }
            
            // Passo A: Encontrar ou criar o "cliente" na tabela clientes
            $stmtBusca = $pdo->prepare("SELECT id FROM clientes WHERE LOWER(email) = LOWER(?)");
            $stmtBusca->execute([$email]);
            $cliente_id = $stmtBusca->fetchColumn();
            
            if (!$cliente_id) {
                $stmtNovoCli = $pdo->prepare("INSERT INTO clientes (nome, email, status) VALUES (?, ?, 'Ativo') RETURNING id");
                $stmtNovoCli->execute([$nome, $email]);
                $cliente_id = $stmtNovoCli->fetchColumn();
            }
            
            // Passo B: Grava o pedido
            $stmtPedido = $pdo->prepare("INSERT INTO pedidos (cliente_id, total, status) VALUES (?, ?, 'Pendente') RETURNING id");
            $stmtPedido->execute([$cliente_id, $total]);
            $pedido_id = $stmtPedido->fetchColumn();
            
            // Passo C: Grava os itens, desconta no estoque e prepara resumo
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

                    // Adiciona na lista do recibo para a notificação
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

            // === 1. NOTIFICAÇÃO DE NOVO PEDIDO RECEBIDO ===
            $totalFormatado = number_format($total, 2, ',', '.');
            $dataHora = date('d/m/Y H:i');

            $msgNovoPedido  = "🎉 <b>NOVO PEDIDO RECEBIDO!</b>\n\n";
            $msgNovoPedido .= "🆔 <b>Pedido:</b> #{$pedido_id}\n";
            $msgNovoPedido .= "💰 <b>Valor Total:</b> R$ {$totalFormatado}\n";
            $msgNovoPedido .= "👤 <b>Cliente:</b> " . htmlspecialchars($nome) . "\n";
            $msgNovoPedido .= "✉️ <b>E-mail:</b> " . htmlspecialchars($email) . "\n\n";
            $msgNovoPedido .= "🛒 <b>Itens Comprados:</b>\n{$listaItensMsg}\n";
            $msgNovoPedido .= "⏰ <b>Data/Hora:</b> {$dataHora}\n";
            $msgNovoPedido .= "🔗 <i>Gerencie no painel admin</i>";

            notificarAdminTelegram($msgNovoPedido);

            // === 2. NOTIFICAÇÃO DE ESTOQUE BAIXO (SE HOUVER) ===
            foreach ($alertasEstoque as $alerta) {
                $msgEstoque  = "⚠️ <b>ALERTA DE ESTOQUE CRÍTICO!</b>\n\n";
                $msgEstoque .= "📦 <b>Produto:</b> " . htmlspecialchars($alerta['nome']) . "\n";
                $msgEstoque .= "📉 <b>Estoque Restante:</b> {$alerta['restante']} unidades\n";
                $msgEstoque .= "🆔 <b>Impactado pelo pedido:</b> #{$pedido_id}\n";
                $msgEstoque .= "⏰ <b>Horário:</b> {$dataHora}";

                notificarAdminTelegram($msgEstoque);
            }

            echo json_encode(['sucesso' => true, 'pedido_id' => $pedido_id], JSON_UNESCAPED_UNICODE);
            exit;
        } catch (Exception $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
    
    // 2. ATUALIZAR STATUS NO PAINEL ADMIN
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

    // 3. EXCLUIR PEDIDO
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

// 4. LER OS PEDIDOS
if ($metodo === 'GET') {
    try {
        if (isset($_GET['email'])) {
            $stmt = $pdo->prepare("SELECT p.id, p.total, p.status, p.data_pedido, c.nome as cliente_nome 
                                   FROM pedidos p 
                                   JOIN clientes c ON p.cliente_id = c.id 
                                   WHERE LOWER(c.email) = LOWER(?) 
                                   ORDER BY p.data_pedido DESC");
            $stmt->execute([$_GET['email']]);
        } else {
            $stmt = $pdo->query("SELECT p.id, p.total, p.status, p.data_pedido, c.nome as cliente_nome 
                                 FROM pedidos p 
                                 LEFT JOIN clientes c ON p.cliente_id = c.id 
                                 ORDER BY p.data_pedido DESC");
        }
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['sucesso' => true, 'dados' => $pedidos], JSON_UNESCAPED_UNICODE);
        exit;
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
