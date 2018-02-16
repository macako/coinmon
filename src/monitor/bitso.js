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
const sourceUrl = `https://api.bitso.com/v3/ticker/`;

function Bitso(table) {
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
          error + 'Coinmon is not working now. Please try again later.'.red
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

Bitso.prototype.updateData = function(data) {
  var par = this.pSort;

  var data = data.payload
    .sort(function(a, b) {
      return b[par] - a[par];
    })
    .map(record => {
      const marketCap = record.volume;
      const displayedMarketCap =
        marketCap && humanizeIsEnabled
          ? humanize.compactInteger(marketCap, 3)
          : marketCap;

      const market = record.book.split('_')[0];
      const exchange = ' '.concat(record.book.split('_')[1]);

      return [
        market,
        record.last + exchange,
        record.low + exchange,
        record.high + exchange,
        displayedMarketCap + exchange
      ];
    });

  const headers = [
    'Mercado',
    'Precio',
    'Mínimo 24 horas',
    'Máximo 24 horas',
    'Volumen 24 horas'
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

module.exports = Bitso;
