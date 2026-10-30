// pagecards.js — kartu otomatis:
//  1) [data-pagecards] : daftar 13 halaman materi (Zero Waste & Pandansimo), judul/ringkasan/gambar
//     diambil dari halaman itu sendiri (termasuk hasil edit admin), jadi selalu ikut terbaru.
//  2) [data-related="zw|pandansimo"] : "Artikel Terkait" dari artikel admin dengan kategori yang cocok.
// Dipasang di artikel.html, index.html, dan semua halaman menu Zero Waste/Pandansimo.
(function(){
  if(!window.supabase || !window.ZW_SUPABASE_URL){ return; }
  var sb = window.PZ_SB || window.supabase.createClient(window.ZW_SUPABASE_URL, window.ZW_SUPABASE_KEY);

  var GROUPS = [
    { key:'zw', id:'Zero Waste', en:'Zero Waste', tags:['Zero Waste','Rekayasa Hijau'] },
    { key:'pandansimo', id:'Pandansimo', en:'Pandansimo', tags:['Pandansimo'] }
  ];
  var pagesList = null, contentMap = {}, imgMap = {}, articles = [];

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function plain(h){ var t = document.createElement('div'); t.innerHTML = (h==null?'':h); return t.textContent || ''; }
  function syncLang(root){
    var l = document.documentElement.getAttribute('data-lang') || 'id';
    root.querySelectorAll('[lang="id"]').forEach(function(e){ e.hidden = (l !== 'id'); });
    root.querySelectorAll('[lang="en"]').forEach(function(e){ e.hidden = (l !== 'en'); });
  }
  function bi(tag, idv, env, cls){
    var c = cls ? ' class="'+cls+'"' : '';
    return '<'+tag+c+' lang="id">'+esc(idv)+'</'+tag+'><'+tag+c+' lang="en" hidden>'+esc(env || idv)+'</'+tag+'>';
  }
  var MORE = '<span lang="id">Baca selengkapnya →</span><span lang="en" hidden>Read more →</span>';

  var PH = '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 13c0-5 4-9 9-9 1 0 1.3.4 1.3 1.3C14.3 9.6 10 13 5.3 13 4.4 13 4 12.6 4 13z"/><path d="M4.5 19 14 9"/></svg>';
  // Gambar kosong/gagal dimuat -> blok gradasi navy supaya semua kartu tetap seragam
  function thumb(img){
    var ph = '<div class="thumbph">'+PH+'</div>';
    if(!img) return ph;
    return '<img loading="lazy" src="'+esc(img)+'" alt="" onerror="this.outerHTML=this.getAttribute(\'data-ph\')" data-ph="'+esc(ph)+'">';
  }

  function pageCard(p){
    var t = contentMap[p.titleKey] || {}, l = contentMap[p.leadKey] || {};
    var tid = plain(t.id != null ? t.id : p.title.id), ten = plain(t.en != null ? t.en : p.title.en);
    var lid = plain(l.id != null ? l.id : p.lead.id),  len = plain(l.en != null ? l.en : p.lead.en);
    var img = imgMap[p.heroKey] || p.heroUrl || '';
    var g = GROUPS.filter(function(x){ return x.key === p.group; })[0];
    return '<article class="article-card">' + thumb(img) +
      '<div class="body">' + bi('span', g.id, g.en, 'tag') + bi('h3', tid, ten) + bi('p', lid, len, 'clamp') +
      '<p class="readmore" style="margin-top:10px;"><a href="'+p.file+'" style="font-weight:600;">'+MORE+'</a></p></div></article>';
  }
  function articleCard(a){
    var img = a.image_url || 'https://picsum.photos/seed/'+encodeURIComponent(a.id)+'/500/340';
    var href = 'artikel-baca.html?id=' + encodeURIComponent(a.id);
    return '<article class="article-card">' + thumb(img) + '<div class="body">' +
      (a.tag_id ? bi('span', a.tag_id, a.tag_en, 'tag') : '') +
      '<h3><span lang="id">'+esc(a.title_id)+'</span><span lang="en" hidden>'+esc(a.title_en||a.title_id)+'</span></h3>' +
      bi('p', a.excerpt_id, a.excerpt_en, 'clamp') +
      '<p class="readmore" style="margin-top:10px;"><a href="'+href+'" style="font-weight:600;">'+MORE+'</a></p></div></article>';
  }

  function renderPages(){
    document.querySelectorAll('[data-pagecards]').forEach(function(box){
      var mode = box.getAttribute('data-pagecards');
      var compact = box.getAttribute('data-variant') === 'compact';
      var gridCls = compact ? 'grid cols-4 compact' : 'grid cols-3';
      var html = '';
      GROUPS.forEach(function(g){
        if(mode !== 'grouped' && mode !== g.key) return;
        var list = (pagesList || []).filter(function(p){ return p.group === g.key; });
        if(!list.length) return;
        if(mode === 'grouped'){
          html += '<h3 class="pc-group"><span lang="id">'+esc(g.id)+'</span><span lang="en" hidden>'+esc(g.en)+'</span> <small>('+list.length+')</small></h3>';
        }
        html += '<div class="'+gridCls+'">' + list.map(pageCard).join('') + '</div>';
      });
      box.innerHTML = html;
      syncLang(box);
    });
  }
  function renderRelated(){
    document.querySelectorAll('[data-related]').forEach(function(sec){
      var g = GROUPS.filter(function(x){ return x.key === sec.getAttribute('data-related'); })[0];
      var list = g ? articles.filter(function(a){ return g.tags.indexOf(a.tag_id) !== -1; }).slice(0, 6) : [];
      var grid = sec.querySelector('[data-related-grid]');
      if(!list.length){ sec.style.display = 'none'; return; }
      sec.style.display = '';
      grid.innerHTML = list.map(articleCard).join('');
      syncLang(sec);
    });
  }

  var needPages = !!document.querySelector('[data-pagecards]');
  var needRelated = !!document.querySelector('[data-related]');
  if(!needPages && !needRelated){ return; }

  function loadAll(){
    var jobs = [];
    if(needPages){
      jobs.push(pagesList ? Promise.resolve() : fetch('pages-manifest.json').then(function(r){ return r.json(); }).then(function(j){ pagesList = j; }).catch(function(){ pagesList = []; }));
      jobs.push(sb.from('pz_content').select('key,value_id,value_en').then(function(r){
        contentMap = {}; (r.data || []).forEach(function(x){ contentMap[x.key] = { id: x.value_id, en: x.value_en }; });
      }));
      jobs.push(sb.from('pz_images').select('key,url').then(function(r){
        imgMap = {}; (r.data || []).forEach(function(x){ imgMap[x.key] = x.url; });
      }));
    }
    if(needRelated){
      jobs.push(sb.from('pz_articles').select('*').order('created_at', { ascending: false }).then(function(r){ articles = r.data || []; }));
    }
    return Promise.all(jobs).then(function(){ if(needPages) renderPages(); if(needRelated) renderRelated(); });
  }

  loadAll();
  var timer = null;
  function reload(){ clearTimeout(timer); timer = setTimeout(loadAll, 300); }
  var ch = sb.channel('pz_pagecards_' + Math.random().toString(36).slice(2));
  ['pz_content','pz_images','pz_articles'].forEach(function(t){
    ch.on('postgres_changes', { event:'*', schema:'public', table:t }, reload);
  });
  ch.subscribe();
  document.addEventListener('click', function(e){
    if(e.target.closest('.langtoggle button')) setTimeout(function(){
      document.querySelectorAll('[data-pagecards],[data-related]').forEach(syncLang);
    }, 0);
  });
})();
