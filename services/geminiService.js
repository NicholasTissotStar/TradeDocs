
import { GoogleGenAI, Type } from "@google/genai";
import { Team } from "../types.js";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getBaseSystemPersona = (team) => {
  const baseInstruction = "Sua tarefa é criar a documentação mais detalhada e concisa possível, exclusivamente em Português do Brasil. Estruture suas respostas em parágrafos bem escritos e explicativos. Use blocos de código markdown com a linguagem correta.";

  switch (team) {
    case Team.Developers:
      return `Você é um Arquiteto de Software Sênior. Analise o código fornecido profundamente, considerando padrões de design, segurança e escalabilidade. Use a ferramenta de busca para validar versões de pacotes e APIs externas. ${baseInstruction}`;
    case Team.UXUI:
       return `Você é um Product Designer especialista em UX/UI. Analise fluxos e componentes sob a ótica da usabilidade e acessibilidade. ${baseInstruction}`;
    case Team.Automations:
      return `Você é um Arquiteto de Automação (RPA/Integrations). Explique fluxos lógicos, tratamentos de erro e payloads. ${baseInstruction}`;
    case Team.AI:
      return `Você é um Engenheiro de IA especialista em Sistemas de Agentes. Detalhe prompts de sistema, ferramentas e guardrails. ${baseInstruction}`;
    default:
      return `Você é um Consultor Técnico Sênior especialista em documentação. ${baseInstruction}`;
  }
};

const buildTeamContext = (teamData) => {
    let context = '';
    
    if (teamData.description) {
        context += `**Objetivo do Projeto:**\n${teamData.description}\n\n`;
    }

    if (teamData.uploadedFiles?.length > 0) {
      context += '**Arquivos de Contexto Anexados:**\n';
      teamData.uploadedFiles.forEach(file => {
          context += `--- ARQUIVO: ${file.name} ---\n`;
          if (file.type === 'json') {
              context += `\`\`\`json\n${file.content}\n\`\`\`\n\n`;
          } else {
              context += `${file.content}\n\n`;
          }
      });
    }

    if (teamData.pastedCode) {
        context += `**Código Colado Manualmente:**\n${teamData.pastedCode}\n\n`;
    }

    return context || "Sem contexto técnico adicional.";
};

export const generateDocumentStructure = async (params) => {
  const { projectName, description, team, teamData } = params;
  const systemInstruction = getBaseSystemPersona(team);
  const context = buildTeamContext(teamData);
  
  const prompt = `
    Analise o projeto "${projectName}" e seu contexto técnico:
    
    ${context}
    
    Sugira uma estrutura de documentação estratégica dividida em tópicos e subtópicos para este projeto.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: [{ text: prompt }],
    config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                structure: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            children: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING } } } }
                        },
                        required: ["title"]
                    }
                }
            },
            required: ["structure"]
        }
    }
  });

  return JSON.parse(response.text).structure || [];
};

export const generateFullDocumentContent = async (params, structures, progressCallback, onToken) => {
    const { projectName, team, teamData } = params;
    const systemInstruction = getBaseSystemPersona(team);
    const context = buildTeamContext(teamData);
    
    progressCallback({ progress: 10, message: 'Iniciando raciocínio arquitetural (Thinking Mode)...' });

    const finalPrompt = `
        Gere uma documentação técnica premium para o projeto "${projectName}".
        Baseie-se na estrutura aprovada: ${JSON.stringify(structures)}
        
        Contexto Técnico Completo (Arquivos e Códigos):
        ${context}
        
        Use o Google Search para verificar as melhores práticas atuais das tecnologias identificadas nos arquivos e citar fontes quando necessário.
    `;

    const response = await ai.models.generateContentStream({
        model: "gemini-3-pro-preview",
        contents: [{ text: finalPrompt }],
        config: { 
          systemInstruction,
          thinkingConfig: { thinkingBudget: 16000 },
          tools: [{ googleSearch: {} }]
        }
    });

    let fullContent = "";
    let sources = [];

    for await (const chunk of response) {
        if (chunk.text) {
          fullContent += chunk.text;
          if (onToken) onToken(chunk.text);
        }
        
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
          groundingChunks.forEach(c => {
            if (c.web?.uri) {
              sources.push({ title: c.web.title || c.web.uri, url: c.web.uri });
            }
          });
        }
    }

    progressCallback({ progress: 100, message: 'Documentação finalizada com sucesso!' });

    return {
        title: projectName,
        content: markdownToHtml(fullContent),
        sources: Array.from(new Set(sources.map(s => s.url))).map(url => sources.find(s => s.url === url))
    };
};

export const markdownToHtml = (markdown) => {
    if (!markdown) return '';

    // Função para processar estilos inline (negrito, itálico, code inline)
    const processInline = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em class="text-gray-400">$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-800 text-indigo-200 px-1.5 py-0.5 rounded font-mono text-sm border border-gray-700">$1</code>');
    };

    const lines = markdown.split('\n');
    let html = '';
    let inCodeBlock = false;
    let codeLanguage = '';
    let codeBuffer = [];
    let inList = false;
    let listType = ''; // 'ul' or 'ol'

    const closeList = () => {
        if (inList) {
            html += `</${listType}>\n`;
            inList = false;
        }
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        // Detectar Bloco de Código
        if (line.trim().startsWith('```')) {
            if (!inCodeBlock) {
                closeList();
                inCodeBlock = true;
                codeLanguage = line.trim().substring(3) || 'text';
                codeBuffer = [];
            } else {
                inCodeBlock = false;
                html += `<div class="relative my-6">
                    <div class="absolute top-0 right-0 bg-gray-700 text-gray-400 text-[10px] px-2 py-1 rounded-bl-md uppercase font-bold">${codeLanguage}</div>
                    <pre class="bg-[#0d1117] p-4 rounded-xl overflow-x-auto border border-gray-800 shadow-inner"><code class="text-blue-300 font-mono text-sm">${codeBuffer.join('\n').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
                </div>\n`;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBuffer.push(line);
            continue;
        }

        // Linha vazia
        if (line.trim() === '') {
            closeList();
            continue;
        }

        // Cabeçalhos
        const hMatch = line.match(/^(#{1,3})\s+(.*)/);
        if (hMatch) {
            closeList();
            const level = hMatch[1].length;
            const content = processInline(hMatch[2]);
            if (level === 1) html += `<h1 class="text-3xl font-bold mt-8 mb-4 border-b border-gray-700 pb-2">${content}</h1>\n`;
            else if (level === 2) html += `<h2 class="text-2xl font-semibold mt-6 mb-3 text-indigo-400">${content}</h2>\n`;
            else if (level === 3) html += `<h3 class="text-xl font-medium mt-4 mb-2 text-gray-200">${content}</h3>\n`;
            continue;
        }

        // Listas Não Ordenadas
        const ulMatch = line.match(/^[\*\-\+]\s+(.*)/);
        if (ulMatch) {
            if (!inList || listType !== 'ul') {
                closeList();
                html += '<ul class="list-disc ml-6 space-y-2 my-4 text-gray-300">\n';
                inList = true;
                listType = 'ul';
            }
            html += `  <li>${processInline(ulMatch[1])}</li>\n`;
            continue;
        }

        // Listas Ordenadas
        const olMatch = line.match(/^\d+\.\s+(.*)/);
        if (olMatch) {
            if (!inList || listType !== 'ol') {
                closeList();
                html += '<ol class="list-decimal ml-6 space-y-2 my-4 text-gray-300">\n';
                inList = true;
                listType = 'ol';
            }
            html += `  <li>${processInline(olMatch[1])}</li>\n`;
            continue;
        }

        // Blockquotes
        const bqMatch = line.match(/^>\s+(.*)/);
        if (bqMatch) {
            closeList();
            html += `<blockquote class="border-l-4 border-indigo-500 pl-4 py-2 my-4 italic text-gray-400 bg-gray-800/30 rounded-r-lg">${processInline(bqMatch[1])}</blockquote>\n`;
            continue;
        }

        // Parágrafo (Texto normal)
        closeList();
        html += `<p class="my-4 leading-relaxed text-gray-300">${processInline(line)}</p>\n`;
    }

    closeList();
    return html;
};
