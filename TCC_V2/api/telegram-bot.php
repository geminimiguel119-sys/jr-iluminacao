<?php
// TCC_V2/api/telegram-bot.php
header('Content-Type: application/json; charset=utf-8');

// ==========================================
// CREDENCIAIS EXATAMENTE COMO VOCÊ MANDOU
// ==========================================
$token = "8700166269:AAE43sggx-efi75G0N97-ZHHrJf0xMye4m4";
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

    // APROVAR CONTA
    if (strpos($dados, 'aprovar_') === 0) {
        $idAlvo = intval(str_replace('aprovar_', '', $dados));
        $stmt = $pdo->prepare("SELECT nome, email FROM usuarios WHERE id = ?");
        $stmt->execute([$idAlvo]);
        $user = $stmt->fetch();

        if ($user) {
            $pdo->prepare("UPDATE usuarios SET status = 'Aprovado' WHERE id = ?")->execute([$idAlvo]);
            
            $novoTexto = "✅ <b>CONTA APROVADA COM SUCESSO</b>\n";
            $novoTexto .= "━━━━━━━━━━━━━━━━━━━━\n";
            $novoTexto .= "👤 <b>Cliente:</b> {$user['nome']}\n";
            $novoTexto .= "📧 <b>E-mail:</b> {$user['email']}\n";
            $novoTexto .= "🔓 <i>Acesso liberado para compras.</i>";
            
            editarMensagem($chatId, $messageId, $novoTexto, $token);
            responderAlertaCallback($callbackId, "Conta #{$idAlvo} aprovada!", $token);
        } else {
            responderAlertaCallback($callbackId, "Usuário não encontrado.", $token);
        }
    } 
    // RECUSAR CONTA
    elseif (strpos($dados, 'recusar_') === 0) {
        $idAlvo = intval(str_replace('recusar_', '', $dados));
        $stmt = $pdo->prepare("SELECT nome FROM usuarios WHERE id = ?");
        $stmt->execute([$idAlvo]);
        $user = $stmt->fetch();

        if ($user) {
            $pdo->prepare("UPDATE usuarios SET status = 'Recusado' WHERE id = ?")->execute([$idAlvo]);
            
            $novoTexto = "❌ <b>ACESSO RECUSADO</b>\n";
            $novoTexto .= "━━━━━━━━━━━━━━━━━━━━\n";
            $novoTexto .= "👤 <b>Cliente:</b> {$user['nome']} (ID: {$idAlvo})\n";
            $novoTexto .= "🔒 <i>Cadastro arquivado/reprovado.</i>";
            
            editarMensagem($chatId, $messageId, $novoTexto, $token);
            responderAlertaCallback($callbackId, "Conta #{$idAlvo} recusada.", $token);
        }
    }
    // COMANDOS RÁPIDOS DO MENU
    elseif ($dados === 'cmd_resumo') { processarComando('/resumo', $chatId, $pdo, $token); responderAlertaCallback($callbackId, "Carregando resumo...", $token); }
    elseif ($dados === 'cmd_pendentes') { processarComando('/pendentes', $chatId, $pdo, $token); responderAlertaCallback($callbackId, "Buscando pendentes...", $token); }
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

    // Trava de segurança
    if ((string)$chatId !== (string)$chatIdAutorizado) {
        enviarMensagem($chatId, "⛔ <b>Acesso Restrito.</b>\nEste bot pertence à administração da JR Iluminação.", $token);
        exit;
    }

    $partes = explode(' ', $texto);
    $comando = strtolower($partes[0]);
    processarComando($comando, $chatId, $pdo, $token, $partes);
}

// ==========================================
// 3. NÚCLEO DE FUNÇÕES (REPAGINADAS)
// ==========================================
function processarComando($comando, $chatId, $pdo, $token, $partes = []) {
    switch ($comando) {
        case '/start':
        case '/ajuda':
        case '/menu':
            $resposta = "💡 <b>Painel de Controle - JR Iluminação</b>\n";
            $resposta .= "Selecione uma opção abaixo ou digite o comando:\n";
            
            $teclado = [
                'inline_keyboard' => [
                    [
                        ['text' => '📊 Resumo Financeiro', 'callback_data' => 'cmd_resumo'],
                        ['text' => '🛍️ Últimos Pedidos', 'callback_data' => 'cmd_pedidos']
                    ],
                    [
                        ['text' => '⏳ Aprovar Clientes', 'callback_data' => 'cmd_pendentes'],
                        ['text' => '⚠️ Estoque Crítico', 'callback_data' => 'cmd_criticos']
                    ]
                ]
            ];
            enviarMensagemComBotoes($chatId, $resposta, $teclado, $token);
            break;

        case '/resumo':
            $pedidos = $pdo->query("SELECT COUNT(id) as total, COALESCE(SUM(total), 0) as fat FROM pedidos WHERE status != 'Cancelado'")->fetch();
            $estoque = $pdo->query("SELECT COALESCE(SUM(quantidade), 0) as total FROM produtos")->fetch();
            $clientes = $pdo->query("SELECT COUNT(id) as total FROM usuarios WHERE role = 'cliente'")->fetch();

            $faturacao = number_format($pedidos['fat'], 2, ',', '.');
            
            $resposta = "📊 <b>DASHBOARD EM TEMPO REAL</b>\n";
            $resposta .= "━━━━━━━━━━━━━━━━━━━━\n";
            $resposta .= "💰 <b>Faturamento:</b> R$ {$faturacao}\n";
            $resposta .= "🛍️ <b>Vendas Concluídas:</b> {$pedidos['total']} pedidos\n";
            $resposta .= "📦 <b>Estoque Geral:</b> {$estoque['total']} unidades\n";
            $resposta .= "👥 <b>Base de Clientes:</b> {$clientes['total']} cadastros\n";
            enviarMensagem($chatId, $resposta, $token);
            break;

        case '/pedidos':
            try {
                $stmt = $pdo->query("SELECT p.id, c.nome, p.total, p.status, p.data_pedido FROM pedidos p JOIN clientes c ON p.cliente_id = c.id ORDER BY p.data_pedido DESC LIMIT 5");
                $ultimos = $stmt->fetchAll();

                if (empty($ultimos)) {
                    enviarMensagem($chatId, "ℹ️ Nenhum pedido registrado no sistema.", $token);
                } else {
                    $resposta = "🛍️ <b>ÚLTIMOS 5 PEDIDOS</b>\n";
                    $resposta .= "━━━━━━━━━━━━━━━━━━━━\n";
                    foreach ($ultimos as $p) {
                        $valor = number_format($p['total'], 2, ',', '.');
                        $statusIcon = ($p['status'] == 'Entregue') ? '🟢' : (($p['status'] == 'Pendente') ? '🟠' : '🔵');
                        $resposta .= "{$statusIcon} <b>Pedido #{$p['id']}</b> - R$ {$valor}\n";
                        $resposta .= "👤 Cliente: {$p['nome']}\n";
                        $resposta .= "🏷️ Status: <i>{$p['status']}</i>\n\n";
                    }
                    enviarMensagem($chatId, $resposta, $token);
                }
            } catch (Exception $e) {
                enviarMensagem($chatId, "⚠️ Erro ao buscar pedidos: " . $e->getMessage(), $token);
            }
            break;

        case '/pendentes':
            $stmt = $pdo->query("SELECT id, nome, email FROM usuarios WHERE status = 'Pendente' AND role = 'cliente' ORDER BY id ASC");
            $pendentes = $stmt->fetchAll();

            if (empty($pendentes)) {
                enviarMensagem($chatId, "✅ <b>Tudo limpo!</b>\nNão há nenhum cliente aguardando aprovação no momento.", $token);
            } else {
                foreach ($pendentes as $p) {
                    $msgIndividual = "⏳ <b>NOVO CADASTRO PENDENTE</b>\n";
                    $msgIndividual .= "━━━━━━━━━━━━━━━━━━━━\n";
                    $msgIndividual .= "🆔 <b>ID:</b> {$p['id']}\n";
                    $msgIndividual .= "👤 <b>Nome:</b> {$p['nome']}\n";
                    $msgIndividual .= "📧 <b>E-mail:</b> {$p['email']}";
                    
                    $teclado = [
                        'inline_keyboard' => [
                            [
                                ['text' => '✅ Aprovar Acesso', 'callback_data' => 'aprovar_' . $p['id']],
                            ],
                            [
                                ['text' => '❌ Recusar', 'callback_data' => 'recusar_' . $p['id']]
                            ]
                        ]
                    ];
                    enviarMensagemComBotoes($chatId, $msgIndividual, $teclado, $token);
                }
            }
            break;

       case '/criticos':
            try {
                $stmt = $pdo->query("SELECT nome, COALESCE(quantidade, 0) AS qtd FROM produtos WHERE COALESCE(quantidade, 0) <= 5 ORDER BY qtd ASC");
                $criticos = $stmt->fetchAll();

                if (empty($criticos)) {
                    enviarMensagem($chatId, "✅ <b>Estoque Saudável!</b>\nNenhum produto está com menos de 5 unidades no armazém.", $token);
                } else {
                    $msg = "⚠️ <b>ALERTA DE ESTOQUE CRÍTICO</b>\n";
                    $msg .= "━━━━━━━━━━━━━━━━━━━━\n";
                    foreach ($criticos as $item) {
                        $nomeItem = htmlspecialchars($item['nome'] ?? 'Item', ENT_QUOTES, 'UTF-8');
                        $alerta = ($item['qtd'] == 0) ? '🔴 ESGOTADO' : '🟠 RESTAM ' . $item['qtd'];
                        $msg .= "• <b>{$nomeItem}</b>\n   └ <i>{$alerta}</i>\n\n";
                    }
                    enviarMensagem($chatId, $msg, $token);
                }
            } catch (Exception $eCrit) {
                enviarMensagem($chatId, "⚠️ Erro ao consultar estoque.", $token);
            }
            break;

        default:
            enviarMensagem($chatId, "🤔 Comando não reconhecido.\nEnvie /menu para ver os botões de ação rápida.", $token);
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
