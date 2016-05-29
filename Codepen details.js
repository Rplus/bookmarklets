// get codepen stats in `/pen/` & `/full/` page
/* globals fetch */
javascript: (function () {
  var dialogId = 'stat-dialog';
  var dialog = document.getElementById(dialogId);

  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = dialogId;
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
    #stat-dialog {
      position: fixed;
      top: 5em;
      left: 25em;
      right: auto;
      z-index: 1000;
      width: auto;
      padding: 10px;
    }
    #stat-dialog .stats {
      position: static;
    }
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
