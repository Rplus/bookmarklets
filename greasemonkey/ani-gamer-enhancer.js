// ==UserScript==
// @name         巴哈姆特動畫瘋小幫手：封面圖 & 自動開始 & 留言連結
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  幫巴哈姆特動畫瘋加上封面 & 自動播放 & 留言區的直連連結
// @author       Rplus
// @match        https://ani.gamer.com.tw/animeVideo.php?sn=*
// ==/UserScript==

(function() {
	window.addEventListener('load', init);

	function init() {
		// insert poster
		document.querySelector('h1')?.insertAdjacentHTML('afterbegin', `
			<a href="${unsafeWindow.animefun.poster}">
				<img src="${unsafeWindow.animefun.poster}" style="float: left; height: 2em; margin-top: 4px; margin-right: 8px;" />
			</a>`);

		// insert published time
		let timeTag = document.querySelector('.anime_info_detail p');
		let time = timeTag?.textContent.split('：')?.[1];
		if (time) {
			timeTag.textContent += ` (${getRelatedDays(time)}天前)`;
		}

		// auto start when it is not comment permalink
		if (location.search.indexOf('pcid') === -1) {
			checkReady();
		}

		// observer comments to add permalink
		// let cmtList;
		let ob = new MutationObserver(checkCmtBoxBeMore);
		ob.observe(document.getElementById('w-post-box'), {
			childList: true,
			subtree: true,
		});
	}

	function getRelatedDays(time = new Date()) {
		return ((new Date() - new Date(time))/(1000*60*60*24)).toFixed();
	}

	function checkReady() {
		setTimeout(() => {
			console.log(111, unsafeWindow.adult);
			if (unsafeWindow.AnimeRoute && unsafeWindow.adult && unsafeWindow.animefun) {
				unsafeWindow.adult.click();
			} else {
				checkReady();
			}
		}, 1000)
	}

	function genCmtLinks() {
		[...document.querySelectorAll('span.reply_time')].forEach(node => {
			let a = node.nextElementSibling;
			if (node.querySelector('a') || !a) {
				return;
			}
			let config = JSON.parse(a.dataset?.tippyMenuComment);
			let qs = new URLSearchParams({
				sn: new URLSearchParams(location.search).get('sn'),
				pcid: config.pid || config.cid,
			});
			if (config.pid) {
				qs.append('cid', config.cid);
			}
			let url = `https://ani.gamer.com.tw/animeVideo.php?` + qs.toString()
			node.innerHTML = `<a href="${url}"># ${node.textContent}</a>`
		});
	}

	function checkCmtBoxBeMore(mutations) {
		console.log('checkCmtBoxBeMore');
		genCmtLinks();
		// mutations.forEach((mutation) => {
		// 	console.log('checkCmtBoxBeMore mutation');
		// 	console.log(222, 'checkCmtBoxsBeMore', mutation.target.querySelectorAll('.c-reply__item').length);
		// });
	}
})();
