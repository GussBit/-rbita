import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Configurações
app.use(cors()); // Permite que o frontend (porta 5173) fale com o backend (porta 3000)
app.use(express.json());

app.post('/api/generate', (req, res) => {
    try {
        const data = req.body;
        
        // Helper para formatar valores (arrays ou strings)
        const getVal = (key) => {
            const val = data[key];
            if (!val) return '';
            if (Array.isArray(val)) return val.map(v => `- ${v}`).join('\n');
            return val;
        };

        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];

        // Construção do Markdown
        const mdContent = `---
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

        // Sanitizar nome do arquivo
        const safeName = (data.empresa_nome || 'briefing').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const filename = `briefing-${safeName}.md`;

        // --- NOVO: SALVAR NO SERVIDOR (PASTA LOCAL) ---
        const briefingsDir = path.join(process.cwd(), 'briefings');
        
        // Cria a pasta 'briefings' se ela não existir
        if (!fs.existsSync(briefingsDir)) {
            fs.mkdirSync(briefingsDir);
        }

        // Salva o arquivo fisicamente no servidor
        const filePath = path.join(briefingsDir, filename);
        fs.writeFileSync(filePath, mdContent, 'utf8');
        console.log(`Arquivo salvo localmente em: ${filePath}`);
        // ----------------------------------------------

        // Enviar arquivo para download
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(mdContent);

    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ error: 'Erro interno ao gerar arquivo' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend rodando em http://localhost:${PORT}`);
});