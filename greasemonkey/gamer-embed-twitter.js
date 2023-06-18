// ==UserScript==
// @name         巴哈姆特哈啦區：嵌入 Twitter 貼文
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  embed Twitter post at forum.gamer.com
// @author       Rplus
// @match        https://m.gamer.com.tw/forum/*.php?*
// @match        https://forum.gamer.com.tw/*.php?*
// @license      WTFPL
// @grant        GM_registerMenuCommand
// @grant        GM.setValue
// @grant        GM.getValue
// @run-at       document-end
// ==/UserScript==

// TEST
// https://m.gamer.com.tw/forum/C.php?bsn=60111&snA=123760

(function() {
	'use strict';
	// twitter embed

	let links = document.querySelectorAll('.cbox_txt a, .c-post__body a');
	let has_twitter_link = false;

	links.forEach(a => {
		let qs = new URLSearchParams(a.search);
		let regex = /^http(?:s)?:\/\/(?:m(?:obile)?\.)?twitter\.com\/[^\/]+\/status\/(\d+)/;
		let url = qs?.get('url');
		if (!url || !regex.test(url)) { return; }

		has_twitter_link = true;
		let twitter_id = url.match(regex)[1];

		// theme: light, dark
		// conversation: none
		// align: left, right, center
		// width: 250 ~ 550
		// lang: https://developer.twitter.com/en/docs/twitter-for-websites/supported-languages
		// dnt: ads
		// cards: (media) hidden

		a.outerHTML = `<details open><summary>${a.outerHTML}</summary>
			<blockquote class="twitter-tweet" data-conversation="yes" data-align="center" data-dnt="true" data-lang="zh-tw"><a href="https://twitter.com/i/status/${twitter_id}"></a></blockquote>
		</details>`
	});

	if (has_twitter_link) {
		// load embed script
		// https://developer.twitter.com/en/docs/twitter-for-websites/javascript-api/guides/set-up-twitter-for-websites
		window.twttr = (function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0],
				t = window.twttr || {};
			if (d.getElementById(id)) return t;
			js = d.createElement(s);
			js.id = id;
			js.src = 'https://platform.twitter.com/widgets.js';
			fjs.parentNode.insertBefore(js, fjs);

			t._e = [];
			t.ready = function(f) {
				t._e.push(f);
			};

			return t;
		}(document, 'script', 'twitter-wjs'));
	}

})();