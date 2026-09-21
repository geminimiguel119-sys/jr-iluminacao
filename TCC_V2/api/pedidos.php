<?php
// api/pedidos.php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');

$host = "db.bfppcxnxqagpesuyjlhe.supabase.co";
$dbName = "postgres";
$usuario = "postgres";
$senha = "An1bal_19691910@";

try {
    $pdo = new PDO("pgsql:host=$host;port=5432;dbname=$dbName", $usuario, $senha, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'erro' => 'Falha na ligação à base de dados.']);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'POST') {
    $dados = json_decode(file_get_contents("php://input"), true);
    
    // 1. CRIAR NOVO PEDIDO, ITENS E ATUALIZAR ESTOQUE
    if (isset($dados['acao']) && $dados['acao'] === 'criar') {
        try {
            $pdo->beginTransaction();

            $email = $dados['email'];
            $nome = $dados['nome'];
            $total = $dados['total'];
            
            // Passo A: Encontrar ou criar o "cliente" usando os dados do "usuario"
            $stmtBusca = $pdo->prepare("SELECT id FROM clientes WHERE email = ?");
            $stmtBusca->execute([$email]);
            $cliente_id = $stmtBusca->fetchColumn();
            
            if (!$cliente_id) {
                // Se não existir, insere na tabela clientes respeitando o status 'Ativo'
                $stmtNovoCli = $pdo->prepare("INSERT INTO clientes (nome, email, status) VALUES (?, ?, 'Ativo') RETURNING id");
                $stmtNovoCli->execute([$nome, $email]);
                $cliente_id = $stmtNovoCli->fetchColumn();
            }
            
            // Passo B: Grava o pedido usando o cliente_id da tabela clientes e o status exato 'Pendente'
            $stmtPedido = $pdo->prepare("INSERT INTO pedidos (cliente_id, total, status) VALUES (?, ?, 'Pendente') RETURNING id");
            $stmtPedido->execute([$cliente_id, $total]);
            $pedido_id = $stmtPedido->fetchColumn();
            
            // Passo C: Grava os itens individuais E ABAIXA O ESTOQUE
            if (!empty($dados['itens']) && is_array($dados['itens'])) {
                $stmtItem = $pdo->prepare("INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)");
                
                // NOVIDADE: Comando para abater a quantidade vendida da quantidade atual do produto
                $stmtEstoque = $pdo->prepare("UPDATE produtos SET quantidade = quantidade - ? WHERE id = ?");
                
                foreach ($dados['itens'] as $item) {
                    // 1. Regista o item na venda
                    $stmtItem->execute([$pedido_id, $item['id'], $item['quantidade'], $item['preco']]);
                    
                    // 2. Desconta a quantidade exata comprada do estoque do produto correspondente
                    $stmtEstoque->execute([$item['quantidade'], $item['id']]);
                }
            }
            
            $pdo->commit();
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (PDOException $e) {
            $pdo->rollBack();
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
            exit;
        }
    }
    
    // 2. ATUALIZAR STATUS NO PAINEL ADMIN
    if (isset($dados['acao']) && $dados['acao'] === 'atualizar_status') {
        try {
            $stmt = $pdo->prepare("UPDATE pedidos SET status = ? WHERE id = ?");
            $stmt->execute([$dados['status'], $dados['id']]);
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
            exit;
        }
    }

    // 3. EXCLUIR PEDIDO (Apaga os itens primeiro por causa da chave estrangeira)
    if (isset($dados['acao']) && $dados['acao'] === 'excluir') {
        try {
            // Nota: Numa loja real, se calhar quereríamos devolver o item ao estoque ao excluir o pedido. 
            // Para efeitos de TCC, geralmente apenas se exclui o registo.
            $stmtItens = $pdo->prepare("DELETE FROM itens_pedido WHERE pedido_id = ?");
            $stmtItens->execute([$dados['id']]);
            
            $stmt = $pdo->prepare("DELETE FROM pedidos WHERE id = ?");
            $stmt->execute([$dados['id']]);
            echo json_encode(['sucesso' => true]);
            exit;
        } catch (PDOException $e) {
            echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
            exit;
        }
    }
}

// 4. LER OS PEDIDOS (Com filtro para o painel do Cliente)
if ($metodo === 'GET') {
    try {
        if (isset($_GET['email'])) {
            // Se enviar o email, devolve apenas os pedidos desse cliente (Área do Perfil)
            $stmt = $pdo->prepare("SELECT p.id, p.total, p.status, p.data_pedido, c.nome as cliente_nome 
                                   FROM pedidos p 
                                   JOIN clientes c ON p.cliente_id = c.id 
                                   WHERE c.email = ? 
                                   ORDER BY p.data_pedido DESC");
            $stmt->execute([$_GET['email']]);
        } else {
            // Se não enviar nada, devolve todos (Painel de Administrador)
            $stmt = $pdo->query("SELECT p.id, p.total, p.status, p.data_pedido, c.nome as cliente_nome 
                                 FROM pedidos p 
                                 LEFT JOIN clientes c ON p.cliente_id = c.id 
                                 ORDER BY p.data_pedido DESC");
        }
        $pedidos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['sucesso' => true, 'dados' => $pedidos]);
        exit;
    } catch (PDOException $e) {
        echo json_encode(['sucesso' => false, 'erro' => $e->getMessage()]);
        exit;
    }
}
?>