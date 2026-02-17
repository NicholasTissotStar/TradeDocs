const buildTeamContext = (teamData) => {
  let context = '';
  if (teamData?.description) {
    context += `Objetivo do Projeto:\n${teamData.description}\n\n`;
  }
  if (teamData?.uploadedFiles?.length > 0) {
    context += 'Arquivos de Contexto Anexados:\n';
    teamData.uploadedFiles.forEach(f => {
      context += `--- ARQUIVO: ${f.name} ---\n`;
      if (f.type === 'json') context += `\`\`\`json\n${f.content}\n\`\`\`\n\n`;
      else context += `${f.content}\n\n`;
    });
  }
  if (teamData?.pastedCode) {
    context += `Código Colado Manualmente:\n${teamData.pastedCode}\n\n`;
  }
  return context || 'Sem contexto técnico adicional.';
};

const systemPrompt = (team) => {
  const base = 'Sua tarefa é criar a documentação mais detalhada e concisa possível, exclusivamente em Português do Brasil. Estruture respostas em parágrafos bem escritos e explicativos. Use blocos de código markdown com a linguagem correta.';
  return `Você é um consultor técnico sênior. ${base}`;
};

export const generateDocumentStructureWithOpenAI = async (params, apiKey) => {
  if (!apiKey) throw new Error('Chave da OpenAI não configurada.');
  const { projectName, team, teamData } = params;
  const prompt = `Analise o projeto "${projectName}" e seu contexto técnico a seguir:\n\n${buildTeamContext(teamData)}\n\nSugira uma estrutura de documentação dividida em tópicos e subtópicos para este projeto. Responda apenas com JSON com o formato: {"structure":[{"title":string,"children":[{"title":string}]}]}.`;
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt(team) },
      { role: 'user', content: prompt },
    ],
    temperature: 0.2,
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(t || 'Falha na API OpenAI');
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  try {
    const parsed = JSON.parse(content);
    return parsed.structure || [];
  } catch {
    return [];
  }
};

export const generateFullDocumentContentWithOpenAI = async (params, structures, apiKey, progressCallback, onToken) => {
  if (!apiKey) throw new Error('Chave da OpenAI não configurada.');
  const { projectName, team, teamData } = params;
  progressCallback?.({ progress: 10, message: 'Iniciando análise com OpenAI...' });
  const prompt = `Gere uma documentação técnica premium para o projeto "${projectName}". Baseie-se na estrutura: ${JSON.stringify(structures)}.\n\nContexto Técnico Completo:\n${buildTeamContext(teamData)}\n\nResponda em Markdown.`;
  const body = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt(team) },
      { role: 'user', content: prompt },
    ],
    temperature: 0.4,
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(t || 'Falha na API OpenAI');
  }
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '';
  onToken?.(content);
  progressCallback?.({ progress: 100, message: 'Documentação finalizada com sucesso!' });
  return {
    title: projectName,
    content,
    sources: [],
  };
};

