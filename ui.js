// ============================================================
// ui.js — controle de telas, render de listas dinâmicas
// ============================================================

const Screens = ['processo', 'contrato', 'verbas', 'encargos', 'decisao'];

const UI = {
  current: 'processo',

  showScreen(name) {
    if (!Screens.includes(name)) return;
    Screens.forEach(s => {
      const el = document.getElementById(`screen-${s}`);
      if (el) el.classList.toggle('hidden', s !== name);
    });
    document.querySelectorAll('.step').forEach(st => {
      const isActive = st.dataset.step === name;
      const idxCurrent = Screens.indexOf(name);
      const idxStep = Screens.indexOf(st.dataset.step);
      st.classList.toggle('active', isActive);
      st.classList.toggle('completed', idxStep < idxCurrent);
    });
    this.current = name;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // --- carrega state nos inputs ---
  hydrate() {
    const d = State.data;

    // processo
    setVal('raw-processo', d.processo.raw);
    setVal('orgao', d.processo.orgao);
    setVal('tribunal', d.processo.tribunal);
    setVal('tipo-feito', d.processo.tipoFeito);
    setVal('num-processo', d.processo.numProcesso);
    setVal('reclamante', d.processo.reclamante);
    setVal('reclamada', d.processo.reclamada);

    // contrato
    setVal('admissao', d.contrato.admissao);
    setVal('demissao', d.contrato.demissao);
    setVal('ajuizamento', d.contrato.ajuizamento);
    setVal('funcao', d.contrato.funcao);
    setVal('remuneracao', d.contrato.remuneracao);
    setChecked('sem-prescricao', d.contrato.semPrescricao);
    setVal('marco-prescricao', d.contrato.marcoPrescricao);
    document.getElementById('box-prescricao').classList.toggle('hidden', d.contrato.semPrescricao);

    // verbas
    this.renderVerbas();

    // encargos
    setVal('hon-suc-trecho', d.encargos.honSucTrecho);
    setVal('hon-suc-resumo', d.encargos.honSucResumo);
    setVal('atualiza-trecho', d.encargos.atualizaTrecho);
    setVal('atualiza-resumo', d.encargos.atualizaResumo);
    setChecked('tem-pericia', d.encargos.temPericia);
    document.getElementById('box-pericia').classList.toggle('hidden', !d.encargos.temPericia);
    setVal('hon-per-trecho', d.encargos.honPerTrecho);
    setVal('hon-per-resumo', d.encargos.honPerResumo);
    setVal('custas-trecho', d.encargos.custasTrecho);
    setVal('custas-resumo', d.encargos.custasResumo);

    // decisao
    document.querySelectorAll('input[name="tipo-parecer"]').forEach(r => {
      r.checked = (r.value === d.decisao.tipo);
    });
    document.getElementById('box-impugnacoes').classList.toggle('hidden', d.decisao.tipo !== 'impugnacao');
    setVal('perito-nome', d.decisao.peritoNome);
    setVal('perito-doc', d.decisao.peritoDoc);
    this.renderImpugnacoes();
  },

  renderVerbas() {
    const container = document.getElementById('verbas-list');
    container.innerHTML = '';
    State.data.verbas.forEach((v, i) => {
      const card = document.createElement('div');
      card.className = 'verba-card';
      card.dataset.id = v.id;
      card.innerHTML = `
        <span class="verba-num">${i + 1}</span>
        <button class="verba-remove" type="button" title="Remover verba" aria-label="Remover verba">×</button>
        <label class="lbl"><span>nome da verba</span>
          <input type="text" data-field="nome" placeholder="Ex.: ADICIONAL DE INSALUBRIDADE">
        </label>
        <label class="lbl"><span>trecho da sentença que deferiu</span>
          <textarea rows="4" data-field="trecho" placeholder="Cole o trecho da sentença com o critério fixado…"></textarea>
        </label>
        <label class="lbl"><span>resumo objetivo (Oráculo)</span>
          <textarea rows="4" data-field="resumo" placeholder="Cole o resumo por tópicos produzido pelo Oráculo…"></textarea>
        </label>
      `;
      card.querySelector('[data-field="nome"]').value = v.nome || '';
      card.querySelector('[data-field="trecho"]').value = v.trecho || '';
      card.querySelector('[data-field="resumo"]').value = v.resumo || '';

      card.querySelectorAll('[data-field]').forEach(input => {
        input.addEventListener('input', e => {
          v[e.target.dataset.field] = e.target.value;
          State.save();
        });
      });
      card.querySelector('.verba-remove').addEventListener('click', () => {
        if (confirm(`Remover a verba ${i + 1}?`)) {
          State.data.verbas = State.data.verbas.filter(x => x.id !== v.id);
          State.save();
          UI.renderVerbas();
        }
      });

      container.appendChild(card);
    });
  },

  addVerba() {
    State.data.verbas.push({
      id: uid(),
      nome: '',
      trecho: '',
      resumo: '',
    });
    State.save();
    this.renderVerbas();
    // focar no novo campo
    setTimeout(() => {
      const cards = document.querySelectorAll('.verba-card');
      const last = cards[cards.length - 1];
      if (last) {
        last.scrollIntoView({ behavior: 'smooth', block: 'center' });
        last.querySelector('input[data-field="nome"]').focus();
      }
    }, 100);
  },

  renderImpugnacoes() {
    const container = document.getElementById('impug-list');
    container.innerHTML = '';
    State.data.decisao.impugnacoes.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'verba-card';
      card.innerHTML = `
        <span class="verba-num">${i + 1}</span>
        <button class="verba-remove" type="button" title="Remover" aria-label="Remover">×</button>
        <label class="lbl"><span>título do ponto</span>
          <input type="text" data-field="titulo" placeholder="Ex.: DA MULTA DO ART. 467 DA CLT">
        </label>
        <label class="lbl"><span>trecho da sentença (opcional)</span>
          <textarea rows="3" data-field="trecho" placeholder="Cole o trecho que sustenta a impugnação…"></textarea>
        </label>
        <label class="lbl"><span>descrição da impugnação</span>
          <textarea rows="4" data-field="descricao" placeholder="Descreva o equívoco identificado e o argumento…"></textarea>
        </label>
      `;
      card.querySelector('[data-field="titulo"]').value = p.titulo || '';
      card.querySelector('[data-field="trecho"]').value = p.trecho || '';
      card.querySelector('[data-field="descricao"]').value = p.descricao || '';

      card.querySelectorAll('[data-field]').forEach(input => {
        input.addEventListener('input', e => {
          p[e.target.dataset.field] = e.target.value;
          State.save();
        });
      });
      card.querySelector('.verba-remove').addEventListener('click', () => {
        if (confirm(`Remover o ponto ${i + 1}?`)) {
          State.data.decisao.impugnacoes = State.data.decisao.impugnacoes.filter(x => x.id !== p.id);
          State.save();
          UI.renderImpugnacoes();
        }
      });

      container.appendChild(card);
    });
  },

  addImpugnacao() {
    State.data.decisao.impugnacoes.push({
      id: uid(),
      titulo: '',
      trecho: '',
      descricao: '',
    });
    State.save();
    this.renderImpugnacoes();
    setTimeout(() => {
      const cards = document.querySelectorAll('#impug-list .verba-card');
      const last = cards[cards.length - 1];
      if (last) {
        last.scrollIntoView({ behavior: 'smooth', block: 'center' });
        last.querySelector('input[data-field="titulo"]').focus();
      }
    }, 100);
  },
};

// ============================================================
// helpers DOM
// ============================================================
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val || '';
}
function setChecked(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = !!val;
}
