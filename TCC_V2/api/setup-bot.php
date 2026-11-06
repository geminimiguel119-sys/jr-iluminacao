<?php
// api/setup-bot.php

// 1. As suas credenciais
$token = "8700166269:AAEgnRWKyNT8Uw8EppsNK7VVSmyHYF9YlYY";
$site_url = "https://jr-iluminacao-1.onrender.com/api/telegram-bot.php";

// 2. Monta a URL da API do Telegram
$url_telegram = "https://api.telegram.org/bot{$token}/setWebhook?url={$site_url}";

// 3. Dispara a requisição silenciosamente
$resposta = @file_get_contents($url_telegram);
$dados = json_decode($resposta, true);

// 4. Retorna o status na tela
if ($dados && $dados['ok']) {
    echo "<h2 style='color: green;'>✅ Bot despertado e conectado com sucesso!</h2>";
    echo "<p>O Telegram agora está enviando as mensagens para: <b>{$site_url}</b></p>";
} else {
    echo "<h2 style='color: red;'>❌ Falha ao conectar o Bot</h2>";
    echo "<pre>" . print_r($dados, true) . "</pre>";
}
?>
