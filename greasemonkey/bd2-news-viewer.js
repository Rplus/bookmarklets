// ==UserScript==
// @name        browndust2.com news viewer
// @namespace   Violentmonkey Scripts
// @match       https://www.browndust2.com/robots.txt
// @grant       none
// @version     1.4.1
// @author      Rplus
// @description custom news viewer for sucking browndust2.com
// @require     https://unpkg.com/localforage@1.10.0/dist/localforage.min.js#sha384-MTDrIlFOzEqpmOxY6UIA/1Zkh0a64UlmJ6R0UrZXqXCPx99siPGi8EmtQjIeCcTH
// @@run-at     document-end
// @license     WTFPL
// ==/UserScript==

document.head.insertAdjacentHTML(
	'beforeend',
	`<link rel="icon" type="image/png" sizes="16x16" href="/img/seo/favicon.png">`
);

document.body.innerHTML = `
<form id="filterform">
	Filter
	<input type="search" name="q" tabindex="1" id="searchinput">
	<style id="filter_style"></style>
</form>

<div class="list" id="list" data-query=""></div>
<hr>
<input type="reset" value="Delete all cached data" id="delete_btn">

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
		font-weight: 400;
		font-size: smaller;
		vertical-align: middle;
		opacity: .5;
	}
}
@media (max-width:750px) {
	details summary {
		text-indent: -1.1em;
		padding-left: 1.5em;

		&::marker {
			font-size: smaller;
		}
	}
	h2 span {
		position: absolute;
		top: -15px;
		left: 1.5em;
		font-size: 12px;
		opacity: .3;
	}
}

.ctx {
	white-space: pre-wrap;
	background-color: #fff9;
	padding: 1em;

	& [style*="background-color"],
	& [style*="font-size"],
	& [style*="font-family"] {
		font-size: inherit !important;
		font-family: inherit !important;
		background-color: unset !important;
	}
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
		// let ctx = info.NewContent || info.content;
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
		d.addEventListener('toggle', show);
	})

	if (id) {
		auto_show(id);
	}
}

function auto_show(id) {
	let target = list.querySelector(`details[data-id="${id}"]`);
	if (target) {
		target.open = true;
		show({ target, });
	}
}

function show({ target, }) {
	if (!target.open) {
		return;
	}

	let id = +target.dataset.id;
	let ctx = target.querySelector(':scope > article.ctx');
	location.hash = `news-${id}`;
	if (!ctx) {
		return;
	}

	if (ctx.dataset?.init !== '1') {
		ctx.dataset.init = '1';

		let info = news_map.get(id)?.attributes;
		let ori_link = `<a href="https://www.browndust2.com/zh-tw/news/view?id=${id}" target="_bd2news" title="official link">#</a>`;
		if (!info) {
			ctx.innerHTML = ori_link;
			return;
		}

		let content = (info.content || info.NewContent);
		content = content.replace(/\<img\s/g, '<img loading="lazy" ');
		ctx.innerHTML = content + ori_link;
	}
}

function format_time(time) {
	let _time = time ? new Date(time) : new Date();
	return _time.toLocaleString('zh-TW', {
		weekday: 'narrow',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
}

function query_kwd() {
	// console.time('query');
	let value = searchinput.value?.trim()?.toLowerCase();
	// console.log('query', value);
	if (!value) {
		filter_style.textContent = '';
		list.dataset.query = '';
		return;
	}

	let matched_ids = query_arr.map((i, index) => {
		let regex = new RegExp(value);
		return regex.test(i) ? id_arr[index] : null;
	})
	.filter(Boolean);

	if (matched_ids.length) {
		list.dataset.query = value;
	} else {
		list.dataset.query = '';
	}

	let selectors = matched_ids.map(i => `details[data-id="${i}"]`).join();
	filter_style.textContent = `
		details {display:none;}
		${selectors} { display: block; }
	`;
	// console.timeEnd('query');
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

let data_url = `https://www.browndust2.com/api/newsData_tw.json?${+new Date()}`;
if (window.test_data_url) {
	data_url = window.test_data_url;
}

async function get_data() {
	try {
		let is_newer = await check_newer_data();
		console.log({is_newer});
		if (!is_newer) {
			return await localforage.getItem('data');
		}

		let response = await fetch(data_url);
		if (!response.ok) {
			throw new Error('fetch error', response);
		}
		let json = await response.json();
		let _data = json.data.reverse();
		localforage.setItem('etag', response.headers.get('etag'));
		localforage.setItem('data', _data);
		return _data;
	} catch(e) {
		throw new Error(e);
	}
}

async function check_newer_data() {
		// data_url = 'https://www.browndust2.com/api/newsData_tw.json';
	let response = await fetch(data_url, { method: 'HEAD', });
	let new_etag = response.headers.get('etag');

	let old_etag = await localforage.getItem('etag') || '';
	console.log({new_etag, old_etag});
	return old_etag !== new_etag;
}

async function init() {
	list.innerHTML = 'loading...';
	data = await get_data();
	console.log({data});
	data.forEach(i => {
		let info = i.attributes;
		let string = [
			i.id,
			info.content,
			info.NewContent,
			`#${info.tag}`,
			info.subject,
		].join().toLowerCase();

		id_arr.push(i.id);
		news_map.set(i.id, i);
		query_arr.push(string);
	});

	let id = new URL(location.href)?.searchParams?.get('id') || data[data.length - 1].id || 34;
	render(id);
}

init();

filterform.addEventListener('submit', e => e.preventDefault());
searchinput.addEventListener('input', debounce(query_kwd, 300));
delete_btn.addEventListener('click', () => {
	localforage.clear();
	location.reload();
});
