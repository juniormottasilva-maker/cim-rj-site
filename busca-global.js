/* ============================================================
   CIM-RJ — Busca Global
   Consulta a tabela municipios_perfil no Supabase e mostra
   resultados em tempo real conforme o usuário digita.
   Cores usam as variáveis reais do site (--ink, --brass, --deep, --line, --muted, --paper).
   ============================================================ */

(function () {
  const SUPABASE_URL = "https://muubogojmtfvbtqfdyew.supabase.co";
  const SUPABASE_KEY = "sb_publishable_D5FT--oWJVFMhAeIGIUsUQ_ro4Minav";

  function montarHTML() {
    return `
      <div id="cimg-wrapper" style="position:relative;max-width:260px;width:100%;font-family:inherit;">
        <input id="cimg-input" type="text" placeholder="Buscar município..."
          autocomplete="off"
          style="width:100%;box-sizing:border-box;padding:9px 14px;border-radius:2px;
                 background:var(--deep);border:1px solid var(--line);color:var(--paper);
                 font-size:13px;outline:none;font-family:inherit;" />
        <div id="cimg-resultados"
          style="display:none;position:absolute;top:calc(100% + 6px);right:0;left:auto;width:340px;
                 background:var(--deep);border:1px solid var(--line);border-radius:4px;
                 max-height:420px;overflow-y:auto;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.5);">
        </div>
      </div>
    `;
  }

  function corIrco(v) {
    if (v == null) return "var(--muted)";
    if (v >= 80) return "#5fbf7a";
    if (v >= 60) return "var(--brass-bright)";
    if (v >= 40) return "#e0a13f";
    return "#d9534f";
  }

  function escapeHTML(str) {
    return String(str ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function itemHTML(m) {
    const cor = corIrco(m.irco_valor);
    const nome = escapeHTML(m.nome);
    const classificacao = escapeHTML(m.irco_classificacao);
    const slug = escapeHTML(m.slug);
    const resumoBruto = m.perfil_economico || "";
    const resumo = escapeHTML(resumoBruto.slice(0, 110)) + (resumoBruto.length > 110 ? "…" : "");
    return `
      <a href="/municipios/${slug}.html" class="cimg-item"
         style="display:block;padding:12px 16px;border-bottom:1px solid var(--line);
                text-decoration:none;color:var(--paper);font-family:'Inter',sans-serif;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <strong style="font-size:14px;font-family:'Fraunces',serif;">${nome}</strong>
          <span style="font-size:11px;padding:2px 8px;border-radius:2px;white-space:nowrap;
                       border:1px solid ${cor};color:${cor};">
            IRCO ${m.irco_valor ?? "—"} · ${classificacao}
          </span>
        </div>
        <div style="font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4;">
          ${resumo}
        </div>
      </a>
    `;
  }

  async function buscar(termo, signal) {
    if (!termo || termo.trim().length < 2) return [];
    const campos = ["nome", "perfil_economico", "irco_leitura", "regiao", "oportunidades_mercado"];
    const orFiltro = campos.map((c) => `${c}.ilike.*${encodeURIComponent(termo)}*`).join(",");
    const url = `${SUPABASE_URL}/rest/v1/municipios_perfil?select=slug,nome,perfil_economico,irco_valor,irco_classificacao,regiao&or=(${orFiltro})&limit=8`;

    try {
      const resp = await fetch(url, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        signal,
      });
      if (!resp.ok) throw new Error("Falha na busca: " + resp.status);
      return await resp.json();
    } catch (e) {
      if (e.name === "AbortError") throw e;
      console.error("[CIM-RJ busca] erro:", e);
      return [];
    }
  }

  function init() {
    const alvo = document.getElementById("cim-busca-global");
    if (!alvo) {
      console.warn('[CIM-RJ busca] Elemento <div id="cim-busca-global"></div> não encontrado na página.');
      return;
    }
    alvo.innerHTML = montarHTML();

    const input = document.getElementById("cimg-input");
    const box = document.getElementById("cimg-resultados");
    let timer = null;
    let controller = null;

    input.addEventListener("input", () => {
      clearTimeout(timer);
      if (controller) controller.abort();
      const termo = input.value;
      timer = setTimeout(async () => {
        controller = new AbortController();
        let resultados;
        try {
          resultados = await buscar(termo, controller.signal);
        } catch (e) {
          if (e.name === "AbortError") return;
          resultados = [];
        }
        if (resultados.length === 0) {
          box.style.display = termo.trim().length >= 2 ? "block" : "none";
          box.innerHTML = termo.trim().length >= 2
            ? `<div style="padding:14px 16px;color:var(--muted);font-size:13px;">Nenhum resultado ainda para "${escapeHTML(termo)}". A base cobre os municípios já pesquisados — mais chegam a cada dia.</div>`
            : "";
          return;
        }
        box.innerHTML = resultados.map(itemHTML).join("");
        box.style.display = "block";
      }, 250);
    });

    document.addEventListener("click", (ev) => {
      if (!alvo.contains(ev.target)) box.style.display = "none";
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
