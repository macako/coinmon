#!/usr/bin/env node
const fs = require('fs')
const program = require('commander')
const axios = require('axios')
const ora = require('ora')
const Table = require('cli-table2')
const colors = require('colors')
const humanize = require('humanize-plus')

const list = val => val.split(',')
const portfolioPath = `${process.env['HOME']}/.coinmon/portfolio.json`

program
  .version('0.0.13')
  .option('-c, --convert [currency]', 'Convert to your currency', 'usd')
  .option('-f, --find [symbol]', 'Find specific coin data with coin symbol (can be a comma seperated list)', list, [])
  .option('-t, --top [index]', 'Show the top coins ranked from 1 - [index] according to the market cap', null)
  .option('-H, --humanize [enable]', 'Show market cap as a humanized number, default true', true)
  .option('-P, --portfolio', 'Retrieve coins specified in $HOME/.coinmon/portfolio.json file', true)
  .option('-C, --column [index]', 'Display columns (can be a comma seperated list)', list, [])
  .parse(process.argv)

const convert = program.convert.toUpperCase()
const availableCurrencies = ['USD', 'AUD', 'BRL', 'CAD', 'CHF', 'CLP', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PKR', 'PLN', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'TWD', 'ZAR', 'BTC']
if (availableCurrencies.indexOf(convert) === -1) {
  return console.log('We cannot convert to your currency.'.red)
}
const marketcapConvert = convert === 'BTC' ? 'USD' : convert
const find = program.find
let portfolioEnabled;
if (program.portfolio) {
  if (fs.existsSync(portfolioPath)) {
    portfolioEnabled = true;
  } else {
    console.log(`Please include a configuration file at ${portfolioPath}`.red)
    process.exit();
  }
}
const top = !isNaN(program.top) && +program.top > 0 ? +program.top : ((find.length > 0 || portfolioEnabled) ? 1500 : 10)
const humanizeIsEnabled = program.humanize !== 'false'
// handle columns
const defaultHeader = ['Rank', 'Coin', `Price ${convert}`, 'Change 1H', 'Change 24H', 'Change 7D', `Market Cap ${marketcapConvert}`].map(title => title.yellow)
const columns = program.column
  .map(index => +index)
  .filter((index) => {
  return !isNaN(index) 
    && index > 1
    && index < defaultHeader.length
})
const sortedColumns = columns.concat(0).concat(1).sort()
const customizedHeader = sortedColumns.map(index => defaultHeader[index])
const header = columns.length === 0 ? defaultHeader : customizedHeader
const table = new Table({
  chars: {
    'top': '-',
    'top-mid': '-',
    'top-left': '-',
    'top-right': '-',
    'bottom': '-',
    'bottom-mid': '-',
    'bottom-left': '-',
    'bottom-right': '-',
    'left': '║',
    'left-mid': '-',
    'mid': '-',
    'mid-mid': '-',
    'right': '║',
    'right-mid': '-',
    'middle': '│'
  },
  head: header
})

// Read portfolio config and add an extra column if needed
let portofolioCoins = [];
let portfolioSum = 0;
if (portfolioEnabled) {
  portfolioCoins = JSON.parse(fs.readFileSync(portfolioPath).toString());
  table.options.head.push('Estimated Value'.yellow)
}
const spinner = ora('Loading data').start()
const sourceUrl = `https://api.coinmarketcap.com/v1/ticker/?limit=${top}&convert=${convert}`
axios.get(sourceUrl)
  .then(function (response) {
    spinner.stop()
    response.data
      .filter(record => {
          if (portfolioEnabled) {
            return Object.keys(portfolioCoins).some(keyword => record.symbol.toLowerCase() === keyword.toLowerCase())
          }
          if (find.length > 0) {
            return find.some(keyword => record.symbol.toLowerCase() === keyword.toLowerCase())
          }
        return true
      })
      .map(record => {

        const percentChange1h = record.percent_change_1h
        const textChange1h = `${percentChange1h}%`
        const change1h = percentChange1h ? (percentChange1h > 0 ? textChange1h.green : textChange1h.red) : 'NA'

        const percentChange24h = record.percent_change_24h
        const textChange24h = `${percentChange24h}%`
        const change24h = percentChange24h ? (percentChange24h > 0 ? textChange24h.green : textChange24h.red) : 'NA'

        const percentChange7d = record.percent_change_7d
        const textChange7d = `${percentChange7d}%`
        const change7d = percentChange7d ? (percentChange7d > 0 ? textChange7d.green : textChange7d.red) : 'NA'

        const marketCap = record[`market_cap_${marketcapConvert}`.toLowerCase()]
        const displayedMarketCap = marketCap && humanizeIsEnabled ? humanize.compactInteger(marketCap, 3) : marketCap
        const defaultValues = [
          record.rank,
          record.symbol,
          record[`price_${convert}`.toLowerCase()],
          change1h,
          change24h,
          change7d,
          displayedMarketCap,
        ]
        const customizedValues = sortedColumns.map(index => defaultValues[index])
        const values = columns.length === 0 ? defaultValues : customizedValues
        if (portfolioEnabled) {
          const portfolioGross = (portfolioCoins[record.symbol.toLowerCase()] * parseFloat(record[`price_${convert}`.toLowerCase()])).toFixed(2)
          portfolioSum = portfolioSum + parseFloat(portfolioGross);
          return [...values, portfolioGross]
        }
        return values
      })
      .forEach(record => table.push(record))
    if (table.length === 0) {
      console.log('We are not able to find coins matching your keywords'.red)
    } else {
      console.log(`Data source from coinmarketcap.com at ${new Date().toLocaleTimeString()}`)
      console.log(table.toString())
      portfolioEnabled && console.log('Estimated portfolio: '.bold + `${portfolioSum.toFixed(2)}`.green + ` ${convert}\n`)
    }
  })
  .catch(function (error) {
    spinner.stop()
    console.error('Coinmon is not working now. Please try again later.'.red)
  })