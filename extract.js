// ============================================================
// extract.js — extrai campos do cabeçalho cru do PJe
// ============================================================

function extractProcesso(raw) {
  const result = {
    orgao: '',
    tribunal: '',
    tipoFeito: '',
    numProcesso: '',
    reclamante: '',
    reclamada: '',
  };
  if (!raw || !raw.trim()) return result;

  // Normalizar: substituir múltiplos espaços/quebras por um espaço só
  let t = raw.replace(/\s+/g, ' ').trim();

  // Antes do pré-processamento agressivo, capturar tipos de feito conhecidos que costumam
  // vir colados (CumSen, ATOrd, ATSum, etc.). Lista de tokens trabalhistas comuns:
  const TIPOS_CONHECIDOS = ['CumSen', 'ATOrd', 'ATSum', 'AIRR', 'AIRO', 'AIAP',
    'ROT', 'ROPS', 'RR', 'RO', 'AP', 'AIRP', 'AI', 'CCP', 'CC',
    'MS', 'MSCiv', 'CartPrec', 'CartCív', 'AIAP'];
  for (const tipo of TIPOS_CONHECIDOS) {
    // procurar tipo seguido (ou precedido) de algo colado e separar
    const re = new RegExp(`(?<=[a-zà-ú])(${tipo})(?=\\s*\\d{7}-)`, 'g');
    t = t.replace(re, ' $1');
  }

  // Pré-processamento: o PJe frequentemente cola palavras (ex: "REGIÃO16ª", "JaneiroCumSen", "0016EXEQUENTE").
  // Inserir espaços em transições suspeitas:
  // - letra minúscula seguida de letra maiúscula
  t = t.replace(/([a-zà-ú])([A-ZÀ-Ú])/g, '$1 $2');
  // - letra seguida de dígito
  t = t.replace(/([a-zà-úA-ZÀ-Ú])(\d)/g, '$1 $2');
  // - dígito seguido de letra
  t = t.replace(/(\d)([A-ZÀ-Úa-zà-ú])/g, '$1 $2');
  // colapsar espaços novamente
  t = t.replace(/\s+/g, ' ').trim();

  // Re-juntar tipos de feito que foram fragmentados pelo pré-processamento
  // (ex: "Cum Sen" → "CumSen", "AT Ord" → "ATOrd")
  for (const tipo of TIPOS_CONHECIDOS) {
    // dividir o tipo em pares de "blocos maiúscula+resto" e reconstruir o regex
    const partes = tipo.match(/[A-Z][a-z]*/g);
    if (partes && partes.length > 1) {
      const reJoin = new RegExp('\\b' + partes.join('\\s+') + '\\b', 'g');
      t = t.replace(reJoin, tipo);
    }
  }

  // 1) Número do processo: padrão CNJ NNNNNNN-DD.AAAA.J.TR.OOOO
  const numMatch = t.match(/(\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4})/);
  if (numMatch) result.numProcesso = numMatch[1];

  // 2) Tipo de feito: token (3-10 letras maiúsculas, possivelmente com mistura)
  // Aparece imediatamente antes do número do processo.
  if (numMatch) {
    const idx = t.indexOf(numMatch[1]);
    const before = t.slice(Math.max(0, idx - 40), idx).trim();
    // Pegar última "palavra" antes do número
    const tokens = before.split(/\s+/).filter(Boolean);
    if (tokens.length) {
      const candidate = tokens[tokens.length - 1];
      // aceitar tokens curtos com letras maiúsculas (CumSen, ATOrd, ROT, RR, AIRR, ATSum, etc.)
      if (/^[A-Za-zÀ-ú]{2,12}$/.test(candidate)) {
        result.tipoFeito = candidate;
      }
    }
  }

  // 3) Tribunal: TRIBUNAL REGIONAL DO TRABALHO DA Xª REGIÃO
  const tribMatch = t.match(/TRIBUNAL\s+REGIONAL\s+DO\s+TRABALHO\s+DA\s+(\d+)[ªa]\s+REGI[ÃA]O/i);
  if (tribMatch) {
    result.tribunal = `TRT ${tribMatch[1]}ª Região`;
  }

  // 4) Órgão julgador: "Xª Vara do Trabalho de/do …" ou apenas "Vara do Trabalho de/do …"
  const varaMatch = t.match(/(\d+[ªa]\s+Vara\s+do\s+Trabalho\s+(?:de|do|da)\s+[^\d]+?)(?=\s+(?:CumSen|ATOrd|ATSum|ROT|RR|AIRR|ROPS|AP|MS)\b|\s+\d{7}-)/i);
  if (varaMatch) {
    result.orgao = varaMatch[1].trim().replace(/\s+/g, ' ');
  } else {
    // sem número de vara
    const varaSemNum = t.match(/(Vara\s+do\s+Trabalho\s+(?:de|do|da)\s+[\wÀ-ú\s]+?)(?=\s+(?:CumSen|ATOrd|ATSum|ROT|RR|AIRR|ROPS|AP|MS)\b|\s+\d{7}-)/i);
    if (varaSemNum) result.orgao = varaSemNum[1].trim().replace(/\s+/g, ' ');
  }

  // 5) Reclamante / Exequente
  const recMatch = t.match(/(?:RECLAMANTE|EXEQUENTE|AUTOR(?:A)?)\s*:\s*([^:]+?)\s*(?:RECLAMAD[AO]|EXECUTAD[AO]|R[ÉE]U|R[ÉE]:)/i);
  if (recMatch) {
    result.reclamante = recMatch[1].trim();
  } else {
    const recSimple = t.match(/(?:RECLAMANTE|EXEQUENTE|AUTOR(?:A)?)\s*:\s*([A-ZÀ-Ú][A-ZÀ-Ú\s]+)/);
    if (recSimple) result.reclamante = recSimple[1].trim();
  }

  // 6) Reclamada / Executado — pegar tudo após o marcador até o fim ou nova etiqueta
  const reaMatch = t.match(/(?:RECLAMAD[AO]|EXECUTAD[AO]|R[ÉE]U)\s*:\s*([A-ZÀ-Ú][A-ZÀ-Ú\s\.\/\-&]+?)(?:\s*$|\s+(?:RECLAMANTE|EXEQUENTE|AUTOR))/);
  if (reaMatch) {
    result.reclamada = reaMatch[1].trim();
  }

  return result;
}
