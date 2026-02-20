const f=e=>{var n;let o="";return e!=null&&e.description&&(o+=`Objetivo do Projeto:
${e.description}

`),((n=e==null?void 0:e.uploadedFiles)==null?void 0:n.length)>0&&(o+=`Arquivos de Contexto Anexados:
`,e.uploadedFiles.forEach(t=>{o+=`--- ARQUIVO: ${t.name} ---
`,t.type==="json"?o+=`\`\`\`json
${t.content}
\`\`\`

`:o+=`${t.content}

`})),e!=null&&e.pastedCode&&(o+=`Código Colado Manualmente:
${e.pastedCode}

`),o||"Sem contexto técnico adicional."},w=e=>"Você é um consultor técnico sênior. Sua tarefa é criar a documentação mais detalhada e concisa possível, exclusivamente em Português do Brasil. Estruture respostas em parágrafos bem escritos e explicativos. Use blocos de código markdown com a linguagem correta.",A=async(e,o)=>{var s,p,i;if(!o)throw new Error("Chave da OpenAI não configurada.");const{projectName:n,team:t,teamData:c}=e,d=`Analise o projeto "${n}" e seu contexto técnico a seguir:

${f(c)}

Sugira uma estrutura de documentação dividida em tópicos e subtópicos para este projeto. Responda apenas com JSON com o formato: {"structure":[{"title":string,"children":[{"title":string}]}]}.`,m={model:"gpt-4o-mini",messages:[{role:"system",content:w()},{role:"user",content:d}],temperature:.2},r=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${o}`,"Content-Type":"application/json"},body:JSON.stringify(m)});if(!r.ok){const a=await r.text().catch(()=>"");throw new Error(a||"Falha na API OpenAI")}const u=((i=(p=(s=(await r.json()).choices)==null?void 0:s[0])==null?void 0:p.message)==null?void 0:i.content)||"{}";try{return JSON.parse(u).structure||[]}catch{return[]}},y=async(e,o,n,t,c)=>{var a,l,g;if(!n)throw new Error("Chave da OpenAI não configurada.");const{projectName:d,team:m,teamData:r}=e;t==null||t({progress:10,message:"Iniciando análise com OpenAI..."});const h=`Gere uma documentação técnica premium para o projeto "${d}". Baseie-se na estrutura: ${JSON.stringify(o)}.

Contexto Técnico Completo:
${f(r)}

Responda em Markdown.`,u={model:"gpt-4o-mini",messages:[{role:"system",content:w()},{role:"user",content:h}],temperature:.4},s=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${n}`,"Content-Type":"application/json"},body:JSON.stringify(u)});if(!s.ok){const O=await s.text().catch(()=>"");throw new Error(O||"Falha na API OpenAI")}const i=((g=(l=(a=(await s.json()).choices)==null?void 0:a[0])==null?void 0:l.message)==null?void 0:g.content)||"";return c==null||c(i),t==null||t({progress:100,message:"Documentação finalizada com sucesso!"}),{title:d,content:i,sources:[]}};export{A as generateDocumentStructureWithOpenAI,y as generateFullDocumentContentWithOpenAI};
