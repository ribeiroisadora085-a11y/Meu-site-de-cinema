// ── Fallback encadeado de imagens ───────────────────────────
function imgError(img, fallbacks) {
  img.onerror = null;
  if (fallbacks.length > 0) {
    var next = fallbacks.shift();
    img.onerror = function() { imgError(img, fallbacks); };
    img.src = next;
  }
}

// ── Favoritos (salvo no navegador) ──────────────────────────
var favs = JSON.parse(localStorage.getItem('cine-favs') || '[]');

function toggleFav(btn, titulo) {
  var idx = favs.indexOf(titulo);
  if (idx === -1) {
    favs.push(titulo);
    btn.textContent = '♥';
    btn.classList.add('ativo');
  } else {
    favs.splice(idx, 1);
    btn.textContent = '♡';
    btn.classList.remove('ativo');
  }
  localStorage.setItem('cine-favs', JSON.stringify(favs));
  atualizarContadorFavs();
  // Se filtro de favoritos estiver ativo, re-aplica
  var filtroAtivo = document.querySelector('.filtro-btn.ativo');
  if (filtroAtivo && filtroAtivo.dataset.filtro === 'favorito') {
    filtrar('favorito');
  }
}

function atualizarContadorFavs() {
  var total = favs.length;
  document.getElementById('fav-count').textContent = total;
  document.getElementById('stat-favs').textContent = total;
}

function carregarFavsSalvos() {
  document.querySelectorAll('.card').forEach(function(card) {
    var titulo = card.dataset.titulo;
    if (favs.indexOf(titulo) !== -1) {
      var btn = card.querySelector('.fav-btn');
      if (btn) { btn.textContent = '♥'; btn.classList.add('ativo'); }
    }
  });
  atualizarContadorFavs();
}

// ── Filtrar por categoria ────────────────────────────────────
var filtroAtual = 'todos';

function filtrar(cat) {
  filtroAtual = cat;
  var cards = document.querySelectorAll('.card');
  var visiveis = 0;

  cards.forEach(function(card) {
    var catCard    = card.dataset.cat;
    var ehFavorito = favs.indexOf(card.dataset.titulo) !== -1;
    var mostrar =
      cat === 'todos'     ? true :
      cat === 'favorito'  ? ehFavorito :
      catCard === cat;

    // respeita busca ativa também
    var termoBusca = document.getElementById('busca').value.trim().toLowerCase();
    if (termoBusca) {
      var titulo = (card.dataset.titulo || '').toLowerCase();
      mostrar = mostrar && titulo.includes(termoBusca);
    }

    card.classList.toggle('escondido', !mostrar);
    if (mostrar) visiveis++;
  });

  document.getElementById('stat-total').textContent = visiveis;
  document.getElementById('sem-resultado').style.display = visiveis === 0 ? 'block' : 'none';

  // Atualiza botões
  document.querySelectorAll('.filtro-btn').forEach(function(b) {
    b.classList.toggle('ativo', b.dataset.filtro === cat);
  });
}

// ── Busca em tempo real ──────────────────────────────────────
function buscar(termo) {
  termo = termo.trim().toLowerCase();
  var cards   = document.querySelectorAll('.card');
  var visiveis = 0;

  cards.forEach(function(card) {
    var titulo  = (card.dataset.titulo || '').toLowerCase();
    var catCard = card.dataset.cat;

    var passaFiltro =
      filtroAtual === 'todos'    ? true :
      filtroAtual === 'favorito' ? favs.indexOf(card.dataset.titulo) !== -1 :
      catCard === filtroAtual;

    var passaBusca = !termo || titulo.includes(termo);
    var mostrar = passaFiltro && passaBusca;

    card.classList.toggle('escondido', !mostrar);
    if (mostrar) visiveis++;
  });

  document.getElementById('stat-total').textContent = visiveis;

  var semRes = document.getElementById('sem-resultado');
  if (visiveis === 0 && termo) {
    document.getElementById('busca-termo').textContent = termo;
    semRes.style.display = 'block';
  } else {
    semRes.style.display = 'none';
  }
}

// ── Modal ────────────────────────────────────────────────────
function mostrarInfo(titulo, meta, texto) {
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-meta').textContent   = meta;
  document.getElementById('modal-texto').textContent  = texto;
  document.getElementById('modal').classList.add('aberto');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  document.getElementById('modal').classList.remove('aberto');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') fecharModal();
});

// ── Botão Voltar ao Topo ─────────────────────────────────────
window.addEventListener('scroll', function() {
  var btn = document.getElementById('btn-topo');
  if (window.scrollY > 300) {
    btn.classList.add('visivel');
  } else {
    btn.classList.remove('visivel');
  }
});

function voltarTopo() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Formulário de contato (Formspree) ───────────────────────
async function enviarFormulario(event) {
  event.preventDefault();

  var btn  = document.getElementById('btn-enviar');
  var form = document.getElementById('form-contato');
  var ok   = document.getElementById('aviso-sucesso');
  var err  = document.getElementById('aviso-erro');

  ok.style.display  = 'none';
  err.style.display = 'none';

  // Texto de carregando
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  try {
    var data = new FormData(form);
    var response = await fetch('https://formspree.io/f/mojyodog', {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      form.reset();
      ok.style.display = 'block';
      setTimeout(function() { ok.style.display = 'none'; }, 6000);
    } else {
      err.style.display = 'block';
      setTimeout(function() { err.style.display = 'none'; }, 5000);
    }
  } catch (e) {
    err.style.display = 'block';
    setTimeout(function() { err.style.display = 'none'; }, 5000);
  }

  btn.textContent = 'Enviar Mensagem 🎬';
  btn.disabled = false;
}

// ── Inicializar ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', carregarFavsSalvos);
