javascript: (() => {
  var allPics = [].slice.call(document.querySelectorAll('.has-expanded-path:not(.xx)'));

  allPics.forEach((pic) => {
    let path = pic.getAttribute('data-expanded-path').replace();
    let url = `https://mobile.twitter.com${path}`.match(/.+?status\/\d+/)[0];
    fetch(url).then((response) => {
      return response.text();
    })
    .then((html) => {
      var doc = document.implementation.createHTMLDocument();
      doc.body.innerHTML = html;
      /* normal picture & video thumb */
      var img = doc.body.querySelector('.CroppedPhoto-img, .VideoPreview-image');

      if (img && img.src) {
        pic.classList.add('xx');
        let _img = document.createElement('img');
        _img.style.display = 'block';
        /* :small | :orig | :large */
        _img.src = img.src + ':small';
        pic.appendChild(_img);
      }
    });
  });
})();
