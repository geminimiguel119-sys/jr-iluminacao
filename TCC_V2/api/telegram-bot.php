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

    // Trava de segurança
    if ((string)$chatId !== (string)$chatIdAutorizado) {
        responderAlertaCallback($callbackId, "⛔ Acesso negado à administração.", $token);
        exit;
    }

    // --- APROVAR / RECUSAR CONTAS ---
    if (strpos($dados, 'aprovar_') === 0) {
        $idAlvo = intval(str_replace('aprovar_', '', $dados));
        $stmt = $pdo->prepare("SELECT nome, email FROM usuarios WHERE id = ?");
        $stmt->execute([$idAlvo]);
        $user = $stmt->fetch();

        if ($user) {
            $pdo->prepare("UPDATE usuarios SET status = 'Aprovado' WHERE id = ?")->execute([$idAlvo]);
            $novoTexto = "✅ <b>CONTA APROVADA COM SUCESSO</b>\n━━━━━━━━━━━━━━━━━━━━\n👤 <b>Cliente:</b> {$user['nome']}\n📧 <b>E-mail:</b> {$user['email']}\n🔓 <i>Acesso liberado para compras.</i>";
            editarMensagem($chatId, $messageId, $novoTexto, $token);
            responderAlertaCallback($callbackId, "Conta #{$idAlvo} aprovada!", $token);
        }
    } 
    elseif (strpos($dados, 'recusar_') === 0) {
        $idAlvo = intval(str_replace('recusar_', '', $dados));
        $pdo->prepare("UPDATE usuarios SET status = 'Recusado' WHERE id = ?")->execute([$idAlvo]);
        editarMensagem($chatId, $messageId, "❌ <b>ACESSO RECUSADO</b>\n━━━━━━━━━━━━━━━━━━━━\n🔒 <i>Cadastro ID #{$idAlvo} arquivado/reprovado.</i>", $token);
        responderAlertaCallback($callbackId, "Conta recusada.", $token);
    }
    
    // --- EXCLUIR PRODUTO ---
    elseif (strpos($dados, 'delprod_') === 0) {
        $idProd = intval(str_replace('delprod_', '', $dados));
        $pdo->prepare("DELETE FROM produtos WHERE id = ?")->execute([$idProd]);
        editarMensagem($chatId, $messageId, "🗑️ <b>Produto #{$idProd} excluído com sucesso do catálogo!</b>", $token);
        responderAlertaCallback($callbackId, "Produto removido!", $token);
    }

    // --- MUDAR STATUS DO PEDIDO (STEPER INTERATIVO) ---
    elseif (strpos($dados, 'status_') === 0) {
        // Exemplo de dado: status_2_Enviado (onde 2 é o ID do pedido)
        $partes = explode('_', $dados);
        if(count($partes) >= 3) {
            $idPedido = intval($partes[1]);
            $novoStatus = $partes[2];
            
            // Para lidar com espaços no status "Em processamento"
            if ($novoStatus == 'EmProcessamento') $novoStatus = 'Em processamento';

            $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?")->execute([$novoStatus, $idPedido]);
            
            // Ícone baseado no status
            $icon = '📌';
            if ($novoStatus == 'Em processamento') $icon = '📦';
            if ($novoStatus == 'Enviado') $icon = '🚚';
            if ($novoStatus == 'Entregue') $icon = '✅';
            if ($novoStatus == 'Cancelado') $icon = '❌';

            editarMensagem($chatId, $messageId, "{$icon} <b>Pedido #{$idPedido} atualizado!</b>\nO novo status agora é: <b>{$novoStatus}</b>\n<i>O cliente já consegue ver essa atualização no site (Linha do Tempo).</i>", $token);
            responderAlertaCallback($callbackId, "Status alterado para {$novoStatus}!", $token);
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
        enviarMensagem($chatId, "⛔ <b>Acesso Restrito.</b>\nEste bot pertence à administração da JR Iluminação.", $token);
        exit;
    }

    $partes = explode(' ', $texto);
    $comando = strtolower($partes[0]);
    processarComando($comando, $chatId, $pdo, $token, $partes, $texto);
}

// ==========================================
// 3. NÚCLEO DE FUNÇÕES (CRUD, BUSCA E BROADCAST)
// ==========================================
function processarComando($comando, $chatId, $pdo, $token, $partes = [], $textoOriginal = '') {
    switch ($comando) {
        case '/start':
        case '/ajuda':
        case '/menu':
            $resposta = "💡 <b>Painel ERP - JR Iluminação</b>\n";
            $resposta .= "Selecione uma opção abaixo ou utilize os novos comandos rápidos:\n\n";
            $resposta .= "🔍 <code>/busca [nome]</code> - Achar um produto\n";
            $resposta .= "📦 <code>/estoque [ID] [QTD]</code> - Mudar quantidade\n";
            $resposta .= "💵 <code>/preco [ID] [VALOR]</code> - Mudar preço\n";
            $resposta .= "📢 <code>/aviso [texto]</code> - Disparar mensagem\n";
            
            $teclado = [
                'inline_keyboard' => [
                    [
                        ['text' => '📊 Resumo', 'callback_data' => 'cmd_resumo'],
                        ['text' => '📦 Produtos', 'callback_data' => 'cmd_produtos']
                    ],
                    [
                        ['text' => '🛍️ Pedidos', 'callback_data' => 'cmd_pedidos'],
                        ['text' => '⏳ Pendentes', 'callback_data' => 'cmd_pendentes']
                    ],
                    [
                        ['text' => '⚠️ Estoque Crítico', 'callback_data' => 'cmd_criticos']
                    ]
                ]
            ];
            enviarMensagemComBotoes($chatId, $resposta, $teclado, $token);
            break;

        // --- DASHBOARD ---
        case '/resumo':
            $pedidos = $pdo->query("SELECT COUNT(id) as total, COALESCE(SUM(total), 0) as fat FROM pedidos WHERE status != 'Cancelado'")->fetch();
            $estoque = $pdo->query("SELECT COALESCE(SUM(quantidade), 0) as total FROM produtos")->fetch();
            $clientes = $pdo->query("SELECT COUNT(id) as total FROM usuarios WHERE role = 'cliente'")->fetch();
            $faturacao = number_format($pedidos['fat'], 2, ',', '.');
            
            $resposta = "📊 <b>DASHBOARD EM TEMPO REAL</b>\n━━━━━━━━━━━━━━━━━━━━\n";
            $resposta .= "💰 <b>Faturamento:</b> R$ {$faturacao}\n";
            $resposta .= "🛍️ <b>Vendas Concluídas:</b> {$pedidos['total']} pedidos\n";
            $resposta .= "📦 <b>Estoque Geral:</b> {$estoque['total']} unidades\n";
            $resposta .= "👥 <b>Base de Clientes:</b> {$clientes['total']} cadastros\n";
            enviarMensagem($chatId, $resposta, $token);
            break;

        // --- BUSCA RÁPIDA DE PRODUTO ---
        case '/busca':
            $termoBusca = trim(str_replace('/busca', '', $textoOriginal));
            if (empty($termoBusca)) {
                enviarMensagem($chatId, "⚠️ Formato incorreto. Use:\n<code>/busca [Nome do Produto]</code>\nExemplo: <code>/busca Fita LED</code>", $token);
                break;
            }

            $stmt = $pdo->prepare("SELECT id, nome, preco, quantidade FROM produtos WHERE nome ILIKE ? LIMIT 5");
            $stmt->execute(["%{$termoBusca}%"]);
            $resultados = $stmt->fetchAll();

            if (empty($resultados)) {
                enviarMensagem($chatId, "🔍 Nenhum produto encontrado com o nome '{$termoBusca}'.", $token);
            } else {
                $resposta = "🔍 <b>RESULTADOS DA BUSCA:</b>\n━━━━━━━━━━━━━━━━━━━━\n";
                foreach ($resultados as $p) {
                    $precoFormatado = number_format($p['preco'], 2, ',', '.');
                    $resposta .= "🆔 <b>ID:</b> {$p['id']}\n";
                    $resposta .= "💡 <b>Nome:</b> {$p['nome']}\n";
                    $resposta .= "💵 <b>Preço:</b> R$ {$precoFormatado}\n";
                    $resposta .= "📦 <b>Estoque:</b> {$p['quantidade']} un.\n\n";
                }
                enviarMensagem($chatId, $resposta, $token);
            }
            break;

        // --- ATUALIZAR ESTOQUE RÁPIDO ---
        case '/estoque':
            if (count($partes) !== 3) {
                enviarMensagem($chatId, "⚠️ Formato incorreto. Use:\n<code>/estoque [ID_PRODUTO] [NOVA_QUANTIDADE]</code>\nExemplo: <code>/estoque 15 50</code>", $token);
                break;
            }
            $idProd = intval($partes[1]);
            $novaQtd = intval($partes[2]);
            
            $stmt = $pdo->prepare("UPDATE produtos SET quantidade = ? WHERE id = ? RETURNING nome");
            $stmt->execute([$novaQtd, $idProd]);
            $prod = $stmt->fetch();
            
            if ($prod) {
                enviarMensagem($chatId, "✅ <b>Estoque Atualizado!</b>\nProduto: {$prod['nome']}\nNova Quantidade: {$novaQtd} unidades.", $token);
            } else {
                enviarMensagem($chatId, "❌ Produto com ID {$idProd} não encontrado.", $token);
            }
            break;

        // --- ATUALIZAR PREÇO RÁPIDO ---
        case '/preco':
            if (count($partes) !== 3) {
                enviarMensagem($chatId, "⚠️ Formato incorreto. Use:\n<code>/preco [ID_PRODUTO] [NOVO_VALOR]</code>\nExemplo: <code>/preco 15 89.90</code>", $token);
                break;
            }
            $idProd = intval($partes[1]);
            $novoPreco = floatval(str_replace(',', '.', $partes[2]));
            
            $stmt = $pdo->prepare("UPDATE produtos SET preco = ? WHERE id = ? RETURNING nome");
            $stmt->execute([$novoPreco, $idProd]);
            $prod = $stmt->fetch();
            
            if ($prod) {
                $precoFmt = number_format($novoPreco, 2, ',', '.');
                enviarMensagem($chatId, "✅ <b>Preço Atualizado na Loja!</b>\nProduto: {$prod['nome']}\nNovo Preço: R$ {$precoFmt}", $token);
            } else {
                enviarMensagem($chatId, "❌ Produto com ID {$idProd} não encontrado.", $token);
            }
            break;

        // --- MODO BROADCAST (AVISOS GERAIS) ---
        case '/aviso':
            $mensagemAviso = trim(str_replace('/aviso', '', $textoOriginal));
            if (empty($mensagemAviso)) {
                enviarMensagem($chatId, "⚠️ Digite a mensagem do aviso.\nExemplo: <code>/aviso Super promoção de Black Friday na JR Iluminação!</code>", $token);
                break;
            }
            
            // Simulação de Broadcast (Neste caso, devolve para o admin como confirmação)
            $resposta = "📢 <b>SIMULAÇÃO DE BROADCAST (TCC)</b>\n";
            $resposta .= "<i>A mensagem abaixo seria disparada para toda a base de clientes ativos:</i>\n\n";
            $resposta .= "🔔 <b>Mensagem da JR Iluminação:</b>\n{$mensagemAviso}";
            enviarMensagem($chatId, $resposta, $token);
            break;

        // --- GESTÃO DE PEDIDOS INTERATIVA ---
        case '/pedidos':
            try {
                $stmt = $pdo->query("SELECT p.id, c.nome, p.total, p.status, p.data_pedido FROM pedidos p JOIN clientes c ON p.cliente_id = c.id WHERE p.status != 'Entregue' ORDER BY p.data_pedido DESC LIMIT 5");
                $ultimos = $stmt->fetchAll();

                if (empty($ultimos)) {
                    enviarMensagem($chatId, "✅ Nenhum pedido pendente de envio no momento.", $token);
                } else {
                    $respostaBase = "🛍️ <b>GERENCIAR PEDIDOS EM ABERTO</b>\nClique num botão para mudar o status (isso atualizará a linha do tempo do cliente no site):";
                    enviarMensagem($chatId, $respostaBase, $token);

                    foreach ($ultimos as $p) {
                        $valor = number_format($p['total'], 2, ',', '.');
                        $msgP = "🧾 <b>Pedido #{$p['id']}</b> - R$ {$valor}\n";
                        $msgP .= "👤 Cliente: {$p['nome']}\n";
                        $msgP .= "🏷️ Status Atual: <i>{$p['status']}</i>";

                        // Botões dinâmicos dependendo do status atual
                        $botoes = [];
                        if ($p['status'] == 'Pendente') {
                            $botoes = [
                                [['text' => '✅ Confirmar Pagamento', 'callback_data' => 'status_' . $p['id'] . '_EmProcessamento']],
                                [['text' => '❌ Cancelar', 'callback_data' => 'status_' . $p['id'] . '_Cancelado']]
                            ];
                        } elseif ($p['status'] == 'Em processamento') {
                            $botoes = [
                                [['text' => '🚚 Despachar (Enviado)', 'callback_data' => 'status_' . $p['id'] . '_Enviado']]
                            ];
                        } elseif ($p['status'] == 'Enviado') {
                            $botoes = [
                                [['text' => '📦 Marcar como Entregue', 'callback_data' => 'status_' . $p['id'] . '_Entregue']]
                            ];
                        }

                        $teclado = ['inline_keyboard' => $botoes];
                        if (!empty($botoes)) {
                            enviarMensagemComBotoes($chatId, $msgP, $teclado, $token);
                        } else {
                            enviarMensagem($chatId, $msgP, $token);
                        }
                    }
                }
            } catch (Exception $e) {
                enviarMensagem($chatId, "⚠️ Erro ao buscar pedidos.", $token);
            }
            break;

        case '/produtos':
            $stmt = $pdo->query("SELECT id, nome, preco, quantidade FROM produtos ORDER BY id DESC LIMIT 5");
            $produtos = $stmt->fetchAll();
            if (empty($produtos)) {
                enviarMensagem($chatId, "📦 Catálogo vazio.\n<code>/add Nome | Preço | Quantidade</code>", $token);
            } else {
                foreach ($produtos as $p) {
                    $precoFormatado = number_format($p['preco'], 2, ',', '.');
                    $msgP = "💡 <b>#{$p['id']} - {$p['nome']}</b>\n💵 R$ {$precoFormatado} | 📦 Est: {$p['quantidade']} un.";
                    $teclado = ['inline_keyboard' => [[['text' => '🗑️ Excluir Produto', 'callback_data' => 'delprod_' . $p['id']]]]];
                    enviarMensagemComBotoes($chatId, $msgP, $teclado, $token);
                }
            }
            break;

        case '/pendentes':
            $stmt = $pdo->query("SELECT id, nome, email FROM usuarios WHERE status = 'Pendente' AND role = 'cliente' ORDER BY id ASC");
            $pendentes = $stmt->fetchAll();
            if (empty($pendentes)) {
                enviarMensagem($chatId, "✅ Nenhuma conta aguardando aprovação.", $token);
            } else {
                foreach ($pendentes as $p) {
                    $msgIndividual = "⏳ <b>NOVO CADASTRO PENDENTE</b>\n🆔 {$p['id']}\n👤 {$p['nome']}\n📧 {$p['email']}";
                    $teclado = ['inline_keyboard' => [[['text' => '✅ Aprovar', 'callback_data' => 'aprovar_' . $p['id']], ['text' => '❌ Recusar', 'callback_data' => 'recusar_' . $p['id']]]]];
                    enviarMensagemComBotoes($chatId, $msgIndividual, $teclado, $token);
                }
            }
            break;

        case '/criticos':
            try {
                $stmt = $pdo->query("SELECT id, nome, COALESCE(quantidade, 0) AS qtd FROM produtos WHERE COALESCE(quantidade, 0) <= 5 ORDER BY qtd ASC");
                $criticos = $stmt->fetchAll();
                if (empty($criticos)) {
                    enviarMensagem($chatId, "✅ <b>Estoque Saudável!</b>", $token);
                } else {
                    $msg = "⚠️ <b>ESTOQUE CRÍTICO</b>\n━━━━━━━━━━━━━━━━━━━━\n";
                    foreach ($criticos as $item) {
                        $alerta = ($item['qtd'] == 0) ? '🔴 ESGOTADO' : '🟠 Restam ' . $item['qtd'];
                        $msg .= "ID: {$item['id']} | <b>{$item['nome']}</b>\n└ <i>{$alerta}</i>\n\n";
                    }
                    $msg .= "<i>Dica: Use /estoque [ID] [QTD] para reabastecer rápido.</i>";
                    enviarMensagem($chatId, $msg, $token);
                }
            } catch (Exception $eCrit) {
                enviarMensagem($chatId, "⚠️ Erro ao consultar estoque.", $token);
            }
            break;

        default:
            if (strpos($comando, '/') === 0) {
                enviarMensagem($chatId, "🤔 Comando não reconhecido.\nEnvie /menu para ver as opções.", $token);
            }
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

function editarMensagem($chatId, $messageId, $novoTexto, $token) {
    $url = "https://api.telegram.org/bot{$token}/editMessageText";
    $dados = ['chat_id' => $chatId, 'message_id' => $messageId, 'text' => $novoTexto, 'parse_mode' => 'HTML'];
    chamarApiTelegram($url, $dados);
}

function responderAlertaCallback($callbackId, $texto, $token) {
    $url = "https://api.telegram.org/bot{$token}/answerCallbackQuery";
    $dados = ['callback_query_id' => $callbackId, 'text' => $texto, 'show_alert' => false];
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
