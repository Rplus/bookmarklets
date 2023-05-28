// ==UserScript==
// @name         巴哈姆特動畫瘋小幫手：封面圖 & 自動開始 & 留言連結 & 彈幕熱圖
// @namespace    http://tampermonkey.net/
// @version      1.5.2
// @description  幫巴哈姆特動畫瘋加上封面 & 自動播放 & 留言區的直連連結 & 彈幕熱圖
// @author       Rplus
// @match        https://ani.gamer.com.tw/animeVideo.php?sn=*
// @license      WTFPL
// @grant        GM_registerMenuCommand
// @grant        GM.setValue
// @grant        GM.getValue
// @run-at       document-end
// ==/UserScript==

(async function() {
	let options = await GM.getValue('options');
	if (!options) {
		options = {
			cover: true,
			autostart: true,
			permalink: true,
			heatmap: true,
			heatmapVisibility: true,
		};
		GM.setValue('options', options);
	};

	let optionsText = {
		cover: '封面圖',
		autostart: '自動開始',
		permalink: '留言連結',
		heatmap: '彈幕熱圖',
	};

	function triggerConfig(type) {
		options[type] = !options[type];
		GM.setValue('options', options);
	}

	GM_registerMenuCommand(getMenuText('cover'), () => triggerConfig('cover'), 'C');
	GM_registerMenuCommand(getMenuText('autostart'), () => triggerConfig('autostart'), 'A');
	GM_registerMenuCommand(getMenuText('permalink'), () => triggerConfig('permalink'), 'P');
	GM_registerMenuCommand(getMenuText('heatmap'), () => triggerConfig('heatmap'), 'H');

	function getMenuText(type) {
		return `${options[type] ? '✅ 已啟用' : '❎ 已停用'}：${optionsText[type]}`;
	}

	window.addEventListener('load', init);

	function init() {
		if (options.cover) {
			// insert poster
			document.querySelector('h1')?.insertAdjacentHTML('afterbegin', `
				<a href="${unsafeWindow.animefun.poster}" target="_blank">
					<img src="${unsafeWindow.animefun.poster}" style="float: left; height: 2em; margin-top: 4px; margin-right: 8px;" />
				</a>`);

			// insert published time
			let timeTag = document.querySelector('.anime_info_detail p');
			let time = timeTag?.textContent.split('：')?.[1];
			if (time) {
				timeTag.textContent += ` (${getRelatedDays(time)}天前)`;
			}
		}

		// latest duration
		// animefun.breakPoint.breakPoint

		if (options.autostart) {
			// auto start when it is not comment permalink
			if (location.search.indexOf('pcid') === -1) {
				checkReady();
			}
		}

		// observer comments to add permalink
		if (options.permalink) {
			let ob = new MutationObserver(checkCmtBoxBeMore);
			ob.observe(document.getElementById('w-post-box'), {
				childList: true,
				subtree: true,
			});
		}

		// danmu heatmap
		if (options.heatmap) {
			danmuHelper();
		}
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

	function danmuHelper() {
		let _danmu = unsafeWindow.animefun?.danmu;
		if (_danmu && _danmu.length) {
			danmuAnal(_danmu);
		} else {
			jQuery.ajax({
				url: '/ajax/danmuGet.php',
				data: { sn: unsafeWindow.animefun.videoSn, },
				method: 'POST',
				dataType: 'json',
			})
			.then(danmuAnal);
		}
	}

	function updateVideoDuration(e) {
		let key = '';
		let target = document.querySelector('.danmu-heatmap');
		let new_v = document.getElementById('ani_video_html5_api')?.duration;
		let old_v = parseFloat(getComputedStyle(target).getPropertyValue('--video-duration'));

		if (new_v && old_v && new_v > old_v && isFinite(new_v)) {
			console.log('video-source-duration', {new_v, old_v});
			target.style.setProperty('--video-source-duration', new_v);
			document.getElementById('ani_video_html5_api').removeEventListener('durationchange', updateVideoDuration);
		}
	}
	let timer = 0;
	function obVideo() {
		if (!document.getElementById('ani_video_html5_api') && timer < 20) {
			setTimeout(obVideo, 1000);
		} else {
			document.getElementById('ani_video_html5_api').addEventListener('durationchange', updateVideoDuration);
		}
	}

	function danmuAnal(danmu) {
		// let byUser = danmu.reduce((all, i) => {
		// 	let uid = i.userid;
		// 	if (!all[uid]) { all[uid] = []; }
		// 	all[uid].push(i);
		// 	return all;
		// }, {});
		let danmu_duration = danmu[danmu.length - 1].time / 10;
		obVideo();

		document.querySelector('#ani-tab-content-2 .ani-setting-item').insertAdjacentHTML('afterend', `
			<div class="ani-setting-item ani-flex">
				<div class="ani-setting-label">彈幕熱圖</div>
				<div class="ani-set-flex-right">
					<div class="ani-checkbox">
						<label class="ani-checkbox__label">
							<input type="checkbox" id="danmu-heatmap-ckbox" ${options.heatmapVisibility ? 'checked' : ''} />
							<div class="ani-checkbox__button"></div>
						</label>
					</div>
				</div>
			</div>
		`);

		document.querySelector('#danmu-heatmap-ckbox').addEventListener('change', (e) => {
			document.querySelector('.danmu-heatmap').hidden = !e.target.checked;
			triggerConfig('heatmapVisibility');
		});

		// heatmap
		let dots = `<div class="danmu-heatmap" ${options.heatmapVisibility ? '' : 'hidden'}>` + danmu.map(i => {
			return `<i data-time="${i.time / 10}" style="--danmu-time: ${i.time / 10}" title="${i.text}"></i>`;
		}).join('') + '</div>';
		let dots_style = `<style>
			.danmu-heatmap {
				--video-duration: var(--video-source-duration, ${danmu_duration});
				position: absolute;
				left: 0;
				right: 0;
				top: 100%;
				z-index: 1;
				height: 1em;
				overflow: hidden;
				background-color: #000;
			}
			.danmu-heatmap i {
				position: absolute;
				left: calc(var(--danmu-time, 1) / var(--video-duration) * 100%);
				margin-left: -0.25em;
				width: 0.5em;
				height: 1em;
				background: #fff;
				opacity: var(--dh-op, ${danmu.length > 1000 ? 0.05 : 0.1});
			}
			.danmu-heatmap i:hover {
				opacity: .8;
				z-index: 2;
				background: #ff0;
			}
			.reply_time a {
				color: unset;
			}
		</style>`;
		let videoframe = document.querySelector('.videoframe');
		videoframe.style.position = 'relative';
		videoframe.insertAdjacentHTML('beforeend', dots + dots_style);

		videoframe.querySelector('.danmu-heatmap').addEventListener('click', (e) => {
			if (e.target.tagName !== 'I') { return; }
			jumpVideoTime(+e.target.dataset?.time);
		})
	}

	function jumpVideoTime(time = 0) {
		document.getElementById('ani_video_html5_api').currentTime = time;
	}
})();
