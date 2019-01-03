var utils = require('../utils');
const axios = require('axios');
const colors = require('colors');
const humanize = require('humanize-plus');
const CoinBase = require('./coinbase');

const sourceUrl = 'https://api.coinmarketcap.com/v1/ticker/?limit=10&convert=MXN';

class MarketCoinCap extends CoinBase {
  constructor(table) {
    super(table, 'coinMarketCap', sourceUrl);
    this.convert = 'MXN';
    this.marketcapConvert = this.convert === 'BTC' ? 'USD' : this.convert;
    this.top = '10';

    this.headers = [
      'Rank',
      'Coin',
      `Price ${this.convert}`,
      'Change 1H',
      'Change 24H',
      'Change 7D',
      `Market Cap ${this.marketcapConvert}`
    ];
  }

  updateData(data) {
    var _data = data.map(record => {
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

      const marketCap = record[`market_cap_${this.marketcapConvert}`.toLowerCase()];
      const displayedMarketCap =
        marketCap && this.humanizeIsEnabled
          ? humanize.compactInteger(marketCap, 3)
          : marketCap;

      return [
        record.rank,
        record.symbol,
        record[`price_${this.convert}`.toLowerCase()],
        change1h,
        change24h,
        change7d,
        displayedMarketCap
      ];
    });

    this.setDataTable(_data);
  }
}

module.exports = MarketCoinCap;
