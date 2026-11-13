/* Vectixore consent gate.
 *
 * Behaviour
 *  - Shows a banner until the visitor decides (unless a decision is already stored).
 *  - Analytics is loaded ONLY after "Accept all". "Reject non-essential" loads nothing.
 *  - Gated snippets are declared in the page as:
 *      <script type="text/plain" data-cookiecategory="analytics"> ... </script>
 *    and are activated by this script after consent.
 *
 * Localisation
 *  - Banner text follows <html lang="...">: en, de, fr, tr, pt, it, es.
 *  - Missing or unknown language falls back to English.
 *
 * Storage
 *  - vectixore_consent = "full" | "necessary"
 *  - legacy keys from earlier pages are read for backward compatibility.
 */
(function () {
  'use strict';

  var KEY = 'vectixore_consent';

  var STRINGS = {
    en: {
      body: 'We use optional analytics to understand how the site is used. Nothing is loaded until you accept. See our',
      link: 'Privacy Policy',
      tail: '.',
      reject: 'Reject non-essential',
      accept: 'Accept all',
      aria: 'Analytics consent'
    },
    de: {
      body: 'Wir verwenden optionale Analysen, um die Website zu verbessern. Nichts wird geladen, bis Sie zustimmen.',
      link: 'Datenschutzerklärung',
      tail: '',
      reject: 'Nicht erforderliche ablehnen',
      accept: 'Alle akzeptieren',
      aria: 'Analyse-Einwilligung'
    },
    fr: {
      body: "Nous utilisons des analyses optionnelles pour améliorer le site. Rien n'est chargé tant que vous n'acceptez pas.",
      link: 'Politique de confidentialité',
      tail: '',
      reject: 'Refuser les non-essentiels',
      accept: 'Tout accepter',
      aria: 'Consentement analytique'
    },
    tr: {
      body: 'Siteyi geliştirmek için isteğe bağlı analizler kullanıyoruz. Kabul edene kadar hiçbir şey yüklenmez.',
      link: 'Gizlilik Politikası',
      tail: '',
      reject: 'İsteğe bağlı olanları reddet',
      accept: 'Tümünü kabul et',
      aria: 'Analitik izni'
    },
    pt: {
      body: 'Utilizamos análises opcionais para melhorar o site. Nada é carregado até aceitar.',
      link: 'Política de privacidade',
      tail: '',
      reject: 'Rejeitar não essenciais',
      accept: 'Aceitar tudo',
      aria: 'Consentimento para análise'
    },
    it: {
      body: 'Utilizziamo analisi facoltative per capire come viene usato il sito. Finché non accetti, non viene caricato nulla. Consulta la nostra',
      link: 'Informativa sulla privacy',
      tail: '.',
      reject: 'Rifiuta i non essenziali',
      accept: 'Accetta tutti',
      aria: 'Consenso per l’analisi'
    },
    es: {
      body: 'Utilizamos análisis opcionales para entender cómo se usa el sitio. No se carga nada hasta que aceptas. Consulta nuestra',
      link: 'Política de privacidad',
      tail: '.',
      reject: 'Rechazar las no esenciales',
      accept: 'Aceptar todo',
      aria: 'Consentimiento de analítica'
    },
    pl: {
      body: 'Używamy opcjonalnych analiz, aby zrozumieć, jak korzystasz z witryny. Nic nie jest ładowane, dopóki nie zaakceptujesz. Zobacz naszą',
      link: 'Politykę prywatności',
      tail: '.',
      reject: 'Odrzuć nieistotne',
      accept: 'Akceptuj wszystko',
      aria: 'Zgoda na analitykę'
    }
  };

  function currentLang() {
    var lang = (document.documentElement && document.documentElement.lang) || '';
    lang = String(lang).toLowerCase().split(/[-_]/)[0];
    return STRINGS[lang] ? lang : 'en';
  }

  function readConsent() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'full' || v === 'necessary') { return v; }
      var legacy = localStorage.getItem('cookieConsent');
      if (legacy === 'true' || legacy === 'accepted') { return 'full'; }
      if (legacy === 'rejected') { return 'necessary'; }
    } catch (e) { /* storage blocked */ }
    return null;
  }

  function writeConsent(value) {
    try { localStorage.setItem(KEY, value); } catch (e) { /* storage blocked */ }
  }

  function activateAnalytics() {
    var nodes = document.querySelectorAll('script[type="text/plain"][data-cookiecategory="analytics"]');
    for (var i = 0; i < nodes.length; i++) {
      var old = nodes[i];
      var s = document.createElement('script');
      for (var a = 0; a < old.attributes.length; a++) {
        var attr = old.attributes[a];
        if (attr.name === 'type' || attr.name === 'data-cookiecategory') { continue; }
        s.setAttribute(attr.name, attr.value);
      }
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    }
  }

  function pushEvent(name) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name });
  }

  function hideBanner() {
    var b = document.getElementById('vx-consent');
    if (b && b.parentNode) { b.parentNode.removeChild(b); }
  }

  function decide(value) {
    writeConsent(value);
    hideBanner();
    pushEvent(value === 'full' ? 'cookie_consent_full' : 'cookie_consent_necessary');
    if (value === 'full') { activateAnalytics(); }
  }

  function showBanner() {
    if (document.getElementById('vx-consent')) { return; }

    var t = STRINGS[currentLang()];

    var style = document.createElement('style');
    style.textContent =
      '#vx-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#1a1a1a;' +
      'border-top:1px solid #2a2a2a;padding:14px 20px;display:flex;flex-wrap:wrap;gap:12px;' +
      'align-items:center;justify-content:space-between;font-family:Inter,system-ui,sans-serif}' +
      '#vx-consent .vx-txt{font-size:.85rem;color:#9ca3af;flex:1 1 320px;line-height:1.5}' +
      '#vx-consent .vx-txt a{color:#80b3ff}' +
      '#vx-consent .vx-acts{display:flex;gap:10px;flex-shrink:0}' +
      '#vx-consent button{border-radius:6px;padding:8px 16px;font-weight:600;font-size:.85rem;cursor:pointer}' +
      '#vx-consent .vx-no{background:transparent;color:#f3f4f6;border:1px solid #404040}' +
      '#vx-consent .vx-yes{background:#0066FF;color:#fff;border:none}';
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.id = 'vx-consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', t.aria);

    var txt = document.createElement('div');
    txt.className = 'vx-txt';
    txt.innerHTML = t.body + ' <a href="privacy.html">' + t.link + '</a>' + t.tail;

    var acts = document.createElement('div');
    acts.className = 'vx-acts';

    var no = document.createElement('button');
    no.type = 'button';
    no.className = 'vx-no';
    no.textContent = t.reject;
    no.addEventListener('click', function () { decide('necessary'); });

    var yes = document.createElement('button');
    yes.type = 'button';
    yes.className = 'vx-yes';
    yes.textContent = t.accept;
    yes.addEventListener('click', function () { decide('full'); });

    acts.appendChild(no);
    acts.appendChild(yes);
    box.appendChild(txt);
    box.appendChild(acts);
    document.body.appendChild(box);
  }

  function init() {
    var consent = readConsent();
    if (consent === 'full') { activateAnalytics(); return; }
    if (consent === 'necessary') { return; }
    showBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
