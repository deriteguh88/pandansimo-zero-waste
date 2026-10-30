// shell.js — header (utility bar + masthead + nav dropdown) dan footer
// dipakai bersama oleh semua halaman. Satu file ini yang diubah kalau
// menu perlu ditambah/diubah, tidak perlu edit satu-satu di tiap halaman.

(function(){

  var MENU = [
    { id:"Beranda", en:"Home", href:"index.html" },
    { id:"Zero Waste", en:"Zero Waste", href:"zero-waste.html" },
    { id:"Pandansimo", en:"Pandansimo", href:"pandansimo.html" },
    { id:"Artikel", en:"Articles", href:"artikel.html" },
    { id:"Tentang Kami", en:"About Us", href:"tentang-kami.html" },
    { id:"Kontak", en:"Contact", href:"kontak.html" },
  ];

  function leafIcon(){
    return '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 14c0-5.5 4.5-10 10-10 1 0 1.5.5 1.5 1.5C15.5 10.5 11 15 5.5 15 4.5 15 4 14.5 4 14z"/><path d="M4.5 19.5 14 10"/></svg>';
  }

  // Ikon kecil di sebelah tiap nama menu utama. Mau ganti bentuknya?
  // tinggal ganti isi path SVG-nya di sini (key = nama menu di MENU di atas).
  var NAV_ICONS = {
    "Beranda": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>',
    "Zero Waste": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 13c0-5 4-9 9-9 1 0 1.3.4 1.3 1.3C14.3 9.6 10 13 5.3 13 4.4 13 4 12.6 4 13z"/><path d="M4.5 19 14 9"/></svg>',
    "Pandansimo": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v9"/><path d="M12 12 6 8"/><path d="M12 12l6 2"/><path d="M12 12 8 18"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><path d="M12 21v-2"/></svg>',
    "Artikel": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="3.5" width="16" height="17" rx="1.5"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>',
    "Tentang Kami": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="8" r="2.6"/><path d="M15.5 14.3c2.6.4 4.5 2.7 4.5 5.7"/></svg>',
    "Kontak": '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
  };

  function buildHeader(){
    var cur = (document.body.getAttribute('data-page') || '').trim();

    var utility =
      '<div class="utilitybar"><div class="wrap" style="justify-content:flex-end;">' +
        '<div class="langtoggle" id="langToggle">' +
          '<button type="button" data-lang="id">ID</button>' +
          '<button type="button" data-lang="en">EN</button>' +
        '</div>' +
      '</div></div>';

    var masthead =
      '<div class="masthead"><div class="wrap">' +
        '<a href="index.html" class="brand">' +
          '<span class="mark">' + leafIcon() + '</span>' +
          '<span class="names">' +
            '<span class="t1" lang="id">Zero Waste &amp; Pandansimo</span>' +
            '<span class="t1" lang="en" hidden>Zero Waste &amp; Pandansimo</span><br>' +
            '<span class="t2" lang="id">Menuju Pesisir Minim Sampah &amp; Mandiri Energi</span>' +
            '<span class="t2" lang="en" hidden>Toward a Zero-Waste, Energy-Independent Coast</span>' +
          '</span>' +
        '</a>' +
        '<a href="kontak.html" class="btn primary">' +
          '<span lang="id">Hubungi Kami</span><span lang="en" hidden>Contact Us</span>' +
        '</a>' +
      '</div></div>';

    var navItems = MENU.map(function(item){
      var isActive = item.href === cur || (item.children && item.children.some(function(c){return c.href===cur;}));
      var hasKids = !!item.children;
      var icon = NAV_ICONS[item.id] ? '<span class="navicon">'+NAV_ICONS[item.id]+'</span>' : '';
      var head = hasKids
        ? '<button type="button">' + icon +
            '<span lang="id">'+item.id+'</span><span lang="en" hidden>'+item.en+'</span>' +
            '<span class="caret"></span></button>'
        : '<a href="'+item.href+'">' + icon +
            '<span lang="id">'+item.id+'</span><span lang="en" hidden>'+item.en+'</span></a>';
      var kids = hasKids
        ? '<div class="dropdown">' + item.children.map(function(c){
            return '<a href="'+c.href+'">' +
              '<span lang="id">'+c.id+'</span><span lang="en" hidden>'+c.en+'</span></a>';
          }).join('') + '</div>'
        : '';
      return '<div class="navitem'+(isActive?' current':'')+'" data-menu="'+item.id+'">' + head + kids + '</div>';
    }).join('');

    var nav =
      '<nav class="mainnav" id="mainNav"><div class="wrap">' + navItems + '</div></nav>';

    var mobileToggle =
      '<button class="navtoggle" id="navToggle" aria-label="Menu">' +
      '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg></button>';

    return utility + masthead.replace('</div></div>', mobileToggle + '</div></div>') + nav;
  }

  function buildFooter(){
    return '' +
    '<footer class="site"><div class="wrap">' +
      '<div class="grid cols-4">' +
        '<div class="fcol">' +
          '<h4 lang="id">Tentang</h4><h4 lang="en" hidden>About</h4>' +
          '<ul>' +
            '<li><a href="pandansimo-profil.html" lang="id">Profil Pandansimo</a><a href="pandansimo-profil.html" lang="en" hidden>Pandansimo Profile</a></li>' +
            '<li><a href="tentang-kami.html" lang="id">Tentang Kami</a><a href="tentang-kami.html" lang="en" hidden>About Us</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="fcol">' +
          '<h4 lang="id">Zero Waste</h4><h4 lang="en" hidden>Zero Waste</h4>' +
          '<ul>' +
            '<li><a href="zw-hierarki.html" lang="id">Hierarki Zero Waste</a><a href="zw-hierarki.html" lang="en" hidden>Zero Waste Hierarchy</a></li>' +
            '<li><a href="zw-gerakan-indonesia.html" lang="id">Gerakan di Indonesia</a><a href="zw-gerakan-indonesia.html" lang="en" hidden>Movement in Indonesia</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="fcol">' +
          '<h4 lang="id">Pandansimo</h4><h4 lang="en" hidden>Pandansimo</h4>' +
          '<ul>' +
            '<li><a href="pandansimo-implementasi.html" lang="id">Implementasi &amp; Teknologi</a><a href="pandansimo-implementasi.html" lang="en" hidden>Implementation &amp; Technology</a></li>' +
            '<li><a href="pandansimo-solusi.html" lang="id">Tantangan &amp; Solusi</a><a href="pandansimo-solusi.html" lang="en" hidden>Challenges &amp; Solutions</a></li>' +
          '</ul>' +
        '</div>' +
        '<div class="fcol">' +
          '<h4 lang="id">Lainnya</h4><h4 lang="en" hidden>More</h4>' +
          '<ul>' +
            '<li><a href="artikel.html" lang="id">Artikel</a><a href="artikel.html" lang="en" hidden>Articles</a></li>' +
            '<li><a href="kontak.html" lang="id">Kontak</a><a href="kontak.html" lang="en" hidden>Contact</a></li>' +
            '<li><a href="admin.html" lang="id">Admin</a><a href="admin.html" lang="en" hidden>Admin</a></li>' +
          '</ul>' +
        '</div>' +
      '</div>' +
      '<div class="bottom">' +
        '<span lang="id">© 2026 Proyek Tugas Mata Kuliah Zero Waste dan Pantai Pandansimo — Teknik Mesin, Elektro &amp; Industri.</span>' +
        '<span lang="en" hidden>© 2026 Zero Waste and Pandansimo Beach Coursework Project — Mechanical, Electrical &amp; Industrial Engineering.</span>' +
      '</div>' +
    '</div></footer>';
  }

  function applyLang(lang){
    document.documentElement.setAttribute('data-lang', lang);
    // Setiap elemen [lang="id"]/[lang="en"] punya atribut HTML "hidden" bawaan;
    // itu harus dilepas/dipasang langsung di sini, CSS saja tidak cukup
    // untuk mengalahkan atribut "hidden" bawaan tadi.
    // Dicari dari document.body, BUKAN document (dokumen), supaya elemen
    // <html lang="id"> itu sendiri tidak ikut ter-"hidden" (yang membuat
    // seluruh halaman jadi putih kosong).
    document.body.querySelectorAll('[lang="id"]').forEach(function(el){ el.hidden = (lang !== 'id'); });
    document.body.querySelectorAll('[lang="en"]').forEach(function(el){ el.hidden = (lang !== 'en'); });
    document.querySelectorAll('.langtoggle button').forEach(function(b){
      b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });
    try{ localStorage.setItem('zw_lang', lang); }catch(e){}
  }

  function initLang(){
    var saved = 'id';
    try{ saved = localStorage.getItem('zw_lang') || 'id'; }catch(e){}
    applyLang(saved);
    document.addEventListener('click', function(e){
      var btn = e.target.closest('.langtoggle button');
      if(btn) applyLang(btn.getAttribute('data-lang'));
    });
  }

  function initNav(){
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');
    if(toggle && nav){
      toggle.addEventListener('click', function(){ nav.classList.toggle('open'); });
    }
    document.addEventListener('click', function(e){
      var item = e.target.closest('.navitem');
      var btn = e.target.closest('.navitem > button');
      document.querySelectorAll('.navitem.open').forEach(function(n){
        if(n !== item) n.classList.remove('open');
      });
      if(btn){ item.classList.toggle('open'); }
      else if(!item){
        document.querySelectorAll('.navitem.open').forEach(function(n){ n.classList.remove('open'); });
      }
    });
  }

  function mount(){
    var h = document.getElementById('site-header');
    var f = document.getElementById('site-footer');
    if(h) h.innerHTML = buildHeader();
    if(f) f.innerHTML = buildFooter();
    initLang();
    initNav();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
