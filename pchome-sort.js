/* PChome sort by price */
javascript: (function () {
  let list = document.querySelector('#ProdGridContainer');
  let lists = list.querySelectorAll('dd');

  list.innerHTML = [...lists].map((dd, i) => [i, parseInt(dd.querySelector('.value').innerText, 10)]).sort((a, b) => a[1] > b[1] ? 1 : -1).map(v => lists[v[0]].outerHTML).join('');
}());
