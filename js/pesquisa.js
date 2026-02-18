// js/pesquisa.js

// Importar estilos globais e específicos
import '../css/base/_variables.css';
import '../css/components/_search-form.css';
// Importando o CSS global para garantir que o Vite o inclua no bundle
import '../css/style.css'; 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('researchForm');
    
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Formatar tags para array de strings
        const tags = data.tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
        
        // Data atual formatada
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        
        // Template do Markdown (Frontmatter + Corpo)
        const mdContent = `---
title: "${data.title}"
date: ${dateStr}
category: ${data.category}
tags: [${tags.map(t => `"${t}"`).join(', ')}]
status: draft
---

# ${data.title}

## Insights & Observações

${data.content}
`;

        // Criar Blob e Link de Download
        const blob = new Blob([mdContent], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        // Nome do arquivo sanitizado (ex: minha-pesquisa.md)
        const filename = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.md';
        
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
});