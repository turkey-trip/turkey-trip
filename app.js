/* 行程页：渲染 / 编辑 / 本地保存 / 链接分享 */
(function () {
  'use strict';

  var LS_KEY = 'turkey-trip-v2';
  var state = {
    data: null,
    selected: 'overview',
    editing: false,
    choice: {},
    fromShare: false
  };

  var HOTELS = [
    [41.009253, 28.949279, 'Hampton by Hilton Istanbul Old City, Sorguccu Str No 1, Istanbul'],
    [36.54933, 29.115, 'The Tulip Houses, 152 Sk No 4, Oludeniz, Fethiye'],
    [36.88439, 30.7066, 'Atelya Art Hotel, Barbaros Civelek Sokak No 21, Antalya'],
    [38.64143, 34.828757, "Noah's Ark Cave Hotel, Isali Cd No 16, Goreme"],
    [38.644315, 34.830193, 'Olivia Cave Hotel, Saglik Sokak No 6/A, Goreme'],
    [41.192627, 28.732381, 'GNC Airport Hotel, Mustafa Kemal Pasa Fatih Cd No 171, Arnavutkoy']
  ];

  /* ---------------- 工具 ---------------- */
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function pad(n) { return String(n).padStart(2, '0'); }
  function clk(n) { n = (n + 1440) % 1440; return pad(Math.floor(n / 60)) + ':' + pad(n % 60); }
  function toMin(s) { if (!s || s === '—') return null; var a = String(s).split(':'); if (a.length < 2) return null; var h = +a[0], m = +a[1]; if (isNaN(h) || isNaN(m)) return null; return h * 60 + m; }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  /* ---------------- 压缩 / 解压（用于分享链接） ---------------- */
  function b64enc(str) {
    var bytes = new TextEncoder().encode(str), bin = '';
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function b64dec(b64) {
    var s = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (s.length % 4) s += '=';
    var bin = atob(s), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }
  function encodeDoc(doc) {
    var json = JSON.stringify(doc);
    if (window.LZString) return 'z' + LZString.compressToEncodedURIComponent(json);
    return 'b' + b64enc(json);
  }
  function decodeDoc(code) {
    if (code.charAt(0) === 'z') {
      if (!window.LZString) return null;
      return LZString.decompressFromEncodedURIComponent(code.slice(1));
    }
    if (code.charAt(0) === 'b') return b64dec(code.slice(1));
    return null;
  }

  /* ---------------- 存取 ---------------- */
  function loadDoc() {
    var hash = location.hash || '';
    if (hash.indexOf('#d=') === 0) {
      try {
        var raw = decodeDoc(hash.slice(3));
        var obj = raw && JSON.parse(raw);
        if (obj && obj.days && obj.days.length) { state.fromShare = true; return obj; }
      } catch (e) { console.warn('分享数据解析失败', e); }
    }
    try {
      var s = localStorage.getItem(LS_KEY);
      if (s) { var o = JSON.parse(s); if (o && o.days && o.days.length) return o; }
    } catch (e) { }
    return clone(window.SEED);
  }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state.data)); } catch (e) { }
    setSync('已存本机');
  }
  function setSync(text, kind) {
    var b = $('#syncText');
    if (!b) return;
    b.textContent = text;
    var dot = $('#syncDot');
    if (dot) dot.className = 'sync-dot' + (kind === 'off' ? ' off' : kind === 'busy' ? ' busy' : '');
  }

  /* ---------------- 计算 ---------------- */
  function currentDay() {
    for (var i = 0; i < state.data.days.length; i++) if (state.data.days[i].id === state.selected) return state.data.days[i];
    return null;
  }
  function currentOption() {
    var d = currentDay();
    if (!d) return '主方案';
    if (!state.choice[d.id] || !d.opts[state.choice[d.id]]) state.choice[d.id] = Object.keys(d.opts)[0];
    return state.choice[d.id];
  }
  function currentItems() {
    var d = currentDay();
    if (!d) return [];
    return d.opts[currentOption()] || [];
  }
  function calc(items, day) {
    var cursor = day.start || 480;
    return items.map(function (x) {
      var fixedStart = x.fixed ? toMin(x.time) : null;
      var s = fixedStart != null ? fixedStart : cursor;
      var e = s + (+x.dur || 0);
      cursor = (fixedStart != null ? Math.max(cursor, e) : e) + (+x.travel || 0);
      return Object.assign({}, x, { begin: clk(s), end: clk(e) });
    });
  }
  var CUR = {
    EUR: { sym: '€', name: '欧元' },
    TRY: { sym: '₺', name: '里拉' },
    CNY: { sym: '¥', name: '人民币' },
    USD: { sym: '$', name: '美元' }
  };
  var CUR_KEYS = ['EUR', 'TRY', 'CNY', 'USD'];

  function rateMap() {
    var r = state.data.meta.rates || {};
    return { EUR: 1, TRY: r.try || 56, CNY: r.cny || 7.7, USD: r.usd || 1.08 };
  }
  function convert(v, from, to) {
    var m = rateMap();
    if (!m[from] || !m[to]) return null;
    return v / m[from] * m[to];
  }
  function curSym(c) { return (CUR[c] || CUR.EUR).sym; }
  function curOptions(allowNone) {
    var arr = CUR_KEYS.map(function (k) { return { value: k, text: CUR[k].sym + ' ' + CUR[k].name }; });
    if (allowNone) arr.unshift({ value: '', text: '不换算' });
    return arr;
  }
  function baseCur() { return state.data.meta.baseCurrency || 'EUR'; }
  function targets() { return state.data.meta.targets || ['TRY', 'CNY']; }
  function fmtRate(n) {
    if (n == null) return '-';
    if (n >= 100) return String(Math.round(n));
    if (n >= 10) return n.toFixed(1);
    return n.toFixed(2);
  }
  function price(v, cur) {
    if (v == null || v === '') return '';
    var n = +v;
    if (n === 0) return '免费';
    cur = cur || baseCur();
    var parts = [curSym(cur) + n];
    targets().forEach(function (c) {
      if (!c || c === cur) return;
      var x = convert(n, cur, c);
      if (x != null) parts.push(curSym(c) + fmtRate(x));
    });
    return parts.join(' / ');
  }
  function typeName(t) { return ({ spot: '景点', food: '餐饮', hotel: '住宿', transport: '交通' })[t] || '景点'; }

  /* ---------------- 地图 ---------------- */
  var map, layerGroup;
  var TILES = [
    { url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', opt: { maxZoom: 18, attribution: '© Esri · © OpenStreetMap' } },
    { url: 'https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', opt: { maxZoom: 18, subdomains: '1234', attribution: '© 高德地图' } },
    { url: 'https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', opt: { maxZoom: 18, attribution: '© OpenStreetMap contributors' } }
  ];
  function initMap() {
    var box = $('#map');
    if (!window.L || !box) {
      if (box) box.innerHTML = '<div class="map-fallback">地图资源未加载，行程与导航链接不受影响</div>';
      return;
    }
    map = L.map('map', { scrollWheelZoom: false }).setView([39.2, 32.5], 6);
    layerGroup = L.layerGroup().addTo(map);
    useTile(0, 0);
  }
  function useTile(idx, errors) {
    if (!map) return;
    var src = TILES[idx];
    if (!src) return;
    var layer = L.tileLayer(src.url, Object.assign({ maxZoom: 18 }, src.opt));
    layer.on('tileerror', function () {
      errors++;
      if (errors > 6) {
        map.removeLayer(layer);
        useTile(idx + 1, 0);
      }
    });
    layer.addTo(map);
  }
  function renderMap(items) {
    if (!map || !layerGroup) return;
    layerGroup.clearLayers();
    var pts = [];
    items.forEach(function (x, i) {
      if (!x.lat || !x.lng) return;
      var mk = L.marker([+x.lat, +x.lng]).addTo(layerGroup);
      mk.bindPopup('<b>' + (i + 1) + '. ' + escapeHtml(x.name) + '</b><br>' + (x.begin || '') + '<br>' + escapeHtml(x.desc || ''));
      pts.push([+x.lat, +x.lng]);
    });
    if (pts.length > 1) L.polyline(pts, { color: '#a855f7', weight: 4, opacity: .5, dashArray: '7 8' }).addTo(layerGroup);
    if (pts.length) map.fitBounds(pts, { padding: [25, 25], maxZoom: 13 });
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  /* ---------------- 渲染 ---------------- */
  function renderStats() {
    var m = state.data.meta;
    $('#statPeople').textContent = String(m.people || 4);
    var b = baseCur();
    var parts = [];
    targets().forEach(function (c) {
      if (!c || c === b) return;
      parts.push(curSym(c) + fmtRate(convert(1, b, c)));
    });
    $('#statRates').textContent = curSym(b) + '1 ≈ ' + (parts.length ? parts.join(' / ') : '同本币');
    $('#heroTitle').textContent = m.title || '';
    $('#heroSub').textContent = m.subtitle || '';
  }

  function renderTabs() {
    var box = $('#tabs');
    box.innerHTML = '';
    var b0 = el('button', state.selected === 'overview' ? 'active' : '', '总览');
    b0.dataset.act = 'go';
    b0.dataset.id = 'overview';
    box.appendChild(b0);
    state.data.days.forEach(function (d) {
      var b = el('button', state.selected === d.id ? 'active' : '', d.tab || '');
      b.dataset.act = 'go';
      b.dataset.id = d.id;
      box.appendChild(b);
    });
    if (state.editing) {
      var add = el('button', '', '＋加一天');
      add.dataset.act = 'addDay';
      box.appendChild(add);
    }
  }

  function renderOverview() {
    var c = $('#content');
    c.innerHTML = '';
    var p = el('section', 'panel');
    p.appendChild(el('h3', '', '每日路线'));
    state.data.days.forEach(function (d) {
      var row = el('div', 'overview-item');
      row.dataset.act = 'go';
      row.dataset.id = d.id;
      row.appendChild(el('h3', '', (d.tab || '') + ' · ' + (d.title || '')));
      row.appendChild(el('p', '', d.route || ''));
      p.appendChild(row);
    });
    c.appendChild(p);

    if (state.editing) {
      var tip = el('section', 'panel');
      var img = el('p', 'route', '编辑模式：可直接改标题、日期、路线和备注；点每天的“编辑”按钮增删节点；“＋加一天”新增行程日；改完点“生成分享链接”发给同伴。');
      tip.appendChild(img);
      c.appendChild(tip);
    }

    var all = [];
    state.data.days.forEach(function (d) {
      var items = d.opts[state.choice[d.id]] || d.opts[Object.keys(d.opts)[0]] || [];
      items.forEach(function (x) {
        if (x.lat && x.lng) all.push(x);
      });
    });
    renderMap(all);
  }

  function renderDay() {
    var d = currentDay();
    var c = $('#content');
    if (!d) { renderOverview(); return; }
    var items = calc(currentItems(), d);
    c.innerHTML = '';

    var head = el('section', 'panel');
    var headRow = el('div', 'day-head');
    var h2 = el('h2', 'editable', d.date || '');
    h2.dataset.edit = 'day.date';
    headRow.appendChild(h2);

    var btns = el('div', 'node-actions');
    if (state.editing) {
      var delDay = el('button', 'btn red', '删除当天');
      delDay.dataset.act = 'delDay';
      btns.appendChild(delDay);
    }
    var toggle = el('button', 'btn gray edit-toggle', state.editing ? '完成编辑' : '编辑');
    toggle.dataset.act = 'toggleEdit';
    btns.appendChild(toggle);
    headRow.appendChild(btns);
    head.appendChild(headRow);

    var route = el('p', 'route editable', d.route || '');
    route.dataset.edit = 'day.route';
    head.appendChild(route);

    if (state.editing) {
      var titleWrap = el('div', 'hint');
      titleWrap.appendChild(el('span', '', '主题 '));
      var title = el('span', 'editable', d.title || '');
      title.dataset.edit = 'day.title';
      titleWrap.appendChild(title);
      head.appendChild(titleWrap);

      var tabWrap = el('div', 'hint');
      tabWrap.appendChild(el('span', '', '顶部标签 '));
      var tab = el('span', 'editable', d.tab || '');
      tab.dataset.edit = 'day.tab';
      tabWrap.appendChild(tab);
      head.appendChild(tabWrap);
    }

    var names = Object.keys(d.opts);
    if (names.length > 1) {
      var opts = el('div', 'options');
      names.forEach(function (k) {
        var b = el('button', currentOption() === k ? 'active' : '', k);
        b.dataset.act = 'pick';
        b.dataset.k = k;
        opts.appendChild(b);
      });
      head.appendChild(opts);
    }
    if (state.editing) {
      var optOps = el('div', 'options');
      var addOpt = el('button', '', '＋新方案');
      addOpt.dataset.act = 'addOption';
      optOps.appendChild(addOpt);
      if (names.length > 1) {
        var rmOpt = el('button', '', '删除此方案');
        rmOpt.dataset.act = 'delOption';
        optOps.appendChild(rmOpt);
      }
      head.appendChild(optOps);
    }
    c.appendChild(head);

    var note = el('div', 'notice editable', d.note || '');
    note.dataset.edit = 'day.note';
    if (!state.editing && !d.note) note.style.display = 'none';
    c.appendChild(note);

    var tl = el('section', 'panel timeline');
    if (!items.length) {
      tl.appendChild(el('div', 'empty', '今天暂无行程'));
    } else {
      items.forEach(function (x, i) { tl.appendChild(itemCard(x, i)); });
    }
    if (state.editing) {
      var addRow = el('div', 'add-row');
      var addNode = el('button', 'btn blue', '＋ 添加节点');
      addNode.dataset.act = 'addNode';
      addRow.appendChild(addNode);
      tl.appendChild(addRow);
    }
    c.appendChild(tl);

    renderMap(items);
    bindDrag();
    applyEditable();
  }

  function itemCard(x, i) {
    var card = el('div', 'item ' + (x.type || 'spot'));
    card.dataset.i = i;
    card.dataset.drag = state.editing && !x.fixed ? '1' : '0';
    card.appendChild(el('span', 'dot'));

    var time = el('div', 'time', x.begin + '—' + x.end + ' · 约' + (x.dur || 0) + '分钟');
    if (x.travel) time.textContent += ' · 后续交通约' + x.travel + '分钟';
    card.appendChild(time);

    var h3 = el('h3', '', x.name || '');
    if (x.fixed) {
      var lock = el('span', 'locked', ' 🔒固定');
      h3.appendChild(lock);
    }
    card.appendChild(h3);

    if (x.desc) card.appendChild(el('p', '', x.desc));

    var chips = el('div', 'chips');
    if (x.cost != null && x.cost !== '') {
      var unitTxt = String(x.unit || '').replace(/[€₺¥$]/g, '').trim();
      var ch = el('span', 'chip price', price(x.cost, x.currency) + (unitTxt ? ' · ' + unitTxt : ''));
      chips.appendChild(ch);
    }
    chips.appendChild(el('span', 'chip', typeName(x.type)));
    card.appendChild(chips);

    var urls = navUrls(x);
    var bar = el('div', 'buttons');
    var g = el('a', 'btn blue', 'Google导航'); g.href = urls.google; g.target = '_blank'; g.rel = 'noopener';
    var a = el('a', 'btn green', '高德导航'); a.href = urls.amap; a.target = '_blank'; a.rel = 'noopener';
    bar.appendChild(g); bar.appendChild(a);

    if (state.editing) {
      var ed = el('button', 'btn gray', '编辑'); ed.dataset.act = 'editNode'; ed.dataset.i = i;
      bar.appendChild(ed);
      if (!x.fixed) {
        var up = el('button', 'btn gray', '↑'); up.dataset.act = 'moveUp'; up.dataset.i = i;
        var dn = el('button', 'btn gray', '↓'); dn.dataset.act = 'moveDown'; dn.dataset.i = i;
        var rm = el('button', 'btn red', '删除'); rm.dataset.act = 'delNode'; rm.dataset.i = i;
        bar.appendChild(up); bar.appendChild(dn); bar.appendChild(rm);
      }
    }
    card.appendChild(bar);
    return card;
  }

  function navUrls(x) {
    var q = x.lat + ',' + x.lng;
    var addr = '';
    if (x.type === 'hotel' || /酒店|hotel/i.test(x.name || '')) {
      for (var i = 0; i < HOTELS.length; i++) {
        if (Math.abs(HOTELS[i][0] - x.lat) < 0.0005 && Math.abs(HOTELS[i][1] - x.lng) < 0.0005) { addr = HOTELS[i][2]; break; }
      }
    }
    if (addr) q = addr;
    return {
      google: 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(q) + '&travelmode=driving&dir_action=navigate',
      amap: 'https://uri.amap.com/navigation?to=' + x.lng + ',' + x.lat + ',' + encodeURIComponent(x.name || '目的地') + '&mode=car&callnative=1&src=trip'
    };
  }

  function render() {
    renderStats();
    renderTabs();
    if (state.selected === 'overview') renderOverview(); else renderDay();
    applyEditable();
  }

  /* ---------------- 可编辑文本 ---------------- */
  function applyEditable() {
    document.querySelectorAll('[data-edit]').forEach(function (n) {
      var always = n.id === 'statPeople';
      if (state.editing || always) {
        if (!n.hasAttribute('contenteditable')) n.setAttribute('contenteditable', 'true');
      } else if (n.hasAttribute('contenteditable')) {
        n.removeAttribute('contenteditable');
      }
    });
  }

  function commitEdit(node) {
    var key = node.dataset.edit;
    if (!key) return;
    var val = (node.textContent || '').replace(/\u00a0/g, ' ').trim();
    var d = state.data;
    if (key === 'meta.title') { d.meta.title = val; $('#heroTitle').textContent = val; document.title = val; }
    else if (key === 'meta.subtitle') { d.meta.subtitle = val; $('#heroSub').textContent = val; }
    else if (key === 'meta.people') {
      var n = parseInt(val, 10);
      if (!n || n < 1) { node.textContent = String(d.meta.people || 4); return; }
      d.meta.people = n;
      node.textContent = String(n);
    }
    else if (key.indexOf('day.') === 0) {
      var day = currentDay();
      if (!day) return;
      var field = key.slice(4);
      if (day[field] === val) return;
      day[field] = val;
      if (field === 'tab') renderTabs();
    }
    save();
  }

  function toggleEdit() {
    state.editing = !state.editing;
    document.body.classList.toggle('editing', state.editing);
    document.querySelector('.hero').classList.toggle('editing', state.editing);
    var b = $('#btnEdit');
    b.textContent = state.editing ? '完成编辑' : '编辑内容';
    b.classList.toggle('on', state.editing);
    render();
    if (state.editing) toast('已进入编辑模式：点亮的地方都能改');
  }

  /* ---------------- 弹窗表单 ---------------- */
  var sheetCtx = null;

  function openSheet(title, fields, actions) {
    $('#sheetTitle').textContent = title;
    var body = $('#sheetBody');
    body.innerHTML = '';
    fields.forEach(function (f) {
      if (f.type === 'group') {
        var g = el('div', 'field-2');
        f.fields.forEach(function (sub) { g.appendChild(fieldNode(sub)); });
        body.appendChild(g);
        return;
      }
      body.appendChild(fieldNode(f));
    });
    var acts = $('#sheetActions');
    acts.innerHTML = '';
    actions.forEach(function (a) {
      var b = el(a.kind === 'primary' ? 'button' : (a.kind === 'danger' ? 'button' : 'button'), a.kind === 'primary' ? 'primary' : (a.kind === 'danger' ? 'danger' : 'ghost'), a.text);
      b.addEventListener('click', a.onClick);
      acts.appendChild(b);
    });
    $('#sheet').classList.add('show');
  }
  function closeSheet() { $('#sheet').classList.remove('show'); sheetCtx = null; }

  function fieldNode(f) {
    var wrap = el('div', 'field');
    var lb = el('label', '', f.label);
    lb.setAttribute('for', 'f_' + f.key);
    wrap.appendChild(lb);
    var input;
    if (f.type === 'select') {
      input = el('select');
      (f.options || []).forEach(function (o) {
        var op = el('option', '', o.text);
        op.value = o.value;
        input.appendChild(op);
      });
    } else if (f.type === 'textarea') {
      input = el('textarea');
    } else {
      input = el('input');
      input.type = f.type || 'text';
      if (f.step) input.step = f.step;
      if (f.min != null) input.min = f.min;
    }
    input.id = 'f_' + f.key;
    input.dataset.key = f.key;
    input.value = f.value == null ? '' : f.value;
    wrap.appendChild(input);
    return wrap;
  }

  function readSheet() {
    var out = {};
    document.querySelectorAll('#sheetBody [data-key]').forEach(function (n) {
      out[n.dataset.key] = n.value;
    });
    return out;
  }

  function editNode(idx) {
    var items = currentItems();
    var x = idx == null ? {} : items[idx];
    openSheet(idx == null ? '添加节点' : '编辑节点', [
      { key: 'name', label: '名称', value: x.name || '' },
      { type: 'group', fields: [
        { key: 'time', label: '开始时间（固定节点填）', type: 'time', value: x.time || '' },
        { key: 'dur', label: '时长（分钟）', type: 'number', value: x.dur == null ? 60 : x.dur, min: 0 }
      ] },
      { type: 'group', fields: [
        { key: 'travel', label: '到下一站交通（分钟）', type: 'number', value: x.travel == null ? 0 : x.travel, min: 0 },
        { key: 'type', label: '类型', type: 'select', value: x.type || 'spot', options: [
          { value: 'spot', text: '景点' }, { value: 'food', text: '餐饮' }, { value: 'hotel', text: '住宿' }, { value: 'transport', text: '交通' }
        ] }
      ] },
      { type: 'group', fields: [
        { key: 'cost', label: '费用（0 表示免费）', type: 'number', value: x.cost == null ? '' : x.cost, min: 0 },
        { key: 'currency', label: '币种', type: 'select', value: x.currency || baseCur(), options: curOptions() }
      ] },
      { key: 'unit', label: '费用单位（如：每人预算 / 全车预算）', value: String(x.unit || '').replace(/[€₺¥$]/g, '').trim() },
      { key: 'desc', label: '说明', type: 'textarea', value: x.desc || '' },
      { type: 'group', fields: [
        { key: 'lat', label: '纬度', type: 'number', step: '0.000001', value: x.lat == null ? '' : x.lat },
        { key: 'lng', label: '经度', type: 'number', step: '0.000001', value: x.lng == null ? '' : x.lng }
      ] }
    ], [
      { text: '取消', kind: 'ghost', onClick: closeSheet },
      {
        text: '保存', kind: 'primary', onClick: function () {
          var v = readSheet();
          if (!v.name.trim()) { toast('名称不能为空'); return; }
          var obj = {
            name: v.name.trim(),
            time: v.time || '',
            dur: +v.dur || 0,
            travel: +v.travel || 0,
            type: v.type || 'spot',
            lat: v.lat === '' ? '' : +v.lat,
            lng: v.lng === '' ? '' : +v.lng,
            cost: v.cost === '' ? null : +v.cost,
            currency: v.currency || 'EUR',
            unit: v.unit || '',
            desc: v.desc || '',
            fixed: x.fixed ? 1 : 0
          };
          if (!obj.lat || !obj.lng) { delete obj.lat; delete obj.lng; }
          var d = currentDay();
          var key = currentOption();
          if (idx == null) {
            d.opts[key].push(obj);
            d.opts[key] = d.opts[key].slice();
          } else {
            d.opts[key][idx] = obj;
          }
          save(); closeSheet(); render(); toast('已保存');
        }
      }
    ]);
  }

  function addDay() {
    openSheet('添加一天', [
      { type: 'group', fields: [
        { key: 'tab', label: '标签（如 10/4）', value: '' },
        { key: 'date', label: '日期标题', value: '' }
      ] },
      { key: 'title', label: '当天主题', value: '' },
      { key: 'route', label: '路线', value: '' },
      { key: 'note', label: '提醒', type: 'textarea', value: '' }
    ], [
      { text: '取消', kind: 'ghost', onClick: closeSheet },
      {
        text: '添加', kind: 'primary', onClick: function () {
          var v = readSheet();
          var d = {
            id: 'd' + Date.now(),
            tab: v.tab || '新的一天',
            date: v.date || v.tab || '新的一天',
            title: v.title || '',
            route: v.route || '',
            note: v.note || '',
            start: 480,
            opts: { '主方案': [] }
          };
          state.data.days.push(d);
          state.selected = d.id;
          save(); closeSheet(); render();
          toast('已添加，接着加节点吧');
        }
      }
    ]);
  }

  function openSettings() {
    var m = state.data.meta;
    var tg = targets();
    openSheet('页面设置', [
      { key: 'title', label: '大标题', value: m.title || '' },
      { key: 'subtitle', label: '副标题（日期与路线）', value: m.subtitle || '' },
      { key: 'people', label: '人数', type: 'number', value: m.people || 4, min: 1 },
      { key: 'baseCurrency', label: '本币（费用默认按它录入）', type: 'select', value: baseCur(), options: curOptions() },
      { type: 'group', fields: [
        { key: 't1', label: '换算成', type: 'select', value: tg[0] || '', options: curOptions(true) },
        { key: 't2', label: '换算成', type: 'select', value: tg[1] || '', options: curOptions(true) }
      ] },
      { key: 't3', label: '换算成（第三个，可留空）', type: 'select', value: tg[2] || '', options: curOptions(true) },
      { type: 'group', fields: [
        { key: 'rateTry', label: '汇率 €1 = ? ₺', type: 'number', step: '0.01', value: m.rates.try },
        { key: 'rateCny', label: '汇率 €1 = ? ¥', type: 'number', step: '0.01', value: m.rates.cny }
      ] },
      { key: 'rateUsd', label: '汇率 €1 = ? $', type: 'number', step: '0.01', value: m.rates.usd || 1.08 }
    ], [
      {
        text: '恢复默认', kind: 'danger', onClick: function () {
          if (!confirm('恢复成初始的土耳其行程？你改的内容会丢失。')) return;
          state.data = clone(window.SEED);
          state.choice = {};
          state.selected = 'overview';
          save(); closeSheet(); render();
          toast('已恢复默认');
        }
      },
      { text: '取消', kind: 'ghost', onClick: closeSheet },
      {
        text: '保存', kind: 'primary', onClick: function () {
          var v = readSheet();
          m.title = v.title.trim() || m.title;
          m.subtitle = v.subtitle;
          m.people = +v.people || 4;
          m.baseCurrency = v.baseCurrency || 'EUR';
          m.targets = [v.t1, v.t2, v.t3].filter(function (x) { return !!x; });
          m.rates = { try: +v.rateTry || 56, cny: +v.rateCny || 7.7, usd: +v.rateUsd || 1.08 };
          document.title = m.title;
          $('#heroTitle').textContent = m.title;
          $('#heroSub').textContent = m.subtitle;
          save(); closeSheet(); render();
          toast('已保存');
        }
      }
    ]);
  }

  /* ---------------- 分享 / 导入导出 ---------------- */
  function shareLink() {
    var code = encodeDoc(state.data);
    var url = location.origin + location.pathname + '#d=' + code;
    if (url.length > 12000) {
      toast('内容较长，链接可能被聊天软件截断，建议改用“导出安排”发文件');
    }
    return url;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); resolve(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function doShare() {
    var url = shareLink();
    copyText(url).then(function () {
      toast('链接已复制，发给同伴即可看到最新版');
    }).catch(function () {
      window.prompt('复制下面的链接发给同伴：', url);
    });
  }

  function doExport() {
    var blob = new Blob([JSON.stringify(state.data, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (state.data.meta.title || '行程') + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
    toast('已导出 JSON');
  }

  function doImport(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var obj = JSON.parse(r.result);
        if (!obj || !obj.days) throw new Error('格式不正确');
        state.data = obj;
        state.choice = {};
        state.selected = 'overview';
        save(); render(); toast('已导入');
      } catch (e) {
        toast('文件格式不正确');
      }
    };
    r.readAsText(file);
  }

  function refreshRates() {
    setSync('获取汇率…', 'busy');
    fetch('https://api.frankfurter.app/latest?from=EUR&to=TRY,CNY,USD')
      .then(function (r) { return r.json(); })
      .then(function (r) {
        if (!r || !r.rates) throw new Error('bad');
        state.data.meta.rates = { try: r.rates.TRY, cny: r.rates.CNY, usd: r.rates.USD || 1.08 };
        save(); render();
        toast('汇率已更新');
      })
      .catch(function () {
        setSync('已存本机');
        toast('汇率接口暂不可用，继续使用现有汇率');
      });
  }

  /* ---------------- 拖拽 ---------------- */
  function bindDrag() {
    document.querySelectorAll('[data-drag="1"]').forEach(function (n) {
      n.draggable = true;
      n.ondragstart = function (e) {
        e.dataTransfer.setData('text/plain', n.dataset.i);
        n.classList.add('dragging');
      };
      n.ondragend = function () { n.classList.remove('dragging'); };
      n.ondragover = function (e) { e.preventDefault(); };
      n.ondrop = function (e) {
        e.preventDefault();
        var from = +e.dataTransfer.getData('text/plain');
        var to = +n.dataset.i;
        swap(from, to);
      };
    });
  }
  function swap(a, b) {
    var arr = currentItems();
    if (isNaN(a) || isNaN(b) || a === b) return;
    if (arr[a] && arr[a].fixed) return;
    if (arr[b] && arr[b].fixed) return;
    var t = arr[a]; arr[a] = arr[b]; arr[b] = t;
    save(); render();
  }

  /* ---------------- 事件 ---------------- */
  function bindEvents() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-act]');
      if (!t) return;
      var act = t.dataset.act;
      var i = t.dataset.i != null ? +t.dataset.i : null;

      if (act === 'closeSheet') { closeSheet(); }
      else if (act === 'go') { state.selected = t.dataset.id; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else if (act === 'pick') { state.choice[state.selected] = t.dataset.k; render(); }
      else if (act === 'toggleEdit') { toggleEdit(); }
      else if (act === 'editNode') { editNode(i); }
      else if (act === 'addNode') { editNode(null); }
      else if (act === 'delNode') {
        var arr = currentItems();
        if (!arr[i] || arr[i].fixed) { toast('固定节点不能删除'); return; }
        if (!confirm('删除「' + arr[i].name + '」？')) return;
        arr.splice(i, 1);
        save(); render();
      }
      else if (act === 'moveUp') { swap(i, i - 1); }
      else if (act === 'moveDown') { swap(i, i + 1); }
      else if (act === 'addDay') { addDay(); }
      else if (act === 'delDay') {
        var d = currentDay();
        if (!confirm('删除「' + (d.date || '') + '」这一天？')) return;
        state.data.days = state.data.days.filter(function (x) { return x.id !== d.id; });
        state.selected = 'overview';
        save(); render();
      }
      else if (act === 'addOption') {
        var name = prompt('新方案名称，例如：雨天方案', '备选方案');
        if (!name) return;
        var day = currentDay();
        if (day.opts[name]) { toast('名称已存在'); return; }
        day.opts[name] = clone(day.opts[currentOption()] || []);
        state.choice[day.id] = name;
        save(); render();
      }
      else if (act === 'delOption') {
        var day2 = currentDay();
        var name2 = currentOption();
        if (Object.keys(day2.opts).length <= 1) { toast('至少保留一个方案'); return; }
        if (!confirm('删除方案「' + name2 + '」？')) return;
        delete day2.opts[name2];
        state.choice[day2.id] = Object.keys(day2.opts)[0];
        save(); render();
      }
    });

    document.addEventListener('focusout', function (e) {
      var n = e.target.closest && e.target.closest('[data-edit]');
      if (n) commitEdit(n);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeSheet(); return; }
      var n = e.target.closest && e.target.closest('[data-edit]');
      if (n && e.key === 'Enter') { e.preventDefault(); n.blur(); }
    });

    $('#btnEdit').addEventListener('click', toggleEdit);
    $('#btnShare').addEventListener('click', doShare);
    $('#btnExport').addEventListener('click', doExport);
    $('#btnImport').addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) doImport(e.target.files[0]);
      e.target.value = '';
    });
    $('#btnSettings').addEventListener('click', openSettings);
    $('#btnRate').addEventListener('click', refreshRates);
    $('#sheet').addEventListener('click', function (e) {
      if (e.target.id === 'sheet') closeSheet();
    });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    state.data = loadDoc();
    if (!state.data.meta) state.data.meta = clone(window.SEED.meta);
    if (!state.data.meta.rates) state.data.meta.rates = { try: 56, cny: 7.7, usd: 1.08 };
    if (!state.data.meta.rates.usd) state.data.meta.rates.usd = 1.08;
    if (!state.data.meta.baseCurrency) state.data.meta.baseCurrency = 'EUR';
    if (!state.data.meta.targets || !state.data.meta.targets.length) state.data.meta.targets = ['TRY', 'CNY'];

    // 老数据没有币种字段：补成欧元，避免切换本币后历史金额被误读
    var migrated = false;
    state.data.days.forEach(function (day) {
      Object.keys(day.opts).forEach(function (k) {
        day.opts[k].forEach(function (it) {
          if (!it.currency && it.cost != null && it.cost !== '') { it.currency = 'EUR'; migrated = true; }
        });
      });
    });
    if (migrated) { try { localStorage.setItem(LS_KEY, JSON.stringify(state.data)); } catch (e) { } }

    document.title = state.data.meta.title || '旅游攻略';
    $('#heroTitle').textContent = state.data.meta.title || '';
    $('#heroSub').textContent = state.data.meta.subtitle || '';

    initMap();
    bindEvents();

    var q = new URLSearchParams(location.search);
    var wantDay = q.get('day');
    if (wantDay) {
      for (var i = 0; i < state.data.days.length; i++) {
        var d = state.data.days[i];
        if (d.id === wantDay || d.tab === wantDay) { state.selected = d.id; break; }
      }
    }
    if (q.get('edit') === '1' && !state.editing) {
      state.editing = true;
      document.body.classList.add('editing');
      document.querySelector('.hero').classList.add('editing');
      $('#btnEdit').textContent = '完成编辑';
      $('#btnEdit').classList.add('on');
    }

    render();

    if (q.get('open') === 'settings') openSettings();
    else if (q.get('open') === 'node' && state.selected !== 'overview') editNode(0);

    if (state.fromShare) {
      setSync('来自分享链接');
      toast('这是分享来的最新版，你也能继续改');
    } else {
      setSync('已存本机');
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
