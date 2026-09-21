/**
 * JR Iluminação e Leds - Validações de Formulário em Tempo Real
 */

// ========== VALIDADORES ==========
const validadores = {
    email: (valor) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(valor);
    },
    
    telefone: (valor) => {
        const regex = /^[\d\s\-\(\)]+$/;
        return regex.test(valor) && valor.replace(/\D/g, '').length >= 10;
    },
    
    cpf: (valor) => {
        const regex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
        return regex.test(valor);
    },
    
    cep: (valor) => {
        const regex = /^\d{5}-\d{3}$/;
        return regex.test(valor);
    },
    
    numero: (valor) => {
        return !isNaN(valor) && valor !== '';
    },
    
    numeroPositivo: (valor) => {
        return !isNaN(valor) && parseFloat(valor) > 0;
    },
    
    texto: (valor) => {
        return valor.trim().length > 0;
    },
    
    textoMinimo: (valor, minimo = 3) => {
        return valor.trim().length >= minimo;
    },
    
    senha: (valor) => {
        // Mínimo 6 caracteres, pelo menos 1 número
        return valor.length >= 6 && /\d/.test(valor);
    },
    
    url: (valor) => {
        const regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return regex.test(valor);
    }
};

// ========== MÁSCARAS ==========
const mascaras = {
    telefone: (valor) => {
        return valor
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d)/, '$1-$2')
            .replace(/(-\d{4})(\d)/, '$1-$2');
    },
    
    cpf: (valor) => {
        return valor
            .replace(/\D/g, '')
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1-$2');
    },
    
    cep: (valor) => {
        return valor
            .replace(/\D/g, '')
            .replace(/^(\d{5})(\d)/, '$1-$2');
    },
    
    moeda: (valor) => {
        return 'R$ ' + parseFloat(valor)
            .toFixed(2)
            .replace('.', ',')
            .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    },
    
    data: (valor) => {
        return valor
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1/$2')
            .replace(/\/(\d{2})(\d)/, '/$1/$2');
    }
};

// ========== VALIDAÇÃO DE FORMULÁRIO ==========
function validarFormulario(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    let valido = true;
    
    inputs.forEach(input => {
        if (!validarCampo(input)) {
            valido = false;
        }
    });
    
    return valido;
}

function validarCampo(input) {
    const valor = input.value.trim();
    const tipo = input.getAttribute('data-validacao');
    const obrigatorio = input.hasAttribute('required');
    
    // Limpar erros anteriores
    removerErro(input);
    
    // Verificar se é obrigatório
    if (obrigatorio && !valor) {
        adicionarErro(input, 'Este campo é obrigatório');
        return false;
    }
    
    // Se não é obrigatório e está vazio, é válido
    if (!obrigatorio && !valor) {
        return true;
    }
    
    // Validar tipo específico
    if (tipo && validadores[tipo]) {
        if (!validadores[tipo](valor)) {
            const mensagens = {
                'email': 'E-mail inválido',
                'telefone': 'Telefone inválido',
                'cpf': 'CPF inválido',
                'cep': 'CEP inválido',
                'numero': 'Deve ser um número',
                'numeroPositivo': 'Deve ser um número positivo',
                'textoMinimo': `Mínimo ${input.getAttribute('data-minimo') || 3} caracteres`,
                'senha': 'Mínimo 6 caracteres com pelo menos 1 número',
                'url': 'URL inválida'
            };
            
            adicionarErro(input, mensagens[tipo] || 'Valor inválido');
            return false;
        }
    }
    
    // Validar comprimento mínimo
    const minimo = input.getAttribute('data-minimo');
    if (minimo && valor.length < minimo) {
        adicionarErro(input, `Mínimo ${minimo} caracteres`);
        return false;
    }
    
    // Validar comprimento máximo
    const maximo = input.getAttribute('data-maximo');
    if (maximo && valor.length > maximo) {
        adicionarErro(input, `Máximo ${maximo} caracteres`);
        return false;
    }
    
    adicionarSucesso(input);
    return true;
}

function adicionarErro(input, mensagem) {
    input.classList.add('input-erro');
    input.classList.remove('input-sucesso');
    
    let errorDiv = input.nextElementSibling;
    if (!errorDiv || !errorDiv.classList.contains('form-error')) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'form-error';
        input.parentNode.insertBefore(errorDiv, input.nextSibling);
    }
    errorDiv.textContent = mensagem;
}

function adicionarSucesso(input) {
    input.classList.remove('input-erro');
    input.classList.add('input-sucesso');
    
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('form-error')) {
        errorDiv.remove();
    }
}

function removerErro(input) {
    input.classList.remove('input-erro', 'input-sucesso');
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.classList.contains('form-error')) {
        errorDiv.remove();
    }
}

// ========== APLICAR MÁSCARAS ==========
function aplicarMascara(input, tipoMascara) {
    input.addEventListener('input', (e) => {
        if (mascaras[tipoMascara]) {
            e.target.value = mascaras[tipoMascara](e.target.value);
        }
    });
}

// ========== VALIDAÇÃO EM TEMPO REAL ==========
function configurarValidacaoTempoReal(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Aplicar máscara se necessário
        const mascara = input.getAttribute('data-mascara');
        if (mascara && mascaras[mascara]) {
            aplicarMascara(input, mascara);
        }
        
        // Validar ao sair do campo
        input.addEventListener('blur', () => {
            validarCampo(input);
        });
        
        // Validar enquanto digita
        input.addEventListener('input', () => {
            if (input.classList.contains('input-erro')) {
                validarCampo(input);
            }
        });
    });
}

// ========== COMPARAÇÃO DE CAMPOS ==========
function compararCampos(campo1Id, campo2Id, mensagem = 'Os campos não correspondem') {
    const campo1 = document.getElementById(campo1Id);
    const campo2 = document.getElementById(campo2Id);
    
    if (!campo1 || !campo2) return true;
    
    if (campo1.value !== campo2.value) {
        adicionarErro(campo2, mensagem);
        return false;
    }
    
    adicionarSucesso(campo2);
    return true;
}

// ========== VERIFICAR FORÇA DE SENHA ==========
function verificarForcaSenha(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    input.addEventListener('input', (e) => {
        const senha = e.target.value;
        const forcaDiv = document.getElementById(inputId + '-forca') || criarForcaDiv(inputId);
        
        let forca = 0;
        let mensagem = '';
        let cor = '';
        
        if (senha.length >= 6) forca++;
        if (/[a-z]/.test(senha)) forca++;
        if (/[A-Z]/.test(senha)) forca++;
        if (/\d/.test(senha)) forca++;
        if (/[^a-zA-Z0-9]/.test(senha)) forca++;
        
        switch(forca) {
            case 0:
            case 1:
                mensagem = 'Fraca';
                cor = '#D32F2F';
                break;
            case 2:
                mensagem = 'Média';
                cor = '#F57C00';
                break;
            case 3:
                mensagem = 'Boa';
                cor = '#FFC107';
                break;
            case 4:
            case 5:
                mensagem = 'Forte';
                cor = '#2E7D32';
                break;
        }
        
        forcaDiv.textContent = `Força: ${mensagem}`;
        forcaDiv.style.color = cor;
    });
}

function criarForcaDiv(inputId) {
    const input = document.getElementById(inputId);
    const div = document.createElement('div');
    div.id = inputId + '-forca';
    div.className = 'forca-senha';
    input.parentNode.appendChild(div);
    return div;
}

// ========== INICIALIZAR VALIDAÇÕES ==========
function inicializarValidacoes() {
    // Configurar validação em tempo real para todos os formulários
    const formularios = document.querySelectorAll('form');
    formularios.forEach(form => {
        configurarValidacaoTempoReal(form.id);
    });
}

// Inicializar ao carregar
document.addEventListener('DOMContentLoaded', inicializarValidacoes);
