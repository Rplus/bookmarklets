javascript: (function() {
  var setZhTW = function() {
    [].forEach.call(document.querySelectorAll('[data-dest-lang]'), function(i) {
      i.setAttribute('data-dest-lang', 'zh-tw');
    });
  };

  setZhTW();

  document.body.addEventListener('click', function(e) {
    if (e.target.classList.contains('translate-label')) {
      setZhTW();
    }
  });
})();
