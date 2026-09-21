/* Dados locais de demonstração — permitem apresentar o sistema sem MySQL/Supabase. */
const DEMO_PRODUCTS = [
 {id:1,nome:'Lâmpada LED 10W',preco:45.50,quantidade:100,descricao:'Luz branca, econômica e de alta durabilidade.'},
 {id:2,nome:'Fita LED RGB 5m',preco:89.90,quantidade:50,descricao:'Iluminação RGB com múltiplas cores para ambientes modernos.'},
 {id:3,nome:'Spot LED Branco',preco:35.00,quantidade:75,descricao:'Spot de embutir para iluminação direcionada.'},
 {id:4,nome:'Lâmpada LED 15W',preco:65.00,quantidade:80,descricao:'Maior luminosidade com baixo consumo de energia.'},
 {id:5,nome:'Painel LED Quadrado',preco:120.00,quantidade:40,descricao:'Painel 30x30cm com iluminação uniforme.'},
 {id:6,nome:'Luminária Pendente LED',preco:150.00,quantidade:30,descricao:'Design contemporâneo com LED integrado.'}
];
const DEMO_CLIENTS = [
 {id:1,nome:'João Silva',email:'joao@email.com',telefone:'(11) 98765-4321',status:'Ativo',data_cadastro:'2026-08-12'},
 {id:2,nome:'Maria Oliveira',email:'maria@email.com',telefone:'(11) 99876-5432',status:'Ativo',data_cadastro:'2026-08-18'},
 {id:3,nome:'Carlos Santos',email:'carlos@email.com',telefone:'(11) 97654-3210',status:'Ativo',data_cadastro:'2026-08-21'},
 {id:4,nome:'Ana Costa',email:'ana@email.com',telefone:'(11) 98765-4321',status:'Ativo',data_cadastro:'2026-08-26'},
 {id:5,nome:'Pedro Ferreira',email:'pedro@email.com',telefone:'(11) 99876-5432',status:'Inativo',data_cadastro:'2026-08-29'}
];
const DEMO_ORDERS = [
 {id:1005,cliente:'Pedro Ferreira',data:'2026-09-01',total:1200,itens:8,status:'Concluído'},
 {id:1004,cliente:'Ana Costa',data:'2026-09-01',total:250,itens:2,status:'Pendente'},
 {id:1003,cliente:'Carlos Santos',data:'2026-08-31',total:890.50,itens:5,status:'Enviado'},
 {id:1002,cliente:'Maria Oliveira',data:'2026-08-30',total:120,itens:1,status:'Em processamento'},
 {id:1001,cliente:'João Silva',data:'2026-08-29',total:450,itens:3,status:'Concluído'}
];
function seedDemoData(){
 if(!localStorage.getItem('jr_demo_products')) localStorage.setItem('jr_demo_products',JSON.stringify(DEMO_PRODUCTS));
 if(!localStorage.getItem('jr_demo_clients')) localStorage.setItem('jr_demo_clients',JSON.stringify(DEMO_CLIENTS));
 if(!localStorage.getItem('jr_demo_orders')) localStorage.setItem('jr_demo_orders',JSON.stringify(DEMO_ORDERS));
}
function getDemoProducts(){return JSON.parse(localStorage.getItem('jr_demo_products')||'[]')}
function getDemoClients(){return JSON.parse(localStorage.getItem('jr_demo_clients')||'[]')}
function getDemoOrders(){return JSON.parse(localStorage.getItem('jr_demo_orders')||'[]')}
