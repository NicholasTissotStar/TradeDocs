const l=t=>{var n;let o="";return t!=null&&t.description&&(o+=`Objetivo do Projeto:
${t.description}

`),((n=t==null?void 0:t.uploadedFiles)==null?void 0:n.length)>0&&(o+=`Arquivos de Contexto Anexados:
`,t.uploadedFiles.forEach(e=>{o+=`--- ARQUIVO: ${e.name} ---
`,e.type==="json"?o+=`\`\`\`json
${e.content}
\`\`\`

`:o+=`${e.content}

`})),t!=null&&t.pastedCode&&(o+=`Código Colado Manualmente:
${t.pastedCode}

`),o||"Sem contexto técnico adicional."},x="Sua tarefa é criar a documentação mais detalhada e concisa possível, exclusivamente em Português do Brasil. Estruture respostas em parágrafos bem escritos e explicativos. Use blocos de código markdown com a linguagem correta.",f=async(t,o)=>{var s,d;if(!o)throw new Error("Chave da Anthropic não configurada.");const{projectName:n,teamData:e}=t,r=`Analise o projeto "${n}" e o contexto:

${l(e)}

Sugira uma estrutura de documentação dividida em tópicos e subtópicos. Responda apenas com JSON no formato {"structure":[{"title":string,"children":[{"title":string}]}]}.`,c=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":o,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-3-5-sonnet-20241022",system:x,messages:[{role:"user",content:r}],temperature:.2,max_tokens:2e3})});if(!c.ok){const i=await c.text().catch(()=>"");throw new Error(i||"Falha na API Anthropic")}const p=((d=(s=(await c.json()).content)==null?void 0:s[0])==null?void 0:d.text)||"{}";try{return JSON.parse(p).structure||[]}catch{return[]}},g=async(t,o,n,e,r)=>{var h,m;if(!n)throw new Error("Chave da Anthropic não configurada.");const{projectName:a,teamData:c}=t;e==null||e({progress:10,message:"Iniciando análise com Anthropic..."});const u=`Gere uma documentação técnica premium para o projeto "${a}". Baseie-se na estrutura: ${JSON.stringify(o)}.

Contexto Técnico Completo:
${l(c)}

Responda em Markdown.`,s=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json","x-api-key":n,"anthropic-version":"2023-06-01"},body:JSON.stringify({model:"claude-3-5-sonnet-20241022",system:x,messages:[{role:"user",content:u}],temperature:.4,max_tokens:8e3})});if(!s.ok){const y=await s.text().catch(()=>"");throw new Error(y||"Falha na API Anthropic")}const i=((m=(h=(await s.json()).content)==null?void 0:h[0])==null?void 0:m.text)||"";return r==null||r(i),e==null||e({progress:100,message:"Documentação finalizada com sucesso!"}),{title:a,content:i,sources:[]}};export{f as generateDocumentStructureWithAnthropic,g as generateFullDocumentContentWithAnthropic};
