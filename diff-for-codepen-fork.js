javascript:(() => {
let getPenUrl = (url) => {
  return url.replace('#forks', '').replace('/details/', '/pen/');
};
let linkOfForks = [].slice.call(document.querySelectorAll('#forks a'));

let urls = {
  origin: getPenUrl(`https://codepen.io${location.pathname.replace(/\/$/, '')}`),
  forks: []
};

let files = {
  types: ['html', 'css', 'js'],
  origin: {
    html: '',
    css: '',
    js: ''
  },
  forks: null
};

let originFetch = files.types
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
          forkLink.style.setProperty(`--c-${fileType}`, isDiff ? '#f00' : '#fff');
        });
      })
  });
});

let checkForkStyle = document.getElementById('checkForkStyle');

if (!checkForkStyle) {
  checkForkStyle = document.createElement('style');
  checkForkStyle.id = 'checkForkStyle';
  checkForkStyle.textContent = `
  #forks a::before {
    content: '';
    position: absolute;
    left: .5em;
    top: 0;
    width: 1em;
    height: 1em;
    border-radius: 50%;
    opacity: .3;
    box-shadow:
      -1em 0 var(--c-html, #666),
      -1em 1.1em var(--c-css, #666),
      -1em 2.2em var(--c-js, #666);
    font-size: .5em;
  }`;
  document.body.appendChild(checkForkStyle);
}
})();
