javascript:(() => {
  let title = document.title || '';
  let getContent = (query) => {
    return (document.querySelector(query) || {content: ''}).content;
  };
  let author = getContent('meta[name="author"]');
  let date = getContent('meta[name="date"]') || getContent('meta[property="article:published_time"]').split('T')[0];
  let url = getContent('meta[property="twitter:url"]');
  if (!url) {
    url = document.querySelector('link[rel="canonical"]');
    url = url && url.href || document.location.href.split('?utm')[0];
  }

  let dialog = document.createElement('dialog');
  dialog.style.whiteSpace = 'pre';
  dialog.innerHTML = `${title}\nby ${author} ${date}\n${url}\n#f2etw`;
  dialog.onclick = () => {
    document.execCommand('SelectAll', false, null);
    document.execCommand('copy', false, null);
    dialog.close();
  };
  document.body.appendChild(dialog);
  dialog.showModal();
})();
