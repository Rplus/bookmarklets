/* via: https://gist.github.com/addyosmani/fd3999ea7fce242756b1 */
javascript: (function () {
  [].forEach.call(document.querySelectorAll('*'), function (a) {
    a.style.outline = '1px solid #' + (~~(Math.random() * (1 << 24))).toString(16);
  });
}());
