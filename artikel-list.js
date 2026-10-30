// artikel-list.js — menampilkan kartu artikel dari tabel pz_articles (sumber tunggal: admin > Kelola Artikel).
// Dipakai oleh artikel.html (semua artikel + filter kategori), zero-waste.html dan pandansimo.html (per kategori).
// Cara pakai di halaman: <div data-article-list data-tags="Zero Waste,Rekayasa Hijau" data-order="asc"></div>
// Tambah data-filter="1" untuk menampilkan tombol filter kategori.
(function(){
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
  function strip(s){ return String(s==null?'':s).replace(/[#*]/g,'').replace(/\[foto:[^\]]*\]/g,'').trim(); }
  var PH = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 13c0-5 4-9 9-9 1 0 1.3.4 1.3 1.3C14.3 9.6 10 13 5.3 13 4.4 13 4 12.6 4 13z"/><path d="M4.5 19 14 9"/></svg>';
  function thumb(img){
    var ph = '<div class="thumbph">'+PH+'</div>';
    if(!img) return ph;
    return '<img loading="lazy" src="'+esc(img)+'" alt="" onerror="this.outerHTML=this.getAttribute(\'data-ph\')" data-ph="'+esc(ph)+'">';
  }
  function curLang(){ return document.documentElement.getAttribute('data-lang') || 'id'; }
  function applyLang(root){
    var l = curLang();
    root.querySelectorAll('[lang="id"]').forEach(function(e){ e.hidden = (l !== 'id'); });
    root.querySelectorAll('[lang="en"]').forEach(function(e){ e.hidden = (l !== 'en'); });
  }

  function init(host){
    if(!window.supabase || !window.ZW_SUPABASE_URL) return;
    window.PZ_SB = window.PZ_SB || window.supabase.createClient(window.ZW_SUPABASE_URL, window.ZW_SUPABASE_KEY);
    var tags = (host.getAttribute('data-tags') || '').split(',').map(function(x){ return x.trim(); }).filter(Boolean);
    var asc = host.getAttribute('data-order') === 'asc';
    var withFilter = host.getAttribute('data-filter') === '1';
    var rows = [], active = '';
    var chipsEl = document.createElement('div');
    chipsEl.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px;';
    var gridEl = document.createElement('div');
    gridEl.className = 'grid cols-3';
    var emptyEl = document.createElement('p');
    emptyEl.style.display = 'none';
    emptyEl.innerHTML = '<span lang="id">Belum ada artikel.</span><span lang="en" hidden>No articles yet.</span>';
    if(withFilter) host.appendChild(chipsEl);
    host.appendChild(gridEl); host.appendChild(emptyEl);

    function card(a){
      var href = 'artikel-baca.html?id=' + encodeURIComponent(a.id);
      var tagEn = a.tag_en || a.tag_id, titleEn = a.title_en || a.title_id;
      var exc = a.excerpt_id || strip(a.body_id).slice(0, 160), excEn = a.excerpt_en || strip(a.body_en).slice(0, 160) || exc;
      return '<article class="article-card">' + thumb(a.image_url) +
        '<div class="body">' +
        (a.tag_id ? '<span class="tag" lang="id">'+esc(a.tag_id)+'</span><span class="tag" lang="en" hidden>'+esc(tagEn)+'</span>' : '') +
        '<h3><span lang="id">'+esc(a.title_id)+'</span><span lang="en" hidden>'+esc(titleEn)+'</span></h3>' +
        '<p class="clamp" lang="id">'+esc(exc)+'</p><p class="clamp" lang="en" hidden>'+esc(excEn)+'</p>' +
        '<p class="readmore" style="margin-top:10px;"><a href="'+href+'" style="font-weight:600;"><span lang="id">Baca selengkapnya →</span><span lang="en" hidden>Read more →</span></a></p>' +
        '</div></article>';
    }

    function draw(){
      var list = rows.filter(function(a){ return !tags.length || tags.indexOf(a.tag_id) !== -1; });
      if(withFilter){
        var seen = {}, opts = [];
        list.forEach(function(a){ if(a.tag_id && !seen[a.tag_id]){ seen[a.tag_id] = 1; opts.push(a); } });
        var chip = function(val, idTxt, enTxt){
          var on = active === val;
          return '<button type="button" data-tag="'+esc(val)+'" style="cursor:pointer;font:inherit;font-size:.85rem;padding:6px 14px;border-radius:999px;border:1px solid var(--line);' +
            (on ? 'background:var(--navy);color:#fff;border-color:var(--navy);' : 'background:var(--surface);color:var(--navy);') + '">' +
            '<span lang="id">'+esc(idTxt)+'</span><span lang="en" hidden>'+esc(enTxt)+'</span></button>';
        };
        chipsEl.innerHTML = chip('', 'Semua', 'All') + opts.map(function(a){ return chip(a.tag_id, a.tag_id, a.tag_en || a.tag_id); }).join('');
        if(active) list = list.filter(function(a){ return a.tag_id === active; });
      }
      gridEl.innerHTML = list.map(card).join('');
      emptyEl.style.display = list.length ? 'none' : '';
      applyLang(host);
    }

    function load(){
      window.PZ_SB.from('pz_articles').select('*').order('created_at', { ascending: asc }).then(function(res){
        if(res.error){ return; }
        rows = res.data || [];
        draw();
      });
    }

    chipsEl.addEventListener('click', function(e){
      var b = e.target.closest('button[data-tag]');
      if(!b) return;
      active = b.getAttribute('data-tag');
      draw();
    });
    document.addEventListener('click', function(e){
      if(e.target.closest('.langtoggle button')) setTimeout(function(){ applyLang(host); }, 0);
    });
    load();
    window.PZ_SB.channel('pz_articles_' + Math.random().toString(36).slice(2))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pz_articles' }, load)
      .subscribe();
  }

  function start(){ document.querySelectorAll('[data-article-list]').forEach(init); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
