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

// --- CONFIGURAÇÃO: MODO DE ENVIO ---
const USE_BACKEND = false; // Defina como TRUE para usar o Node.js ou FALSE para gerar no navegador (Frontend Only)

document.addEventListener('DOMContentLoaded', () => {
    initCursor(); // Inicia o cursor personalizado
    
    const form = document.getElementById('researchForm');
    const steps = document.querySelectorAll('.form-step');
    const dots = document.querySelectorAll('.step-dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    const finalActions = document.getElementById('finalActions');
    
    // Elementos da tela de agradecimento
    const searchFormSection = document.querySelector('.search-form-section');
    const thankYouScreen = document.getElementById('thankYouScreen');
    const downloadBriefingBtn = document.getElementById('downloadBriefingBtn');
    const whatsappConfirmBtn = document.getElementById('whatsappConfirmBtn');
    const newBriefingBtn = document.getElementById('newBriefingBtn');

    const DRAFT_KEY = 'briefingDraft';
    let currentStep = 0;
    const originalSubmitBtnHTML = submitBtn ? submitBtn.innerHTML : '';
    
    if (!form) return;

    // --- LÓGICA: MÁSCARA DE TELEFONE ---
    const phoneInput = document.getElementById('solicitante_telefone');
    if (phoneInput) {
        phoneInput.setAttribute('maxlength', '15');
        phoneInput.addEventListener('input', (e) => {
            e.target.value = e.target.value
                .replace(/\D/g, '')
                .replace(/(\d{2})(\d)/, '($1) $2')
                .replace(/(\d{5})(\d)/, '$1-$2')
                .replace(/(-\d{4})\d+?$/, '$1');
        });
    }

    // --- LÓGICA DE LIMITE DE CHECKBOX ---
    function initCheckboxLimiter() {
        const limitedGrids = document.querySelectorAll('.checkbox-grid[data-limit]');

        limitedGrids.forEach(grid => {
            const limit = parseInt(grid.dataset.limit, 10);
            const counterEl = document.getElementById(grid.dataset.counter);
            const checkboxes = grid.querySelectorAll('input[type="checkbox"]');

            const updateCount = () => {
                const checkedCount = grid.querySelectorAll('input[type="checkbox"]:checked').length;
                
                if (counterEl) {
                    counterEl.textContent = `${checkedCount} / ${limit}`;
                }

                if (checkedCount >= limit) {
                    grid.classList.add('limit-reached');
                } else {
                    grid.classList.remove('limit-reached');
                }
            };

            grid.addEventListener('click', (e) => {
                const label = e.target.closest('.checkbox-item');
                if (!label) return;

                const checkbox = label.querySelector('input[type="checkbox"]');
                const checkedCount = grid.querySelectorAll('input[type="checkbox"]:checked').length;

                if (checkedCount >= limit && !checkbox.checked) {
                    e.preventDefault();
                    label.classList.remove('shake');
                    void label.offsetWidth;
                    label.classList.add('shake');
                    setTimeout(() => label.classList.remove('shake'), 500);
                }
            }, true);
            
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', updateCount);
            });

            updateCount();
        });
    }

    // --- LÓGICA DE AUTO-SAVE (LOCALSTORAGE) ---
    function saveDraft() {
        const payload = getFormDataPayload();
        const draft = {
            data: payload,
            step: currentStep
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }

    function loadDraft() {
        const draftJSON = localStorage.getItem(DRAFT_KEY);
        if (!draftJSON) return;

        const draft = JSON.parse(draftJSON);
        const data = draft.data;

        Object.keys(data).forEach(key => {
            const value = data[key];
            const elements = form.querySelectorAll(`[name="${key}"]`);

            if (elements.length > 0) {
                const elType = elements[0].type;

                if (elType === 'checkbox' || elType === 'radio') {
                    const values = Array.isArray(value) ? value : [value];
                    elements.forEach(el => {
                        if (values.includes(el.value)) {
                            el.checked = true;
                        }
                    });
                } else {
                    elements[0].value = value;
                }
            }
        });

        currentStep = draft.step || 0;
        updateSteps();
        initCheckboxLimiter();
    }

    function deleteDraft() {
        localStorage.removeItem(DRAFT_KEY);
    }

    function initDraftPrompt() {
        if (localStorage.getItem(DRAFT_KEY)) {
            const promptHTML = `
                <div class="draft-prompt" id="draftPrompt">
                    <p>Encontramos um rascunho salvo. Deseja continuar?</p>
                    <div>
                        <button class="btn-draft btn-restore" id="restoreDraft">Sim, continuar</button>
                        <button class="btn-draft btn-discard" id="discardDraft">Não, começar do zero</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', promptHTML);
            
            const promptEl = document.getElementById('draftPrompt');
            setTimeout(() => promptEl.classList.add('visible'), 100);

            promptEl.addEventListener('click', (e) => {
                if (e.target.id === 'restoreDraft') { loadDraft(); }
                if (e.target.id === 'discardDraft') { deleteDraft(); }
                promptEl.classList.remove('visible');
                setTimeout(() => promptEl.remove(), 500);
            });
        }
    }

    // --- LÓGICA DE PASSOS ---
    function updateSteps() {
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
                step.style.display = 'block'; // Garante que a etapa apareça
            } else {
                step.classList.remove('active');
                step.style.display = 'none'; // Esconde as outras etapas
            }
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index <= currentStep);
        });

        prevBtn.disabled = currentStep === 0;
        
        // Controle de botões Next / Submit
        if (currentStep === steps.length - 1) {
            nextBtn.style.display = 'none';
            if (finalActions) finalActions.style.display = 'flex';
        } else {
            nextBtn.style.display = 'inline-block';
            if (finalActions) finalActions.style.display = 'none';
        }

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

    // --- HELPER: PREPARAR DADOS PARA O BACKEND ---
    const getFormDataPayload = () => {
        const formData = new FormData(form);
        const payload = {};
        
        const keys = Array.from(new Set([...formData.keys()]));
        keys.forEach(key => {
            const values = formData.getAll(key);
            payload[key] = values.length > 1 ? values : values[0];
        });
        return payload;
    };

    // --- HELPER: GERAR MARKDOWN NO FRONTEND (QUANDO SEM BACKEND) ---
    const generateLocalMarkdown = (data) => {
        const getVal = (key) => {
            const val = data[key];
            if (!val) return '';
            if (Array.isArray(val)) return val.map(v => `- ${v}`).join('\n');
            return val;
        };

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        return `---
title: "Briefing: ${data.empresa_nome || 'Projeto Sem Nome'}"
date: ${dateStr}
client: "${data.solicitante_nome || ''}"
type: "${data.projeto_tipo || ''}"
status: briefing
---

# Briefing de Projeto: ${data.empresa_nome || ''}

## 1. Informações do Solicitante
- **Nome/Cargo:** ${data.solicitante_nome || ''}
- **Função no Projeto:** ${data.solicitante_funcao || ''}
- **E-mail:** ${data.solicitante_email || ''}
- **Telefone:** ${data.solicitante_telefone || ''}
- **Relação com a Marca:** ${data.solicitante_relacao || ''}

## 2. Informações da Empresa
- **Nome/Origem:** ${data.empresa_nome || ''}
- **Segmento:** ${data.empresa_segmento || ''}
- **Abrangência:** ${data.empresa_abrangencia || ''}

### Detalhes
**Metas de Negócio:**
${getVal('empresa_metas')}

**Missão, Visão e Valores:**
${data.empresa_mvv || ''}

## 3. Público-Alvo e Mercado
- **Tipo:** ${data.publico_tipo || ''}
- **Faixa Etária:** ${data.publico_faixa_etaria || ''}

**Classe Social:**
${getVal('publico_classe')}

**Dores e Necessidades:**
${data.publico_dores || ''}

## 4. Posicionamento e Personalidade
- **Tom de Voz:** ${data.marca_tom || ''}

**Arquétipos / Personalidade:**
${getVal('marca_personalidade')}

## 5. Análise Competitiva
**Concorrentes:**
${data.concorrentes_lista || ''}

## 6. Objetivos do Projeto
- **Tipo:** ${data.projeto_tipo || ''}
- **Prazo:** ${data.projeto_prazo || ''}

**Materiais Necessários:**
${getVal('projeto_materiais')}

## 7. Preferências Visuais
- **Logo:** ${data.visual_logo || ''}
- **Tipografia:** ${data.visual_tipografia || ''}

**Cores Desejadas:**
${data.visual_cores_gosto || ''}

**Cores a Evitar:**
${data.visual_cores_nao_gosto || ''}

**Estilo Visual:**
${getVal('visual_estilo')}

**Referências Visuais:**
${data.visual_refs || ''}

## 8. Materiais Existentes
${data.existente_inventario || ''}

## 9. Aplicações e Formatos
${data.aplicacoes_formatos || ''}

## 10. Processo e Colaboração
${data.processo_colab || ''}
`;
    };

    // --- EVENTO: ENVIAR PARA O SERVIDOR ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = form.querySelector('.btn-submit') || form.querySelector('button[type="submit"]');
        // const originalText = btn.innerHTML; // Usaremos a variável global agora
        btn.innerHTML = 'Enviando...';
        btn.disabled = true; // Previne múltiplos cliques
        
        try {
            const payload = getFormDataPayload();
            let blob;
            const safeName = (payload.empresa_nome || 'briefing').toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const filename = `briefing-${safeName}.md`;

            if (USE_BACKEND) {
                // --- MODO BACKEND (Node.js) ---
                const response = await fetch('http://localhost:3000/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error('Erro na resposta do servidor');
                blob = await response.blob();

            } else {
                // --- MODO FRONTEND ONLY (Cliente) ---
                // Simula um pequeno delay para UX
                await new Promise(resolve => setTimeout(resolve, 800));
                
                const mdContent = generateLocalMarkdown(payload);
                blob = new Blob([mdContent], { type: 'text/markdown; charset=utf-8' });
            }

            // --- LÓGICA DE SUCESSO (COMUM) ---

            // Configurar botões da tela de agradecimento (se existirem na tela)
            if (downloadBriefingBtn) {
                const url = URL.createObjectURL(blob);
                downloadBriefingBtn.href = url;
                downloadBriefingBtn.download = filename;
            }

            if (whatsappConfirmBtn) {
                const whatsappMessage = `Olá! O briefing do projeto "${payload.empresa_nome || 'Novo Projeto'}" foi preenchido com sucesso.`;
                const whatsappUrl = `https://api.whatsapp.com/send?phone=5569984710757&text=${encodeURIComponent(whatsappMessage)}`;
                whatsappConfirmBtn.href = whatsappUrl;
            }

            // Transição de telas
            if (searchFormSection && thankYouScreen) {
                searchFormSection.style.display = 'none';
                thankYouScreen.style.display = 'flex';
            }

            // Limpar formulário e rascunho para a próxima vez
            deleteDraft();
            form.reset();
            initCheckboxLimiter(); // Reseta os contadores

        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
            btn.innerHTML = 'Erro';
            setTimeout(() => {
                btn.innerHTML = originalSubmitBtnHTML;
                btn.disabled = false;
            }, 2000);
        }
    });

    // --- NOVO: LÓGICA DO BOTÃO "PREENCHER NOVO" ---
    if (newBriefingBtn) {
        newBriefingBtn.addEventListener('click', () => {
            if (thankYouScreen) thankYouScreen.style.display = 'none';
            if (searchFormSection) searchFormSection.style.display = 'block';
            
            // Resetar para o estado inicial
            currentStep = 0;
            updateSteps();

            // Re-habilita o botão de submit
            if (submitBtn) {
                submitBtn.innerHTML = originalSubmitBtnHTML;
                submitBtn.disabled = false;
            }
        });
    }

    // --- INICIALIZAÇÃO ---
    updateSteps(); // Chamada inicial para configurar a UI
    initCheckboxLimiter();
    initDraftPrompt();
    // Salva a cada alteração no formulário
    form.addEventListener('input', saveDraft);
});