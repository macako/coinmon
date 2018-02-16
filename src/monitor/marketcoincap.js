var si = require('systeminformation'),
  utils = require('../utils');
const axios = require('axios');
const colors2 = require('colors');
const humanize = require('humanize-plus');

var colors = utils.colors;

var pars = {
  r: 'rank',
  c: 'symbol',
  p: 'price'
};

const convert = 'MXN';
const marketcapConvert = convert === 'BTC' ? 'USD' : convert;
const top = '10';
const humanizeIsEnabled = true;
const sourceUrl = `https://api.coinmarketcap.com/v1/ticker/?limit=${top}&convert=${convert}`;

function MarketCoinCap(table) {
  this.table = table;

  this.pSort = 'price';
  this.reIndex = false;
  this.reverse = false;

  var that = this;

  var updater = function() {
    axios
      .get(sourceUrl)
      .then(function(response) {
        that.updateData(response.data);
      })
      .catch(function(error) {
        console.error(
          'Coinmon is not working now. Please try again later.'.red
        );
      });
  };
  updater();
  this.interval = setInterval(updater, 3000);
  this.table.screen.key(['r', 'c', 'p'], function(ch, key) {
    if (pars[ch] == that.pSort) {
      that.reverse = !that.reverse;
    } else {
      that.pSort = pars[ch] || that.pSort;
    }

    that.reIndex = true;
    updater();
  });
}

MarketCoinCap.prototype.updateData = function(data) {
  var par = this.pSort;

  var data = data
    .sort(function(a, b) {
      return b[par] - a[par];
    })
    .map(record => {
      const percentChange1h = record.percent_change_1h;
      const textChange1h = `${percentChange1h}%`;
      const change1h = percentChange1h
        ? percentChange1h > 0 ? textChange1h.green : textChange1h.red
        : 'NA';

      const percentChange24h = record.percent_change_24h;
      const textChange24h = `${percentChange24h}%`;
      const change24h = percentChange24h
        ? percentChange24h > 0 ? textChange24h.green : textChange24h.red
        : 'NA';

      const percentChange7d = record.percent_change_7d;
      const textChange7d = `${percentChange7d}%`;
      const change7d = percentChange7d
        ? percentChange7d > 0 ? textChange7d.green : textChange7d.red
        : 'NA';

      const marketCap = record[`market_cap_${marketcapConvert}`.toLowerCase()];
      const displayedMarketCap =
        marketCap && humanizeIsEnabled
          ? humanize.compactInteger(marketCap, 3)
          : marketCap;

      return [
        record.rank,
        record.symbol,
        record[`price_${convert}`.toLowerCase()],
        change1h,
        change24h,
        change7d,
        displayedMarketCap
      ];
    });

  const headers = [
    'Rank',
    'Coin',
    `Price ${convert}`,
    'Change 1H',
    'Change 24H',
    'Change 7D',
    `Market Cap ${marketcapConvert}`
  ];

  headers[
    {
      rank: 0,
      symbol: 1,
      price: 2
    }[this.pSort]
  ] += this.reverse ? '▼' : '▲';

  this.table.setData({
    headers: headers,
    data: this.reverse ? data.reverse() : data
  });

  if (this.reIndex) {
    this.table.rows.select(0);
    this.reIndex = false;
  }

  this.table.screen.render();
};

module.exports = MarketCoinCap;
