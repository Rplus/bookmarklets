// ==UserScript==
// @name        browndust2.com news viewer
// @namespace   Violentmonkey Scripts
// @match       https://www.browndust2.com/robots.txt
// @grant       none
// @version     1.2.0
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
	show all list
</label>
<style>
*, *::before, *::after {
	box-sizing: border-box;
}
body {
	max-width: 1200px;
	margin: 0 auto;
	background-color: #e5cc9c;
}

img {
	max-width: 100%;
}

h2 {
	display: inline;
	position: relative;
	font-size: inherit;
	margin: 0;

	& span {
		font-weight: 100;
		font-size: smaller;
		vertical-align: middle;
		opacity: .5;
	}
}

.ctx {
	white-space: pre-wrap;
	background-color: #fff9;
	padding: 1em;
}

.list {
	list-style: none;
	margin: 2em 0;
	padding-left: 50px;
}

summary {
	position: relative;
	top: 0;
	background-color: #dfb991;
	padding: 1em 1em .75em;
	min-height: 50px;
	cursor: pointer;

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background-color: #fff1;
		pointer-events: none;
		opacity: 0;
		transition: opacity .1s;
	}

	:target & {
		box-shadow: inset 0 -.5em #0003;
	}

	&:hover::before {
		opacity: 1;
	}

	& > img {
		position: absolute;
		top: 0;
		right: 100%;
		width: 50px;
		height: 50px;
	}
}

details {
	margin-block-start: 1em;

	&[open] summary {
		position: sticky;
		background-color: #ceac71;
		box-shadow: inset 0 -.5em #0003;
	}
}

#filterform {
	position: fixed;
	top: 0;
	left: 0;
	transition: opacity .2s;
	opacity: .1;

	&:hover,
	&:focus-within {
		opacity: .75;
	}
}

body:not(:has(.showall:checked))
	.list[data-query=""]
		details:nth-child(n + 20) {
	display: none;
}

.showall-label {
	position: sticky;
	bottom: 0;
	display: block;
	width: fit-content;
	margin: 0 1em 0 auto;
	padding: .25em 1em .25em .5em;
	background-color: #0002;
	border-radius: 1em 1em 0 0;
	cursor: pointer;
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
			<details name="item" data-id="${i.id}" id="news-${i.id}">
				<summary>
					<img src="https://www.browndust2.com/img/newsDetail/tag-${info.tag}.png" width="36" height="36" alt="${info.tag}" title="#${info.tag}">
					<h2>
						<span>
							#${i.id} -
							<time datetime="${info.publishedAt}" title="${info.publishedAt}">${time}</time>
						</span>
						${info.subject}
					</h2>
				</summary>
				<article class="ctx"></article>
			</details>
		`;
	}).join('');

	list.querySelectorAll('details').forEach(d => {
		d.addEventListener('toggle', (e) => {
			if (e.target.open) {
				show(e.target, e.target.dataset.id);
			}
		});
	})

	if (id) {
		taget_id(id);
	}
}

function taget_id(id) {
	let target = list.querySelector(`details[data-id="${id}"]`);
	if (target) {
		target.open = true;
		show(target, id);
	}
}

function show(target, id) {
	let ctx = target.querySelector(':scope > article.ctx');
	location.hash = `news-${id}`;
	if (!(ctx?.dataset?.init === '1')) {
		ctx.dataset.init = '1';
		let info = news_map.get(+id)?.attributes;
		let ori_link = `<a href="https://www.browndust2.com/zh-tw/news/view?id=${id}" target="_bd2news" title="official link">#</a>`;
		let content = (info?.content || info?.NewContent);
		content = content.replace(/\<img\s/g, '<img loading="lazy" ');

		ctx.innerHTML = content + ori_link;
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

	let matched_ids = query_arr.map((i, index) => {
		// if (!i.includes(value)) {
		// if (i.indexOf(value) === -1) {
		let regex = new RegExp(value, 'i');
		if (!regex.test(i)) {
			return;
		}
		return id_arr[index];
	})
	.filter(Boolean);

	if (!matched_ids.length) {
		list.dataset.query = '';
	} else {
		list.dataset.query = value;
	}

	let selectors = matched_ids.map(i => `[data-id="${i}"]`).join();
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

let data_url = window.test_data_url || 'https://www.browndust2.com/api/newsData_tw.json';
fetch(data_url)
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
