javascript: (function () {
  /* via: http://stackoverflow.com/a/36247412/5940513 */
  var leftPad = (s, c, n) => c.repeat(n - s.length) + s;

  var now = new Date();
  var thisYear = now.getFullYear();
  var thisMonth = leftPad(String(now.getMonth() + 1), '0', 2);
  var nextMonth = leftPad(String(now.getMonth() + 2), '0', 2);

  var limit = 200;

  var firstDayOfThisMonth = new Date(`${thisYear}-${thisMonth}-01`) / 1000;
  var firstDayOfNextMonth = new Date(`${thisYear}-${nextMonth}-01`) / 1000;

  var graphAPI = {
    token: window.token.fb,
    url: 'https://graph.facebook.com/v2.7',
    groupId: '1249720198386038'
  };

  var memberUrl = `${graphAPI.url}/${graphAPI.groupId}/members?limit=${limit}&access_token=${graphAPI.token}`;
  var feedUrl = `${graphAPI.url}/${graphAPI.groupId}/feed?fields=created_time,from,description&until=${firstDayOfNextMonth}&since=${firstDayOfThisMonth}&limit=${limit}&access_token=${graphAPI.token}`;

  Promise.all([memberUrl, feedUrl].map(url => window.fetch(url)))
    .then(resp => Promise.all(resp.map(r => r.json())))
    .then(result => {
      var [members, feeds] = result.map(i => i.data);

      if (members.length > limit || feeds.length > limit) {
        console.error(`數量超過 ${limit} 了`);
      }

      feeds.forEach(item => {
        item.uid = item.from.id;
        item.uname = item.from.name;
      });

      var uniqueUidsFromFeeds = [...new Set(feeds.map(i => i.from.id))];

      var leechMembers = members.filter(m => {
        return !uniqueUidsFromFeeds.includes(m.id);
      });

      console.warn('leech member:', leechMembers);

      /* render them */
      var html = leechMembers.map(i => {
        return `<figure>
        <img src="https://graph.facebook.com/${i.id}/picture?width=100&height=100&type=square">
        <figcaption><a href="https://fb.com/${i.id}">${i.name}</a></figcaption>
        </figure>`;
      });

      html = `<div style="display: flex; flex-wrap: wrap; text-align: center;">${html.join('')}</div>`;

      window.open(`data:text/html;charset=utf-8,<meta charset="utf-8">${html}`);
    });
})();
