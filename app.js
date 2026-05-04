// ============================================================
// app.js — orquestração geral
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1) carregar rascunho
  State.load();

  // 2) hidratar inputs
  UI.hydrate();

  // 3) começar na primeira tela (ou onde tiver dados)
  UI.showScreen('processo');

  // ============================================================
  // BIND: navegação entre telas
  // ============================================================
  document.querySelectorAll('[data-go]').forEach(btn => {
    btn.addEventListener('click', () => UI.showScreen(btn.dataset.go));
  });
  document.querySelectorAll('.step').forEach(st => {
    st.addEventListener('click', () => UI.showScreen(st.dataset.step));
  });

  // ============================================================
  // BIND: tela 1 — processo
  // ============================================================
  bindInput('raw-processo', v => State.data.processo.raw = v);
  bindInput('orgao', v => State.data.processo.orgao = v);
  bindInput('tribunal', v => State.data.processo.tribunal = v);
  bindInput('tipo-feito', v => State.data.processo.tipoFeito = v);
  bindInput('num-processo', v => State.data.processo.numProcesso = v);
  bindInput('reclamante', v => State.data.processo.reclamante = v);
  bindInput('reclamada', v => State.data.processo.reclamada = v);

  document.getElementById('btn-extrair').addEventListener('click', () => {
    const raw = document.getElementById('raw-processo').value;
    if (!raw.trim()) {
      alert('Cole o cabeçalho do processo primeiro.');
      return;
    }
    const out = extractProcesso(raw);
    State.data.processo = { ...State.data.processo, ...out };
    State.save();
    UI.hydrate();
    UI.showScreen('processo'); // re-exibir mesma tela já preenchida
  });

  // ============================================================
  // BIND: tela 2 — contrato
  // ============================================================
  bindInput('admissao', v => State.data.contrato.admissao = v);
  bindInput('demissao', v => State.data.contrato.demissao = v);
  bindInput('ajuizamento', v => State.data.contrato.ajuizamento = v);
  bindInput('funcao', v => State.data.contrato.funcao = v);
  bindInput('remuneracao', v => State.data.contrato.remuneracao = v);
  bindInput('marco-prescricao', v => State.data.contrato.marcoPrescricao = v);

  document.getElementById('sem-prescricao').addEventListener('change', e => {
    State.data.contrato.semPrescricao = e.target.checked;
    document.getElementById('box-prescricao').classList.toggle('hidden', e.target.checked);
    State.save();
  });

  // ============================================================
  // BIND: tela 3 — verbas
  // ============================================================
  document.getElementById('btn-add-verba').addEventListener('click', () => UI.addVerba());

  // ============================================================
  // BIND: tela 4 — encargos
  // ============================================================
  bindInput('hon-suc-trecho', v => State.data.encargos.honSucTrecho = v);
  bindInput('hon-suc-resumo', v => State.data.encargos.honSucResumo = v);
  bindInput('atualiza-trecho', v => State.data.encargos.atualizaTrecho = v);
  bindInput('atualiza-resumo', v => State.data.encargos.atualizaResumo = v);
  bindInput('hon-per-trecho', v => State.data.encargos.honPerTrecho = v);
  bindInput('hon-per-resumo', v => State.data.encargos.honPerResumo = v);
  bindInput('custas-trecho', v => State.data.encargos.custasTrecho = v);
  bindInput('custas-resumo', v => State.data.encargos.custasResumo = v);

  document.getElementById('tem-pericia').addEventListener('change', e => {
    State.data.encargos.temPericia = e.target.checked;
    document.getElementById('box-pericia').classList.toggle('hidden', !e.target.checked);
    State.save();
  });

  // ============================================================
  // BIND: tela 5 — decisão
  // ============================================================
  document.querySelectorAll('input[name="tipo-parecer"]').forEach(r => {
    r.addEventListener('change', e => {
      State.data.decisao.tipo = e.target.value;
      document.getElementById('box-impugnacoes').classList.toggle('hidden', e.target.value !== 'impugnacao');
      State.save();
    });
  });
  bindInput('perito-nome', v => State.data.decisao.peritoNome = v);
  bindInput('perito-doc', v => State.data.decisao.peritoDoc = v);
  document.getElementById('btn-add-impug').addEventListener('click', () => UI.addImpugnacao());

  // ============================================================
  // BIND: gerar documento
  // ============================================================
  document.getElementById('btn-gerar').addEventListener('click', async () => {
    const btn = document.getElementById('btn-gerar');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'gerando…';
    try {
      await DocGen.generate(State.data);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar documento: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.textContent = orig;
    }
  });

  // ============================================================
  // BIND: limpar tudo
  // ============================================================
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('Apagar todos os dados deste rascunho? Essa ação não pode ser desfeita.')) {
      State.reset();
      UI.hydrate();
      UI.showScreen('processo');
    }
  });
});

// helper: bind input -> state
function bindInput(id, setter) {
  const el = document.getElementById(id);
  if (!el) return;
  const evt = (el.tagName === 'INPUT' && (el.type === 'date' || el.type === 'checkbox')) ? 'change' : 'input';
  el.addEventListener(evt, e => {
    setter(e.target.value);
    State.save();
  });
}
