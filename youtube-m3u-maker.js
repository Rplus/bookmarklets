javascript:(() => {
  var m3u = {};
  m3u.timeUnit = [1, 60, 60 * 60]; /* s, m, h */
  m3u.header = '#EXTM3U\n# Playlist created by SMPlayer 16.1.0\n\n';
  m3u.list = [].map.call(document.querySelectorAll('.pl-video.yt-uix-tile:not([data-title="[已刪除的影片]"]):not([data-title="[私人影片]"])'), (item) => {
    let a = item.querySelector('.pl-video-title-link');
    let time = item.querySelector('.pl-video-time').textContent.trim();
    let allTime = time.split(':').reverse().map((num, idx) => num * m3u.timeUnit[idx]).reduce((prev, cur) => prev + cur);
    return `#EXTINF:${allTime},${a.textContent.trim()}\n${a.href}`;
  }).join('\n\n');

  /* create a link with download url */
  var a = document.createElement('a');
  a.style.display = "none";
  var aFileParts = [m3u.header + m3u.list];
  var oMyBlob = new Blob(aFileParts, {type: 'text/plain'});
  var url = window.URL.createObjectURL(oMyBlob);
  a.href = url;
  a.download = `${document.title}.m3u`;

  /* append in DOM & trigger click */
  document.body.appendChild(a);
  a.click();

  /* disable URL & remove hidden link */
  window.URL.revokeObjectURL(url);
  a.remove();
})();
