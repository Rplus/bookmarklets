javascript:(() => {
var getPenUrl = (url) => {
  return url.replace('#forks', '').replace('/details/', '/pen/');
};
var linkOfForks = [].slice.call(document.querySelectorAll('#forks a'));

var urls = {
  origin: getPenUrl(`https://codepen.io${location.pathname.replace(/\/$/, '')}`),
  forks: []
};

var files = {
  types: ['html', 'css', 'js'],
  origin: {
    html: '',
    css: '',
    js: ''
  },
  forks: null
};

var originFetch = files.types
  .map((type) => `${urls.origin}.${type}`)
  .map((fileUrl) => {
    return new Promise((resolve, reject) => {
      fetch(fileUrl).then((res) => res.text()).then(resolve).catch(reject);
    });
  });

Promise.all(originFetch).then((originFiles) => {
  let [html, css, js] = originFiles;
  files.origin = { html, css, js };

  linkOfForks.forEach((forkLink) => {
    let link = getPenUrl(forkLink.href);
    forkLink.diff = {};
    files.types
      .map((type) => `${link}.${type}`)
      .forEach((fileUrl, fileTypeIndex) => {
        fetch(fileUrl).then((res) => res.text()).then((string) => {
          let isDiff = (string !== originFiles[fileTypeIndex]);
          let fileType = files.types[fileTypeIndex];
          forkLink.diff[fileType] = isDiff ? 'diff' : 'same';
          forkLink.style.setProperty(`--c-${fileType}`, isDiff ? '#000' : '#fff');
        });
      })
  });
});

var checkForkStyle = document.getElementById('checkForkStyle');

if (!checkForkStyle) {
  checkForkStyle = document.createElement('style');
  checkForkStyle.id = 'checkForkStyle';
  checkForkStyle.textContent = `
  #forks a::before {
    content: '';
    position: absolute;
    left: .5em;
    top: 0;
    width: .5em;
    height: 30%;
    opacity: .5;
    box-shadow:
      -.5em 0 var(--c-html, #666),
      -.5em 1em var(--c-css, #666),
      -.5em 2em var(--c-js, #666);
  }`;
  document.body.appendChild(checkForkStyle);
}
})();
