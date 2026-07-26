(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var native = CSS.supports('(animation-timeline: scroll()) and (animation-range: 0% 100%)');

  /* 낱장을 관절 5개로 슬라이스 — 곡면 넘김의 뼈대 (네이티브/폴백 공용) */
  if (!reduce) document.querySelectorAll('.leaf').forEach(function(leaf){
    var bend = leaf.querySelector('.bend');
    var F = bend.querySelector('.face.front');
    var B = bend.querySelector('.face.back');
    if (!F || !B) return;
    var N = 5, parent = bend;
    for (var i = 0; i < N; i++){
      var s = document.createElement('div');
      s.className = 'slat';
      var sf = document.createElement('div'); sf.className = 'sface sf-f';
      var fc = document.createElement('div'); fc.className = 'scontent';
      fc.style.left = (-i * 100) + '%';
      fc.innerHTML = F.innerHTML;
      sf.appendChild(fc); s.appendChild(sf);
      var sb = document.createElement('div'); sb.className = 'sface sf-b';
      var bc = document.createElement('div'); bc.className = 'scontent';
      bc.style.left = (-(N - 1 - i) * 100) + '%';
      bc.innerHTML = B.innerHTML;
      sb.appendChild(bc); s.appendChild(sb);
      parent.appendChild(s);
      parent = s;
    }
    leaf.classList.add('sliced');
  });

  if (reduce || native) return;

  /* Firefox 등 미지원: 스크롤 리스너로 동일 효과 */
  var itls = Array.prototype.map.call(document.querySelectorAll('.interlude'), function(sec){
    return {
      track: sec.querySelector('.itl-track'),
      words: sec.querySelectorAll('.itl-text .w'),
      rule: sec.querySelector('.itl-rule')
    };
  });
  var brs = document.querySelectorAll('.breather');
  var track = document.querySelector('.book-track');
  var leaves = [
    {el: document.querySelector('.leaf-1'), a:.06, b:.27, zi:9, zo:1},
    {el: document.querySelector('.leaf-2'), a:.28, b:.49, zi:8, zo:2},
    {el: document.querySelector('.leaf-3'), a:.50, b:.71, zi:7, zo:3},
    {el: document.querySelector('.leaf-4'), a:.72, b:.93, zi:6, zo:4}
  ];
  var ticking = false;
  function draw(){
    ticking = false;
    var r = track.getBoundingClientRect();
    var total = r.height - innerHeight;
    var p = Math.min(1, Math.max(0, -r.top / Math.max(1,total)));
    leaves.forEach(function(L){
      var t = Math.min(1, Math.max(0, (p - L.a) / (L.b - L.a)));
      var rest = (1-t) * (L.zi - 5) * .5 - t * (L.zo * .5);
      var lift = Math.sin(t * Math.PI) * 22 + rest;
      L.el.style.transform = 'rotateY(' + (-180*t) + 'deg) translateZ(' + lift + 'px)';
      var th = 6.5 * Math.sin(2 * Math.PI * t) + 2 * Math.sin(4 * Math.PI * t);
      L.el.querySelectorAll('.slat').forEach(function(sl){
        sl.style.transform = 'rotateY(' + th + 'deg)';
      });
      var sheen = L.el.querySelector('.sheen');
      if (sheen) sheen.style.opacity = String(1 - Math.abs(t-.45)*2.2 > 0 ? 1 - Math.abs(t-.45)*2.2 : 0);
    });
    itls.forEach(function(I){
      if (!I.track) return;
      var ir = I.track.getBoundingClientRect();
      var itotal = Math.max(1, ir.height - innerHeight);
      var ip = Math.min(1, Math.max(0, -ir.top / itotal));
      var n = I.words.length, seg = .74 / Math.max(1, n);
      for (var i = 0; i < n; i++){
        var wt = Math.min(1, Math.max(0, (ip - (.1 + i * seg)) / (seg * 1.15)));
        I.words[i].style.opacity = String(.1 + .9 * wt);
      }
      if (I.rule) I.rule.style.transform = 'scaleY(' + Math.min(1, Math.max(0, ip / .8)) + ')';
    });
    brs.forEach(function(B){
      var br = B.getBoundingClientRect();
      var bp = Math.min(1, Math.max(0, (innerHeight - br.top) / (innerHeight + br.height)));
      var line = B.querySelector('.br-line');
      if (line) line.style.transform = 'scaleY(' + Math.min(1, Math.max(0, (bp - .25) / .5)) + ')';
    });
  }
  addEventListener('scroll', function(){ if(!ticking){ticking=true; requestAnimationFrame(draw);} }, {passive:true});
  addEventListener('resize', draw);
  draw();
})();
