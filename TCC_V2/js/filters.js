/**
 * JR Iluminação e Leds - Filtros e Busca
 */

let produtosCacheados = [];

function filtrarProdutos(termo) {
    const cards = document.querySelectorAll('.product-card');
    let encontrados = 0;

    cards.forEach(card => {
        const nome = card.querySelector('h4').textContent.toLowerCase();
        if (nome.includes(termo.toLowerCase())) {
            card.style.display = '';
            encontrados++;
        } else {
            card.style.display = 'none';
        }
    });

    if (encontrados === 0) {
        const grid = document.getElementById('produtos-grid');
        if (!document.getElementById('no-results')) {
            const msg = document.createElement('p');
            msg.id = 'no-results';
            msg.className = 'empty-msg';
            msg.textContent = 'Nenhum produto encontrado com esse termo.';
            grid.appendChild(msg);
        }
    } else {
        const msg = document.getElementById('no-results');
        if (msg) msg.remove();
    }
}


