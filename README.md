# Gerador de Parecer Técnico

Aplicativo web client-side que monta **Pareceres Técnicos** de liquidação de sentença trabalhista. O aluno preenche o fluxo guiado (dados processuais → contrato → verbas → encargos → finalização) e o app exporta um arquivo `.docx` pronto, com diagramação padronizada.

## Como rodar localmente

Abra o `index.html` em qualquer navegador moderno. Não precisa de servidor — tudo roda no navegador.

## Como publicar no GitHub Pages

1. Suba esta pasta para um repositório público no GitHub.
2. Em **Settings → Pages**, escolha branch `main` e pasta `/ (root)`.
3. Acesse `https://<seu-usuário>.github.io/<nome-do-repo>/`.

## Stack

- HTML + CSS + JavaScript puro (zero build).
- [docx.js](https://github.com/dolanmiu/docx) (CDN unpkg) para geração do `.docx`.
- [FileSaver.js](https://github.com/eligrey/FileSaver.js) (CDN unpkg) para download.
- `localStorage` para autosave do rascunho.

## Estrutura

```
index.html      — layout das telas
style.css       — design e tipografia
state.js        — modelo de dados + autosave
extract.js      — regex de extração do cabeçalho do PJe
ui.js           — controle de telas e listas dinâmicas
docgen.js       — montagem do .docx
app.js          — orquestração e binds
```

## Fluxo

1. **Dados processuais** — cola o cabeçalho cru do PJe; o app extrai órgão, tribunal, tipo, número e partes (regex tolerante a textos colados).
2. **Dados contratuais** — datas (admissão, demissão, ajuizamento), função, remuneração, prescrição.
3. **Verbas** — loop livre. Para cada verba: nome + trecho da sentença + resumo objetivo.
4. **Encargos** — honorários sucumbenciais, atualização monetária, honorários periciais (opcional), custas.
5. **Finalizar** — escolhe gerar parecer simples ou com impugnações; preenche assinatura.

## Privacidade

Tudo é processado no navegador. O `localStorage` mantém o rascunho apenas no dispositivo do usuário.
