// ============================================================
// state.js — modelo de dados global + persistência localStorage
// ============================================================

const STORAGE_KEY = 'parecer_tecnico_v1';

const defaultState = () => ({
  processo: {
    raw: '',
    orgao: '',
    tribunal: '',
    tipoFeito: '',
    numProcesso: '',
    reclamante: '',
    reclamada: '',
  },
  contrato: {
    admissao: '',
    demissao: '',
    ajuizamento: '',
    funcao: '',
    remuneracao: '',
    semPrescricao: false,
    marcoPrescricao: '',
  },
  verbas: [
    // { id, nome, trecho, resumo }
  ],
  encargos: {
    honSucTrecho: '',
    honSucResumo: '',
    atualizaTrecho: '',
    atualizaResumo: '',
    temPericia: false,
    honPerTrecho: '',
    honPerResumo: '',
    custasTrecho: '',
    custasResumo: '',
  },
  decisao: {
    tipo: 'simples', // 'simples' | 'impugnacao'
    impugnacoes: [
      // { id, titulo, descricao }
    ],
    peritoNome: '',
    peritoDoc: '',
  },
});

const State = {
  data: defaultState(),

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // mesclar shallow para não quebrar com versões novas
        this.data = { ...defaultState(), ...parsed };
        // garantir que sub-objetos existem
        for (const k of Object.keys(defaultState())) {
          if (!this.data[k]) this.data[k] = defaultState()[k];
        }
      }
    } catch (e) {
      console.warn('Falha ao carregar rascunho:', e);
      this.data = defaultState();
    }
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      flashAutosave();
    } catch (e) {
      console.warn('Falha ao salvar:', e);
    }
  },

  reset() {
    this.data = defaultState();
    localStorage.removeItem(STORAGE_KEY);
  },
};

// indicador de autosave
let autosaveTimer = null;
function flashAutosave() {
  const el = document.getElementById('autosave-indicator');
  if (!el) return;
  el.classList.add('saving');
  el.textContent = 'salvando…';
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    el.classList.remove('saving');
    el.textContent = 'rascunho salvo';
  }, 600);
}

// gerador de ID único
function uid() {
  return 'v' + Math.random().toString(36).slice(2, 9);
}
