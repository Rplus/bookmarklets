// ==UserScript==
// @name        browndust2.com news viewer
// @namespace   Violentmonkey Scripts
// @match       https://www.browndust2.com/robots.txt
// @grant       none
// @version     1.0
// @author      Rplus
// @description custom news viewer for sucking browndust2.com
// @license     WTFPL
// ==/UserScript==

document.head.innerHTML = `
<link rel="icon" type="image/png" sizes="16x16" href="/img/seo/favicon.png">
`;

document.body.innerHTML = `
<form id="filterform">
	Filter
	<input type="search" name="q" tabindex="1" id="searchinput">
	<style id="filter_style"></style>
</form>

<div class="list" id="list" data-query=""></div>
<hr>
<label class="showall-label">
	<input type="checkbox" class="showall" >
	show all
</label>
<style>
body {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #e5cc9c;
}
.ctx {
  white-space: pre-wrap;
  background-color: #fff9;
  padding: 1em;
}
img {
  max-width: 100%;
}
.list {
  list-style: none;
  margin: 0;
  padding-left: 50px;
}
li {
  margin-top: 1em;
  margin-bottom: 1em;
}
summary {
  position: sticky;
  top: 0;
  background-color: #dfb991;
  padding: 1em;
  cursor: pointer;

  & img {
    position: absolute;
    top: 0;
    right: 100%;
    height: 50px;
    width: 50px;
  }
}
details {
  margin-bottom: 1em;
  &[open] summary {
    background-color: #ffc;
    background-color: #ceac71;
    box-shadow: inset 0 -.5em #0003;
  }
}

#filterform {
  position: fixed;
  top: 0;
  right: 0;
}

body:not(:has(.showall:checked)) .list[data-query=""] details:nth-child(n + 20) {
  display: none;
}

.showall-label {
  display: block;
  margin: 0 auto;
  width: fit-content;
  padding: 1em;
}
</style>
`;

let data = [];
let news_map = new Map();
let query_arr = [];
let id_arr = [];

function render(id = 34) {
	list.innerHTML = data.map(i => {
		let info = i.attributes;
		let ctx = info.NewContent || info.content;
		let time = format_time(info.publishedAt);
		return `
			<details name="item" data-id="${i.id}">
				<summary>
					<img src="https://www.browndust2.com/img/newsDetail/tag-${info.tag}.png" width="36" height="36">
					#${i.id} - <time>${time}</time>
					${info.subject}
				</summary>
				<div class="ctx"></div>
			</details>
		`;
	}).join('');

	list.querySelectorAll('details').forEach(d => {
		d.addEventListener('toggle', (e) => {
			show(e.target, e.target.dataset.id);
		});
	})

	if (id) {
		taget_id(id);
	}
}

function taget_id(id) {
	let target = list.querySelector(`details[data-id="${id}"]`)
	let event = new CustomEvent('toggle');
	target.open = true;
	target.dispatchEvent(event);
	target.scrollIntoView();
}

function show(target, id) {
	let ctx = target.querySelector(':scope > div.ctx');
	if (!(ctx?.dataset?.init === '1')) {
		ctx.dataset.init = '1';
		let info = news_map.get(+id)?.attributes;
		let ori_link = `<a href="https://www.browndust2.com/zh-tw/news/view?id=${id}" target="_bd2news" title="official link">#</a>`;
		ctx.innerHTML = (info?.content || info?.NewContent) + ori_link;

		setTimeout(() => {
			target.scrollIntoView({ behavior: 'smooth', });
		}, 350);
	}
}

const time_format = {
	weekday: 'narrow',
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
};
function format_time(time) {
	let _time = time ? new Date(time) : new Date();
	return _time.toLocaleString('zh-TW', time_format);
}

function query() {
	let value = searchinput.value;
	// console.log('query', value);
	if (!value) {
		filter_style.textContent = '';
		list.dataset.query = '';
		return;
	}

	let op = query_arr.map((i, index) => {
		// if (!i.includes(value)) {
		// if (i.indexOf(value) === -1) {
		let regex = new RegExp(value, 'i');
		if (!regex.test(i)) {
			return;
		}
		return id_arr[index];
	})
	.filter(Boolean);

	if (!op.length) {
		list.dataset.query = '';
	} else {
		list.dataset.query = value;
	}

	let selectors = op.map(i => `[data-id="${i}"]`).join();
	filter_style.textContent = `
		details {display:none;}
		details:is(${selectors}) { display: block; }
	`;
}

function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		clearTimeout(timeout);
		if (immediate && !timeout) func.apply(context, args);
		timeout = setTimeout(function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		}, wait);
	};
}

fetch('https://www.browndust2.com/api/newsData_tw.json')
	.then(r => r.json())
	.then(d => {
		data = d.data.reverse();
		tags = [...new Set(data.map(i => {
			let info = i.attributes;
			news_map.set(i.id, i);
			id_arr.push(i.id);
			query_arr.push([
				i.id,
				info.content,
				info.NewContent,
				`#${info.tag}`,
				info.subject,
			].join());
			return i.attributes.tag;
		}))];

		// console.log(data[900], tags);
		let id = new URL(location.href)?.searchParams?.get('id') || data[data.length - 1].id || 34;
		render(id);
	});

filterform.addEventListener('submit', e => e.preventDefault());
searchinput.addEventListener('input', debounce(query, 300));
