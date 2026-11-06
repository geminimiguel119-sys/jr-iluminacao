<?php
// TCC_V2/api/telegram-bot.php
header('Content-Type: application/json; charset=utf-8');

// ==========================================
// CREDENCIAIS OFICIAIS
// ==========================================
$token = "8700166269:AAEgnRWKyNT8Uw8EppsNK7VVSmyHYF9YlYY";
$chatIdAutorizado = "5034813131";

$conteudo = file_get_contents("php://input");
$update = json_decode($conteudo, true);

if (!$update) {
    exit;
}

// Conexão com o Supabase PostgreSQL
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
    $pdo->exec("SET TIME ZONE 'America/Sao_Paulo'");
} catch (PDOException $e) {
    exit;
}

// ==========================================
// 1. TRATAMENTO DE CLIQUES EM BOTÕES INLINE (CALLBACK)
// ==========================================
if (isset($update['callback_query'])) {
    $callback = $update['callback_query'];
    $callbackId = $callback['id'];
    $chatId = $callback['message']['chat']['id'];
    $messageId = $callback['message']['message_id'];
    $dados = $callback['data'];

    if ((string)$chatId !== (string)$chatIdAutorizado) {
        responderAlertaCallback($callbackId, "⛔ Acesso negado.", $token, true);
        exit;
    }

    // --- APROVAR / RECUSAR CONTAS ---
    if (strpos($dados, 'aprovar_') === 0) {
        $idAlvo = intval(str_replace('aprovar_', '', $dados));
        $pdo->prepare("UPDATE usuarios SET status = 'Aprovado' WHERE id = ?")->execute([$idAlvo]);
        responderAlertaCallback($callbackId, "✅ Conta #{$idAlvo} aprovada com sucesso!", $token, true);
    } 
    elseif (strpos($dados, 'recusar_') === 0) {
        $idAlvo = intval(str_replace('recusar_', '', $dados));
        $pdo->prepare("UPDATE usuarios SET status = 'Recusado' WHERE id = ?")->execute([$idAlvo]);
        responderAlertaCallback($callbackId, "❌ Conta #{$idAlvo} recusada/arquivada.", $token, true);
    }
    
    // --- EXCLUIR PRODUTO ---
    elseif (strpos($dados, 'delprod_') === 0) {
        $idProd = intval(str_replace('delprod_', '', $dados));
        $pdo->prepare("DELETE FROM produtos WHERE id = ?")->execute([$idProd]);
        responderAlertaCallback($callbackId, "🗑️ Produto #{$idProd} excluído do catálogo!", $token, true);
    }

    // --- MUDAR STATUS DO PEDIDO ---
    elseif (strpos($dados, 'status_') === 0) {
        $partes = explode('_', $dados);
        if(count($partes) >= 3) {
            $idPedido = intval($partes[1]);
            $novoStatus = $partes[2];
            
            if ($novoStatus == 'EmProcessamento') $novoStatus = 'Em processamento';

            $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?")->execute([$novoStatus, $idPedido]);
            responderAlertaCallback($callbackId, "✅ Pedido #{$idPedido} atualizado para: {$novoStatus}!\nA linha do tempo no site já andou.", $token, true);
        }
    }

    // --- NAVEGAÇÃO DOS BOTÕES DO MENU PRINCIPAL ---
    elseif ($dados === 'cmd_resumo') { processarComando('/resumo', $chatId, $pdo, $token); responderAlertaCallback($callbackId, "Carregando resumo...", $token); }
    elseif ($dados === 'cmd_pendentes') { processarComando('/pendentes', $chatId, $pdo, $token); responderAlertaCallback($callbackId, "Buscando pendentes...", $token); }
    elseif ($dados === 'cmd_produtos') { processarComando('/produtos', $chatId, $pdo, $token); responderAlertaCallback($callbackId, "Listando produtos...", $token); }
    elseif ($dados === 'cmd_pedidos') { processarComando('/pedidos', $chatId, $pdo, $token); responderAlertaCallback($callbackId, "Buscando pedidos...", $token); }
    elseif ($dados === 'cmd_criticos') { processarComando('/criticos', $chatId, $pdo, $token); responderAlertaCallback($callbackId, "Verificando estoque...", $token); }
    
    exit;
}

// ==========================================
// 2. PROCESSAMENTO DE COMANDOS DE TEXTO
// ==========================================
if (isset($update['message'])) {
    $chatId = $update['message']['chat']['id'];
    $texto = trim($update['message']['text'] ?? '');

    if ((string)$chatId !== (string)$chatIdAutorizado) {
        enviarMensagem($chatId, "⛔ <b>Acesso Restrito.</b>", $token);
        exit;
    }

    $partes = explode(' ', $texto);
    $comando = strtolower($partes[0]);
    processarComando($comando, $chatId, $pdo, $token, $partes, $texto);
}

// ==========================================
// 3. NÚCLEO DE FUNÇÕES (LISTAS UNIFICADAS)
// ==========================================
function processarComando($comando, $chatId, $pdo, $token, $partes = [], $textoOriginal = '') {
    switch ($comando) {
        case '/start':
        case '/ajuda':
        case '/menu':
            $resposta = "💡 <b>Painel ERP - JR Iluminação</b>\n";
            $resposta .= "Selecione uma opção abaixo ou utilize comandos rápidos:\n\n";
            $resposta .= "🔍 <code>/busca [nome]</code>\n📦 <code>/estoque [ID] [QTD]</code>\n💵 <code>/preco [ID] [VALOR]</code>\n📢 <code>/aviso [texto]</code>";
            
            $teclado = [
                'inline_keyboard' => [
                    [['text' => '📊 Resumo', 'callback_data' => 'cmd_resumo'], ['text' => '📦 Produtos', 'callback_data' => 'cmd_produtos']],
                    [['text' => '🛍️ Pedidos', 'callback_data' => 'cmd_pedidos'], ['text' => '⏳ Pendentes', 'callback_data' => 'cmd_pendentes']],
                    [['text' => '⚠️ Estoque Crítico', 'callback_data' => 'cmd_criticos']]
                ]
            ];
            enviarMensagemComBotoes($chatId, $resposta, $teclado, $token);
            break;

        case '/resumo':
            $pedidos = $pdo->query("SELECT COUNT(id) as total, COALESCE(SUM(total), 0) as fat FROM pedidos WHERE status != 'Cancelado'")->fetch();
            $estoque = $pdo->query("SELECT COALESCE(SUM(quantidade), 0) as total FROM produtos")->fetch();
            $clientes = $pdo->query("SELECT COUNT(id) as total FROM usuarios WHERE role = 'cliente'")->fetch();
            $faturacao = number_format($pedidos['fat'], 2, ',', '.');
            
            $resposta = "📊 <b>DASHBOARD EM TEMPO REAL</b>\n━━━━━━━━━━━━━━━━━━━━\n";
            $resposta .= "💰 <b>Faturamento:</b> R$ {$faturacao}\n🛍️ <b>Vendas Concluídas:</b> {$pedidos['total']} pedidos\n📦 <b>Estoque Geral:</b> {$estoque['total']} unidades\n👥 <b>Base de Clientes:</b> {$clientes['total']} cadastros";
            enviarMensagem($chatId, $resposta, $token);
            break;

        case '/pedidos':
            $stmt = $pdo->query("SELECT p.id, c.nome, p.total, p.status FROM pedidos p JOIN clientes c ON p.cliente_id = c.id WHERE p.status != 'Entregue' ORDER BY p.data_pedido DESC LIMIT 5");
            $ultimos = $stmt->fetchAll();

            if (empty($ultimos)) {
                enviarMensagem($chatId, "✅ Nenhum pedido pendente de envio no momento.", $token);
            } else {
                $resposta = "🛍️ <b>GERENCIAR PEDIDOS EM ABERTO</b>\n━━━━━━━━━━━━━━━━━━━━\n";
                $botoes = [];
                
                foreach ($ultimos as $p) {
                    $valor = number_format($p['total'], 2, ',', '.');
                    $resposta .= "🧾 <b>#{$p['id']}</b> | {$p['nome']} | R$ {$valor} | <i>{$p['status']}</i>\n";

                    if ($p['status'] == 'Pendente') {
                        $botoes[] = [
                            ['text' => "✅ Conf. Pagto #{$p['id']}", 'callback_data' => 'status_' . $p['id'] . '_EmProcessamento'],
                            ['text' => "❌ Cancelar #{$p['id']}", 'callback_data' => 'status_' . $p['id'] . '_Cancelado']
                        ];
                    } elseif ($p['status'] == 'Em processamento') {
                        $botoes[] = [['text' => "🚚 Despachar (Enviar) #{$p['id']}", 'callback_data' => 'status_' . $p['id'] . '_Enviado']];
                    } elseif ($p['status'] == 'Enviado') {
                        $botoes[] = [['text' => "📦 Marcar como Entregue #{$p['id']}", 'callback_data' => 'status_' . $p['id'] . '_Entregue']];
                    }
                }
                $resposta .= "\n<i>Clique no botão correspondente abaixo para avançar a linha do tempo do cliente:</i>";
                $teclado = ['inline_keyboard' => $botoes];
                enviarMensagemComBotoes($chatId, $resposta, $teclado, $token);
            }
            break;

        case '/pendentes':
            $stmt = $pdo->query("SELECT id, nome, email FROM usuarios WHERE status = 'Pendente' AND role = 'cliente' ORDER BY id ASC LIMIT 5");
            $pendentes = $stmt->fetchAll();
            
            if (empty($pendentes)) {
                enviarMensagem($chatId, "✅ Nenhuma conta aguardando aprovação.", $token);
            } else {
                $resposta = "⏳ <b>CONTAS PENDENTES</b>\n━━━━━━━━━━━━━━━━━━━━\n";
                $botoes = [];
                
                foreach ($pendentes as $p) {
                    $resposta .= "👤 <b>#{$p['id']}</b> | {$p['nome']} ({$p['email']})\n";
                    $botoes[] = [
                        ['text' => "✅ Aprovar #{$p['id']}", 'callback_data' => 'aprovar_' . $p['id']],
                        ['text' => "❌ Recusar #{$p['id']}", 'callback_data' => 'recusar_' . $p['id']]
                    ];
                }
                $teclado = ['inline_keyboard' => $botoes];
                enviarMensagemComBotoes($chatId, $resposta, $teclado, $token);
            }
            break;

        case '/produtos':
            $stmt = $pdo->query("SELECT id, nome, preco, quantidade FROM produtos ORDER BY id DESC LIMIT 5");
            $produtos = $stmt->fetchAll();
            
            if (empty($produtos)) {
                enviarMensagem($chatId, "📦 Catálogo vazio.", $token);
            } else {
                $resposta = "📦 <b>CATÁLOGO (Últimos 5)</b>\n━━━━━━━━━━━━━━━━━━━━\n";
                $botoes = [];
                
                foreach ($produtos as $p) {
                    $precoFmt = number_format($p['preco'], 2, ',', '.');
                    $resposta .= "💡 <b>#{$p['id']}</b> | {$p['nome']} | R$ {$precoFmt} | Est: {$p['quantidade']} un.\n";
                    $botoes[] = [['text' => "🗑️ Excluir #{$p['id']}", 'callback_data' => 'delprod_' . $p['id']]];
                }
                $teclado = ['inline_keyboard' => $botoes];
                enviarMensagemComBotoes($chatId, $resposta, $teclado, $token);
            }
            break;

        // Comandos de Busca, Preço e Estoque mantêm-se iguais
        case '/busca':
            $termoBusca = trim(str_replace('/busca', '', $textoOriginal));
            if (empty($termoBusca)) break;
            $stmt = $pdo->prepare("SELECT id, nome, preco, quantidade FROM produtos WHERE nome ILIKE ? LIMIT 5");
            $stmt->execute(["%{$termoBusca}%"]);
            $resultados = $stmt->fetchAll();
            if (empty($resultados)) { enviarMensagem($chatId, "🔍 Nada encontrado.", $token); } 
            else {
                $resposta = "🔍 <b>RESULTADOS DA BUSCA:</b>\n";
                foreach ($resultados as $p) { $resposta .= "🆔 {$p['id']} | 💡 {$p['nome']} | 💵 R$ " . number_format($p['preco'], 2, ',', '.') . " | 📦 {$p['quantidade']} un.\n"; }
                enviarMensagem($chatId, $resposta, $token);
            }
            break;

        case '/estoque':
            if (count($partes) === 3) {
                $pdo->prepare("UPDATE produtos SET quantidade = ? WHERE id = ?")->execute([intval($partes[2]), intval($partes[1])]);
                enviarMensagem($chatId, "✅ <b>Estoque Atualizado!</b>", $token);
            }
            break;

        case '/preco':
            if (count($partes) === 3) {
                $pdo->prepare("UPDATE produtos SET preco = ? WHERE id = ?")->execute([floatval(str_replace(',', '.', $partes[2])), intval($partes[1])]);
                enviarMensagem($chatId, "✅ <b>Preço Atualizado!</b>", $token);
            }
            break;

        default:
            if (strpos($comando, '/') === 0) enviarMensagem($chatId, "🤔 Comando não reconhecido.\nEnvie /menu", $token);
            break;
    }
}

// ==========================================
// 4. FUNÇÕES AUXILIARES DA API DO TELEGRAM
// ==========================================
function enviarMensagem($chatId, $texto, $token) {
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $dados = ['chat_id' => $chatId, 'text' => $texto, 'parse_mode' => 'HTML'];
    chamarApiTelegram($url, $dados);
}

function enviarMensagemComBotoes($chatId, $texto, $teclado, $token) {
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $dados = ['chat_id' => $chatId, 'text' => $texto, 'parse_mode' => 'HTML', 'reply_markup' => json_encode($teclado)];
    chamarApiTelegram($url, $dados);
}

function responderAlertaCallback($callbackId, $texto, $token, $showAlert = false) {
    $url = "https://api.telegram.org/bot{$token}/answerCallbackQuery";
    $dados = ['callback_query_id' => $callbackId, 'text' => $texto, 'show_alert' => $showAlert];
    chamarApiTelegram($url, $dados);
}

function chamarApiTelegram($url, $dados) {
    $opcoes = [
        'http' => [
            'method'  => 'POST',
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'content' => http_build_query($dados),
            'timeout' => 4
        ]
    ];
    @file_get_contents($url, false, stream_context_create($opcoes));
}
