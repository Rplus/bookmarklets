// ==UserScript==
// @name         ebook parser
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  ebook parser
// @author       mmm
// @match        https://czbooks.net/n/*
// @run-at       document-end
// ==/UserScript==

(function() {
	window.addEventListener('DOMContentLoaded', init);
	let data = [];
	let parser = new DOMParser();

	function init() {
		let ul = document.querySelector('.novel-detail-function-bar');
		if (!ul) { return; }
		ul.insertAdjacentHTML('beforeend', `<li><a id="parser-gogogo" class="btn-lastread" href="###">Parser</a></li>`);
		ul.insertAdjacentHTML('beforeend', `<li><a id="parser-download" class="btn-lastread" href="###">Download</a></li>`);

		document.querySelector('#parser-gogogo').addEventListener('click', startParse);
		document.querySelector('#parser-download').addEventListener('click', download);
	}

	function download() {
		// downloadURI('data:text/html,HelloWorld!', 'helloWorld.txt');
		let title = document.querySelector('.info .title').textContent.trim();
		downloadURI(getAllText(), title + '.txt');
	}

	function getAllText() {
		return `data:text/html,${data.map(i => i.text).join('\n\n\n\n')}`;
	}

	function downloadURI(uri, name) {
		let doc = document.createDocumentFragment();
		let link = document.createElement('a');
		link.download = name;
		link.href = uri;
		doc.appendChild(link);
		link.click();
		delete doc;
	}

	function startParse() {
		console.log('startParse');
		let links = [...document.querySelectorAll('.chapter-list li a')]
			.map((a, index) => ({
				index,
				title: a.textContent.trim(),
				url: a.href,
				parsed: a.classList.contains('parsed'),
				a,
			}));

		let workingLinks = links.filter(i => !i.parsed);

		if (!workingLinks.length) {
			alert('all done');
			delete parser;
			return;
		}

		console.log('workingLinks', workingLinks);
		workingLinks.forEach(parse);
	}

	let lines = [];
	let lineLimit = 10;
	function parse(link) {
		console.log('parse', link);
		if (lines[link.index % lineLimit]) {
			setTimeout(() => {
				parse(link);
			}, 1000);
			return;
		}

		lines[link.index % lineLimit] = 1;
		link.a.classList.add('parsing');

		fetch(link.url).then(r => r.text()).then(rawhtml => {
			let doc = parser.parseFromString(rawhtml, 'text/html');
			let text = link.title + '\n\n' + doc.querySelector('.content')?.textContent.trim();
			text = text.replace('“', '「').replace('”', '」');
			data[link.index] = {...link, text};

			lines[link.index % lineLimit] = 0;
			link.a.classList.remove('parsing');
			link.a.classList.add('parsed');
			link.a.style.borderRight = '4px solid #fff6';
		})
	}

})();
