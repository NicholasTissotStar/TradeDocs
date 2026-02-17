const buildTeamContext = (teamData) => {
  let context = '';
  if (teamData?.description) context += `Objetivo do Projeto:\n${teamData.description}\n\n`;
  if (teamData?.uploadedFiles?.length > 0) {
    context += 'Arquivos de Contexto Anexados:\n';
    teamData.uploadedFiles.forEach(f => {
      context += `--- ARQUIVO: ${f.name} ---\n`;
      if (f.type === 'json') context += `\`\`\`json\n${f.content}\n\`\`\`\n\n`;
      else context += `${f.content}\n\n`;
    });
  }
  if (teamData?.pastedCode) context += `Código Colado Manualmente:\n${teamData.pastedCode}\n\n`;
  return context || 'Sem contexto técnico adicional.';
};

const systemText = 'Sua tarefa é criar a documentação mais detalhada e concisa possível, exclusivamente em Português do Brasil. Estruture respostas em parágrafos bem escritos e explicativos. Use blocos de código markdown com a linguagem correta.';

export const generateDocumentStructureWithAnthropic = async (params, apiKey) => {
  if (!apiKey) throw new Error('Chave da Anthropic não configurada.');
  const { projectName, teamData } = params;
  const user = `Analise o projeto "${projectName}" e o contexto:\n\n${buildTeamContext(teamData)}\n\nSugira uma estrutura de documentação dividida em tópicos e subtópicos. Responda apenas com JSON no formato {"structure":[{"title":string,"children":[{"title":string}]}]}.`;
  const body = {
    model: 'claude-3-5-sonnet-20241022',
    system: systemText,
    messages: [{ role: 'user', content: user }],
    temperature: 0.2,
    max_tokens: 2000,
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(t || 'Falha na API Anthropic');
  }
  const data = await res.json();
  const content = data.content?.[0]?.text || '{}';
  try {
    const parsed = JSON.parse(content);
    return parsed.structure || [];
  } catch {
    return [];
  }
};

export const generateFullDocumentContentWithAnthropic = async (params, structures, apiKey, progressCallback, onToken) => {
  if (!apiKey) throw new Error('Chave da Anthropic não configurada.');
  const { projectName, teamData } = params;
  progressCallback?.({ progress: 10, message: 'Iniciando análise com Anthropic...' });
  const user = `Gere uma documentação técnica premium para o projeto "${projectName}". Baseie-se na estrutura: ${JSON.stringify(structures)}.\n\nContexto Técnico Completo:\n${buildTeamContext(teamData)}\n\nResponda em Markdown.`;
  const body = {
    model: 'claude-3-5-sonnet-20241022',
    system: systemText,
    messages: [{ role: 'user', content: user }],
    temperature: 0.4,
    max_tokens: 8000,
  };
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(t || 'Falha na API Anthropic');
  }
  const data = await res.json();
  const content = data.content?.[0]?.text || '';
  onToken?.(content);
  progressCallback?.({ progress: 100, message: 'Documentação finalizada com sucesso!' });
  return {
    title: projectName,
    content,
    sources: [],
  };
};

