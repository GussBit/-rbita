// js/pesquisa.js

import gsap from 'gsap';
import { initCursor } from './modules/cursor.js';

// Importar estilos globais e específicos
import '../css/base/_variables.css';
import '../css/components/_search-form.css';
// Importando o CSS global para garantir que o Vite o inclua no bundle
import '../css/main.css'; 

// Registrar GSAP globalmente para módulos que dependem dele (como o cursor)
window.gsap = gsap;

document.addEventListener('DOMContentLoaded', () => {
    initCursor(); // Inicia o cursor personalizado
    const form = document.getElementById('researchForm');
    const steps = document.querySelectorAll('.form-step');
    const dots = document.querySelectorAll('.step-dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finalActions = document.getElementById('finalActions');
    const copyBtn = document.getElementById('copyBtn');
    
    let currentStep = 0;
    
    if (!form) return;

    // --- LÓGICA DE PASSOS ---
    function updateSteps() {
        // Mostrar passo atual
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
                // Pequeno delay para garantir que o display:flex foi aplicado antes da opacidade (se houver transição complexa)
            } else {
                step.classList.remove('active');
            }
        });

        // Atualizar indicador
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index <= currentStep);
        });

        // Botões
        prevBtn.disabled = currentStep === 0;
        
        if (currentStep === steps.length - 1) {
            nextBtn.style.display = 'none';
            finalActions.style.display = 'flex';
        } else {
            nextBtn.style.display = 'block';
            finalActions.style.display = 'none';
        }

        // Scroll para o topo do form
        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    nextBtn.addEventListener('click', () => {
        if (currentStep < steps.length - 1) {
            currentStep++;
            updateSteps();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateSteps();
        }
    });

    // --- FUNÇÃO GERADORA DE MARKDOWN ---
    const generateMarkdown = () => {
        const formData = new FormData(form);
        const getVal = (name) => {
            const values = formData.getAll(name);
            if (values.length === 0) return '';
            if (values.length === 1) return values[0];
            return values.map(v => `- ${v}`).join('\n');
        };
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        return `---
title: "Briefing: ${getVal('empresa_nome') || 'Projeto Sem Nome'}"
date: ${dateStr}
client: "${getVal('solicitante_nome')}"
type: "${getVal('projeto_tipo')}"
status: briefing
---

# Briefing de Projeto: ${getVal('empresa_nome')}

## 1. Informações do Solicitante
- **Nome/Cargo:** ${getVal('solicitante_nome')}
- **Função no Projeto:** ${getVal('solicitante_funcao')}
- **Contato:** ${getVal('solicitante_contato')}
- **Relação com a Marca:** ${getVal('solicitante_relacao')}

## 2. Informações da Empresa
- **Nome/Origem:** ${getVal('empresa_nome')}
- **Segmento:** ${getVal('empresa_segmento')}
- **Abrangência:** ${getVal('empresa_abrangencia')}

### Detalhes
**Metas de Negócio:**
${getVal('empresa_metas')}

**Missão, Visão e Valores:**
${getVal('empresa_mvv')}

## 3. Público-Alvo e Mercado
- **Tipo:** ${getVal('publico_tipo')}
- **Faixa Etária:** ${getVal('publico_faixa_etaria')}

**Classe Social:**
${getVal('publico_classe')}

**Dores e Necessidades:**
${getVal('publico_dores')}

## 4. Posicionamento e Personalidade
- **Tom de Voz:** ${getVal('marca_tom')}

**Arquétipos / Personalidade:**
${getVal('marca_personalidade')}

## 5. Análise Competitiva
**Concorrentes:**
${getVal('concorrentes_lista')}

## 6. Objetivos do Projeto
- **Tipo:** ${getVal('projeto_tipo')}
- **Prazo:** ${getVal('projeto_prazo')}

**Materiais Necessários:**
${getVal('projeto_materiais')}

## 7. Preferências Visuais
- **Logo:** ${getVal('visual_logo')}
- **Tipografia:** ${getVal('visual_tipografia')}

**Estilo Visual:**
${getVal('visual_estilo')}

**Referências Visuais:**
${getVal('visual_refs')}

## 8. Materiais Existentes
${getVal('existente_inventario')}

## 9. Aplicações e Formatos
${getVal('aplicacoes_formatos')}

## 10. Processo e Colaboração
${getVal('processo_colab')}
`;
    };

    // --- EVENTO: BAIXAR ARQUIVO ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const mdContent = generateMarkdown();
        const formData = new FormData(form);
        const empresaNome = formData.get('empresa_nome');
        
        // Criar Blob e Link de Download
        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Nome do arquivo sanitizado (ex: minha-pesquisa.md)
        const safeName = (empresaNome || 'briefing').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const filename = `briefing-${safeName}.md`;
        
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Limpeza
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Feedback visual simples (opcional)
        const btn = form.querySelector('.btn-submit');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'MD Gerado! (Ver Downloads) ✓';
        setTimeout(() => btn.innerHTML = originalText, 2000);
        form.reset();
    });

    // --- EVENTO: COPIAR PARA CLIPBOARD ---
    if(copyBtn) {
        copyBtn.addEventListener('click', () => {
            const mdContent = generateMarkdown();
            navigator.clipboard.writeText(mdContent).then(() => {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = 'Copiado! ✓';
                copyBtn.style.borderColor = 'var(--color-solar-orange)';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.style.borderColor = '';
                }, 2000);
            });
        });
    }
});