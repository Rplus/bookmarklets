javascript: (function() {
  var s = document.createElement('script');
  s.setAttribute('src', 'https://cdn.jsdelivr.net/npm/lil-gui@0.17');
  document.body.appendChild(s);
  s.onload = () => {
    var GUI = lil.GUI;
    var itemname = location.href.match(/items\/([^/]+)/);
    var data = {
      '%': 100,
      'assess': () => {
        window.open(`https://orna.guide/search?searchstr=${itemname?.[1].replace(/\W/g, ' ')}`);
      },
    };
    let div = document.createElement('div');
    document.querySelector('.codex-stats').after(div);
    div.style = `display:flex;justify-content:center;`;
    var gui = new GUI({
      autoPlace: false,
      container: div,
    });
    let stats = document.querySelectorAll('.codex-stat');
    stats.forEach(stat => {
      let info = stat.textContent.trim().match(/(\D+)(\d+)/);
      let p = info?.[1];
      let v = info?.[2];
      if (p) {
        data[p] = +v;
        gui.add(data, p, ~~(v * 0.7), v * 2, 1).onChange(_v => {
          quality.setValue(~~(100 * _v / +v))
        });
      }
    });
    let quality = gui.add(data, '%', 70, 200);
    gui.add(data, 'assess').name('GO TO ASSESS');
  };
})();
