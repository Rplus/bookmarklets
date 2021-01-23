// ==UserScript==
// @name         巴哈姆特動畫瘋影片擷圖小工具
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  try to take over the world!
// @author       Rplus
// @match        https://ani.gamer.com.tw/animeVideo.php?sn=*
// @grant        none
// ==/UserScript==

(function() {
  let video = getVideo();
  let title = '';

  window.addEventListener('load', () => {
    video = getVideo();
    if (video) {
      init();
    } else {
      console.log('load video GG, wait 5s');
      delayInit();
    }
  });

  function delayInit() {
    setTimeout(() => {
      if (!window.videojs) {
        delayInit();
      } else {
        init();
      }
    }, 1000);
  }

  function init() {
    video = getVideo();
    title = document.querySelector('h1')?.textContent || document.title;

    console.log('load');
    if (!video) { return; }

    let sKeyTime = 0;

    {
      // inject screenshot button
      const bar = document.querySelector('.control-bar-rightbtn');

      if (!bar) { return; }
      const btn = document.createElement('div');
      btn.className = 'vjs-button vjs-control vjs-playback-rate';
      btn.innerHTML = `<div class="vjs-playback-rate-value">擷圖</div>`
      btn.addEventListener('click', () => screenshot(video, title));
      bar.appendChild(btn);
    }

    document.addEventListener('keydown', handleKeyDown);

    function handleKeyDown(e) {
      if (e.code !== 'KeyS') { return; }

      const now = +new Date();
      if (now - sKeyTime > 500) {
        sKeyTime = now;
        return;
      }

      console.log('ss');
      sKeyTime = 0;
      screenshot(video, title);
    }
  }

  function screenshot(video, title) {
    const currentTimeStr = new Date(video.currentTime * 1000).toISOString().slice(11, 19).replace(/\:/g, '-');
    const fn = title + '_' + currentTimeStr + '.jpg'
    saveImage(getImgDataUrl(video), fn);
  }

  function getVideo() {
    return document.getElementById('ani_video_html5_api') || document.querySelector('video');
  }

  function getImgDataUrl(videoEl, scale = window.devicePixelRatio || 1) {
    scale = scale || 1;

    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth * scale;
    canvas.height = videoEl.videoHeight * scale;
    canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', 1.0);
  }

  function saveImage(imgSrc, filename) {
    var link = window.document.createElement('a');
    link.href = imgSrc;
    link.target = '_img';
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
})();
