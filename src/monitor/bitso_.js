const humanize = require('humanize-plus');
const CoinBase = require('./coinbase');

function Bitso(table) {
  this.sourceUrl = 'https://api.bitso.com/v3/ticker/';
  this.headers = [
    'Mercado',
    'Precio',
    'Mínimo 24 horas',
    'Máximo 24 horas',
    'Volumen 24 horas'
  ];

  CoinBase.call(this, table, 'bitso');
}

Bitso.prototype = Object.create(CoinBase.prototype);
Bitso.prototype.constructor = Bitso;

Bitso.prototype.updateData = function(data) {
  var data = data.payload.map(record => {
    const marketCap = record.volume;
    const displayedMarketCap =
      marketCap && this.humanizeIsEnabled ? humanize.compactInteger(marketCap, 3) : marketCap;

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

  this.setDataTable(data);
};

module.exports = Bitso;
