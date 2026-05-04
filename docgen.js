// ============================================================
// docgen.js — geração do .docx com formatação fiel ao modelo
// Replica:
//   - Heading nível 1: faixa #202050, texto branco, bold, 10pt,
//     com bordas #44546A em todos os 4 lados, espaçamento 120/120
//   - Etiqueta "SENTENÇA": faixa cinza #E7E6E6, BOLD ITÁLICO,
//     bordas cinza, 9pt, recuo esquerdo de 2268 twips (4cm)
//   - Citação: itálico 9pt, recuo esquerdo 2268 twips
//   - Subhead verba: BOLD CAPS, 10pt
//   - Corpo: 10pt Aptos
// ============================================================

const DocGen = (() => {
  const D = window.docx;
  const {
    Document, Packer, Paragraph, TextRun,
    AlignmentType, BorderStyle, ShadingType,
  } = D;

  // -------- CONSTANTES VISUAIS (espelhando o modelo) --------
  const FONT = 'Aptos';
  const SZ_BODY = 20;   // half-points = 10pt
  const SZ_CIT  = 18;   // 9pt
  const SZ_HEAD = 20;   // 10pt — modelo usa 20

  const COR_NAVY    = '202050';
  const COR_BORDA_NAVY = '44546A';
  const COR_CINZA   = 'E7E6E6';
  const COR_PRETO   = '000000';
  const COR_BRANCO  = 'FFFFFF';

  const INDENT_CITACAO = 2268; // twips (4cm)

  // ----------------------------------------------------------------
  // HEADING NÍVEL 1: faixa azul-marinho com bordas e texto branco
  // ----------------------------------------------------------------
  function headingAzul(text) {
    return new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: COR_NAVY, color: 'auto' },
      border: {
        top:    { style: BorderStyle.SINGLE, size: 4, space: 1, color: COR_BORDA_NAVY },
        left:   { style: BorderStyle.SINGLE, size: 4, space: 4, color: COR_BORDA_NAVY },
        bottom: { style: BorderStyle.SINGLE, size: 4, space: 1, color: COR_BORDA_NAVY },
        right:  { style: BorderStyle.SINGLE, size: 4, space: 4, color: COR_BORDA_NAVY },
      },
      spacing: { before: 120, after: 120 },
      alignment: AlignmentType.LEFT,
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: SZ_HEAD,
          color: COR_BRANCO,
          font: FONT,
        }),
      ],
    });
  }

  // ----------------------------------------------------------------
  // SUBHEAD VERBA — bold caps, 10pt
  // ----------------------------------------------------------------
  function subheadVerba(text) {
    return new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold: true,
          size: SZ_HEAD,
          color: COR_PRETO,
          font: FONT,
        }),
      ],
    });
  }

  // ----------------------------------------------------------------
  // ETIQUETA "SENTENÇA": faixa cinza com bordas, BOLD ITÁLICO,
  // recuo esquerdo igual ao da citação (alinha visualmente)
  // ----------------------------------------------------------------
  function etiquetaSentenca() {
    return new Paragraph({
      shading: { type: ShadingType.CLEAR, fill: COR_CINZA, color: 'auto' },
      border: {
        top:    { style: BorderStyle.SINGLE, size: 4, space: 1, color: COR_CINZA },
        left:   { style: BorderStyle.SINGLE, size: 4, space: 4, color: COR_CINZA },
        bottom: { style: BorderStyle.SINGLE, size: 4, space: 1, color: COR_CINZA },
        right:  { style: BorderStyle.SINGLE, size: 4, space: 4, color: COR_CINZA },
      },
      indent: { left: INDENT_CITACAO },
      spacing: { before: 60, after: 0 },
      children: [
        new TextRun({
          text: 'SENTENÇA',
          bold: true,
          italics: true,
          size: SZ_CIT,
          color: COR_PRETO,
          font: FONT,
        }),
      ],
    });
  }

  // ----------------------------------------------------------------
  // CITAÇÃO: itálico 9pt, recuo 4cm
  // ----------------------------------------------------------------
  function citacao(text) {
    let t = (text || '').trim();
    if (!t) return null;
    if (!/^[“"]/.test(t)) t = '“' + t;
    if (!/[”"]\s*$/.test(t)) t = t + '”';
    return new Paragraph({
      indent: { left: INDENT_CITACAO, firstLine: 0 },
      spacing: { before: 60, after: 60, line: 300 },
      alignment: AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: t,
          italics: true,
          size: SZ_CIT,
          font: FONT,
        }),
      ],
    });
  }

  // ----------------------------------------------------------------
  // CORPO 10pt Aptos
  // ----------------------------------------------------------------
  function corpo(text, opts = {}) {
    return new Paragraph({
      spacing: { before: 60, after: 60, line: 300 },
      alignment: opts.alignment || AlignmentType.JUSTIFIED,
      children: [
        new TextRun({
          text: text || '',
          size: SZ_BODY,
          font: FONT,
          bold: !!opts.bold,
          italics: !!opts.italics,
        }),
      ],
    });
  }

  function blocoResumo(titulo, texto) {
    const out = [];
    if (titulo) {
      out.push(new Paragraph({
        spacing: { before: 140, after: 60 },
        children: [
          new TextRun({ text: titulo, bold: true, size: SZ_BODY, font: FONT }),
        ],
      }));
    }
    const linhas = (texto || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const linha of linhas) {
      out.push(new Paragraph({
        spacing: { before: 30, after: 30, line: 300 },
        alignment: AlignmentType.JUSTIFIED,
        children: [
          new TextRun({ text: linha, size: SZ_BODY, font: FONT }),
        ],
      }));
    }
    return out;
  }

  function fmtData(iso) {
    if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  // ============================================================
  // BLOCO "DO PARECER TÉCNICO" (texto fixo, 2 versões)
  // ============================================================
  const TXT_PARECER_COM_IMPUG = [
    'Este parecer tem por finalidade traduzir, em linguagem técnica e objetiva, tudo o que a sentença determinou em termos de cálculo de liquidação. Pedido a pedido, são extraídos da decisão os parâmetros vinculantes (período, base de cálculo, percentuais, reflexos, índices de correção e juros), de modo que o advogado tenha, em um único documento, o mapa completo das verbas deferidas e indeferidas, com os respectivos trechos da sentença que sustentam cada parâmetro. Com isso, fica claro o que integra a condenação, sob qual critério e dentro de quais limites objetivos da coisa julgada (art. 879, §1º, da CLT).',
    'Em complemento, o parecer apresenta a manifestação técnica sobre a planilha apresentada pela parte adversa, indicando ponto a ponto os equívocos identificados (inclusão de verba indeferida, percentuais majorados, base de cálculo incorreta, ausência de verbas devidas) e fundamentando cada impugnação no comando sentencial. Serve, portanto, como instrumento de duas funções simultâneas: conferência da liquidação, para garantir que nenhuma verba seja paga a mais ou a menos do que o título executivo determina, e subsídio técnico para a peça de impugnação aos cálculos, entregando ao advogado os argumentos prontos e ancorados na sentença.',
  ];

  const TXT_PARECER_SEM_IMPUG = [
    'Este parecer tem por finalidade traduzir, em linguagem técnica e objetiva, tudo o que a sentença determinou em termos de cálculo de liquidação. Pedido a pedido, são extraídos da decisão os parâmetros vinculantes (período, base de cálculo, percentuais, reflexos, índices de correção e juros), de modo que o advogado tenha, em um único documento, o mapa completo das verbas deferidas e indeferidas, com os respectivos trechos da sentença que sustentam cada parâmetro. Com isso, fica claro o que integra a condenação, sob qual critério e dentro de quais limites objetivos da coisa julgada (art. 879, §1º, da CLT).',
    'Serve, portanto, como instrumento de conferência e controle da liquidação, permitindo ao advogado validar a apuração das verbas, antecipar o resultado econômico da condenação e fundamentar tecnicamente eventuais manifestações futuras nos autos, sempre em estrita observância aos limites do título executivo.',
  ];

  // ================================================================
  // GERAÇÃO PRINCIPAL
  // ================================================================
  async function generate(data) {
    const blocos = [];

    // -------- TÍTULO --------
    blocos.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [
        new TextRun({
          text: 'PARECER TÉCNICO',
          bold: true,
          size: 36,
          color: COR_NAVY,
          font: FONT,
        }),
      ],
    }));

    blocos.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 320 },
      children: [
        new TextRun({
          text: 'Liquidação de Sentença',
          italics: true,
          size: SZ_BODY,
          color: '4A4A55',
          font: FONT,
        }),
      ],
    }));

    // -------- DADOS PROCESSUAIS --------
    blocos.push(headingAzul('Dados Processuais'));
    const p = data.processo;
    if (p.tribunal)     blocos.push(corpo(`Tribunal: ${p.tribunal}`));
    if (p.orgao)        blocos.push(corpo(`Órgão julgador: ${p.orgao}`));
    if (p.tipoFeito)    blocos.push(corpo(`Tipo de feito: ${p.tipoFeito}`));
    if (p.numProcesso)  blocos.push(corpo(`Nº do processo: ${p.numProcesso}`));
    if (p.reclamante)   blocos.push(corpo(`Reclamante: ${p.reclamante}`));
    if (p.reclamada)    blocos.push(corpo(`Reclamada: ${p.reclamada}`));

    // -------- DADOS CONTRATUAIS --------
    blocos.push(headingAzul('Dados Contratuais'));
    const c = data.contrato;
    if (c.admissao)    blocos.push(corpo(`Data de admissão: ${fmtData(c.admissao)}`));
    if (c.demissao)    blocos.push(corpo(`Data de demissão: ${fmtData(c.demissao)}`));
    if (c.ajuizamento) blocos.push(corpo(`Data de ajuizamento: ${fmtData(c.ajuizamento)}`));
    if (c.funcao)      blocos.push(corpo(`Função: ${c.funcao}`));
    if (c.remuneracao) blocos.push(corpo(`Última remuneração: ${c.remuneracao}`));
    if (c.semPrescricao) {
      blocos.push(corpo(`Prescrição: não há.`));
    } else if (c.marcoPrescricao) {
      blocos.push(corpo(`Marco prescricional: ${fmtData(c.marcoPrescricao)}`));
    }

    // -------- DO PARECER TÉCNICO --------
    blocos.push(headingAzul('Do Parecer Técnico'));
    const textoFinal = data.decisao.tipo === 'impugnacao'
      ? TXT_PARECER_COM_IMPUG
      : TXT_PARECER_SEM_IMPUG;
    for (const par of textoFinal) {
      blocos.push(corpo(par));
    }

    // -------- DOS PEDIDOS DEFERIDOS --------
    if (data.verbas.length > 0) {
      blocos.push(headingAzul('Dos Pedidos Deferidos'));
      for (const v of data.verbas) {
        if (!v.nome && !v.trecho && !v.resumo) continue;
        if (v.nome) blocos.push(subheadVerba(v.nome));
        if (v.trecho) {
          blocos.push(etiquetaSentenca());
          const linhasTrecho = v.trecho.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          for (const linha of linhasTrecho) {
            const ct = citacao(linha);
            if (ct) blocos.push(ct);
          }
        }
        if (v.resumo) {
          blocos.push(...blocoResumo('Resumo objetivo por tópicos:', v.resumo));
        }
      }
    }

    // -------- HONORÁRIOS SUCUMBENCIAIS --------
    const e = data.encargos;
    if (e.honSucTrecho || e.honSucResumo) {
      blocos.push(subheadVerba('Honorários Sucumbenciais'));
      if (e.honSucTrecho) {
        blocos.push(etiquetaSentenca());
        const ct = citacao(e.honSucTrecho);
        if (ct) blocos.push(ct);
      }
      if (e.honSucResumo) blocos.push(...blocoResumo('Resumo objetivo:', e.honSucResumo));
    }

    // -------- ATUALIZAÇÃO MONETÁRIA E JUROS --------
    if (e.atualizaTrecho || e.atualizaResumo) {
      blocos.push(headingAzul('Atualização Monetária e Juros'));
      if (e.atualizaTrecho) {
        blocos.push(etiquetaSentenca());
        const ct = citacao(e.atualizaTrecho);
        if (ct) blocos.push(ct);
      }
      if (e.atualizaResumo) blocos.push(...blocoResumo('Resumo objetivo:', e.atualizaResumo));
    }

    // -------- HONORÁRIOS PERICIAIS --------
    if (e.temPericia && (e.honPerTrecho || e.honPerResumo)) {
      blocos.push(subheadVerba('Honorários Periciais'));
      if (e.honPerTrecho) {
        blocos.push(etiquetaSentenca());
        const ct = citacao(e.honPerTrecho);
        if (ct) blocos.push(ct);
      }
      if (e.honPerResumo) blocos.push(...blocoResumo('Resumo objetivo:', e.honPerResumo));
    }

    // -------- CUSTAS --------
    if (e.custasTrecho || e.custasResumo) {
      blocos.push(subheadVerba('Custas'));
      if (e.custasTrecho) {
        blocos.push(etiquetaSentenca());
        const ct = citacao(e.custasTrecho);
        if (ct) blocos.push(ct);
      }
      if (e.custasResumo) blocos.push(...blocoResumo('Resumo objetivo:', e.custasResumo));
    }

    // -------- IMPUGNAÇÕES --------
    if (data.decisao.tipo === 'impugnacao' && data.decisao.impugnacoes.length > 0) {
      blocos.push(headingAzul('Impugnações Sugeridas aos Cálculos Autorais'));
      for (const imp of data.decisao.impugnacoes) {
        if (!imp.titulo && !imp.descricao && !imp.trecho) continue;
        if (imp.titulo) blocos.push(subheadVerba(imp.titulo));
        if (imp.trecho) {
          blocos.push(etiquetaSentenca());
          const ct = citacao(imp.trecho);
          if (ct) blocos.push(ct);
        }
        if (imp.descricao) {
          const linhas = imp.descricao.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
          for (const linha of linhas) {
            blocos.push(corpo(linha));
          }
        }
      }
    }

    // -------- ASSINATURA --------
    blocos.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 60 },
      children: [
        new TextRun({ text: '___________________________________________', size: SZ_BODY, font: FONT }),
      ],
    }));
    blocos.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 },
      children: [
        new TextRun({
          text: data.decisao.peritoNome || '',
          bold: true,
          size: SZ_BODY,
          font: FONT,
        }),
      ],
    }));
    if (data.decisao.peritoDoc) {
      blocos.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: data.decisao.peritoDoc,
            size: SZ_BODY,
            font: FONT,
          }),
        ],
      }));
    }

    // -------- MONTAR DOCUMENTO --------
    const doc = new Document({
      creator: 'Gerador de Parecer Técnico',
      title: `Parecer Técnico — ${data.processo.numProcesso || 'sem número'}`,
      styles: {
        default: {
          document: {
            run: { font: FONT, size: SZ_BODY },
          },
        },
      },
      sections: [{
        properties: {
          page: {
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 }, // 2cm
          },
        },
        children: blocos,
      }],
    });

    const blob = await Packer.toBlob(doc);
    const nome = `Parecer_Tecnico_${(data.processo.numProcesso || 'sem_numero').replace(/[^\w-]/g, '_')}.docx`;
    saveAs(blob, nome);
  }

  return { generate };
})();
