const humanize = require('humanize-plus');
const CoinBase = require('./coinbase');

class Bitso extends CoinBase {
  constructor(table) {
    super(table, 'bitso', 'https://api.bitso.com/v3/ticker/');
    this.headers = [
      'Mercado',
      'Precio',
      'Mínimo 24 horas',
      'Máximo 24 horas',
      'Volumen 24 horas'
    ];
  }

  updateData(data) {
    let _data = data.payload.map(record => {
      let marketCap = record.volume;
      let displayedMarketCap =
        marketCap && this.humanizeIsEnabled
          ? humanize.compactInteger(marketCap, 3)
          : marketCap;

      let market = record.book.split('_')[0];
      let exchange = ' '.concat(record.book.split('_')[1]);

      return [
        market,
        record.last + exchange,
        record.low + exchange,
        record.high + exchange,
        displayedMarketCap + exchange
      ];
    });

    this.setDataTable(_data);
  }
}

module.exports = Bitso;
