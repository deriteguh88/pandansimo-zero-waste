// content.js — mengambil teks yang sudah diedit admin dari Supabase
// (tabel pz_content) dan menimpa teks placeholder di halaman publik.
// Dipasang di SEMUA halaman publik (bukan admin.html), setelah shell.js.

(function(){
  if(!window.supabase || !window.ZW_SUPABASE_URL){ return; }
  var sb = window.supabase.createClient(window.ZW_SUPABASE_URL, window.ZW_SUPABASE_KEY);

  function applyRow(key, valId, valEn){
    if(valId != null){
      document.querySelectorAll('[data-k="'+key+'"][lang="id"]').forEach(function(el){ el.innerHTML = valId; });
    }
    if(valEn != null){
      document.querySelectorAll('[data-k="'+key+'"][lang="en"]').forEach(function(el){ el.innerHTML = valEn; });
    }
  }

  function applyVideo(key, url, videoEls){
    var isDesktop = !window.matchMedia || window.matchMedia('(min-width:761px)').matches;
    videoEls.forEach(function(video){
      if(!isDesktop){ video.style.display = 'none'; return; }
      video.src = url;
      video.style.display = 'block';
      var section = video.closest('.hero');
      var overlay = section && section.querySelector('.hero-overlay');
      if(overlay) overlay.style.display = 'block';
      var playPromise = video.play && video.play();
      if(playPromise && playPromise.catch) playPromise.catch(function(){});
    });
  }

  function applyImage(key, url){
    if(!url) return;
    var videoEls = document.querySelectorAll('[data-vid="'+key+'"]');
    if(videoEls.length){ applyVideo(key, url, videoEls); }
    document.querySelectorAll('[data-img="'+key+'"]').forEach(function(el){
      el.src = url;
      el.style.display = '';
      var holder = el.closest('.avatar') || el.parentElement;
      var initials = holder && holder.querySelector('.initials');
      if(initials) initials.style.display = 'none';
    });
    document.querySelectorAll('[data-img-bg="'+key+'"]').forEach(function(el){
      if(el.getAttribute('data-img-overlay') === 'hero'){
        el.style.background = "linear-gradient(180deg,rgba(14,42,71,.4),rgba(10,24,38,.85)),url('"+url+"') center/cover";
      } else {
        el.style.backgroundImage = "url('"+url+"')";
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
      }
    });
  }

  function loadAll(){
    sb.from('pz_content').select('key,value_id,value_en').then(function(res){
      if(res.error){ console.warn('pz_content load error', res.error); return; }
      (res.data || []).forEach(function(row){ applyRow(row.key, row.value_id, row.value_en); });
    });
    sb.from('pz_images').select('key,url').then(function(res){
      if(res.error){ console.warn('pz_images load error', res.error); return; }
      (res.data || []).forEach(function(row){ applyImage(row.key, row.url); });
    });
  }

  function start(){
    loadAll();
    sb.channel('pz_content_public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pz_content' }, function(payload){
        var row = payload.new || payload.old;
        if(row && row.key) applyRow(row.key, payload.new ? payload.new.value_id : null, payload.new ? payload.new.value_en : null);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pz_images' }, function(payload){
        var row = payload.new || payload.old;
        if(row && row.key && payload.new) applyImage(row.key, payload.new.url);
      })
      .subscribe();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
