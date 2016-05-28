// get codepen stats in `/pen/` & `/full/` page
/* globals fetch */
javascript: (function () {
  var dialogId = 'stat-dialog';
  var dialog = document.getElementById(dialogId);

  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = dialogId;
    dialog.style.position = 'fixed';
    dialog.style.top = '5em';
    dialog.style.left = '25em';
    dialog.style.right = 'auto';
    dialog.style.zIndex = '1000';
    dialog.style.width = 'auto';
    dialog.style.padding = '10px';
    dialog.onclick = () => {
      dialog.close();
    };
    document.body.appendChild(dialog);
  }

  fetch(window.location.href.replace(/(\/pen\/|\/full\/)/gi, '/drawer/'))
  .then((response) => response.text())
  .then((text) => {
    var doc = document.implementation.createHTMLDocument();
    doc.body.innerHTML = text;

    let stats = doc.querySelector('.stats');

    stats.innerHTML += `
    <style>
    #stat-dialog a {
      display: block;
      text-align: right;
      color: initial;
    }
    #stat-dialog svg {
      width: 1em;
    }
    </style>`;

    dialog.innerHTML = stats.outerHTML;
    dialog.showModal();
  });
})();
