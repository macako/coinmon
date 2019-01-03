#!/usr/bin/env node
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const monitor = require('./monitor');
const screen = blessed.screen();

var bitso, coinMarketCap;
const BITSO_KEY = 'b';
const COIN_MARKET_CAP_KEY = 'c';
const BITSO_LABEL = 'bitso (' + BITSO_KEY + ')';
const COIN_MARKET_CAP_LABEL = 'coinmarketcap (' + COIN_MARKET_CAP_KEY + ')';

var grid = new contrib.grid({
  rows: 12,
  cols: 10,
  screen: screen
});

var configTable = function(label_, columnWidth_, isActive_) {
  return {
    keys: true,
    label: label_,
    columnSpacing: 1,
    selectedFg: isActive_ ? 'blue' : 'green',
    selectedBg: isActive_ ? 'green' : 'gray',
    columnWidth: columnWidth_
  };
};

var coinMarketCapTable = grid.set(
  0,
  0,
  6,
  9,
  contrib.table,
  configTable(COIN_MARKET_CAP_LABEL, [7, 7, 17, 12, 12, 12, 14], false)
);

var bitsoTable = grid.set(
  6,
  0,
  5,
  9,
  contrib.table,
  configTable(BITSO_LABEL, [9, 18, 18, 18, 18], true)
);

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.key([COIN_MARKET_CAP_KEY, BITSO_KEY], function(ch, key) {
  //allow control the table with the keyboard
  activeTable(ch);
});

bitsoTable.focus();

screen.on('resize', function(a) {
  coinMarketCapTable.emit('attach');
  bitsoTable.emit('attach');
});

var activeTable = function(keyboard) {
  coinMarketCapTable = grid.set(
    0,
    0,
    6,
    9,
    contrib.table,
    configTable(
      COIN_MARKET_CAP_LABEL,
      [7, 7, 17, 12, 12, 12, 14],
      keyboard == COIN_MARKET_CAP_KEY ? true : false
    )
  );

  bitsoTable = grid.set(
    6,
    0,
    5,
    9,
    contrib.table,
    configTable(BITSO_LABEL, [9, 18, 18, 18, 18], keyboard == BITSO_KEY ? true : false)
  );

  coinMarketCap.refreshTable(coinMarketCapTable);
  bitso.refreshTable(bitsoTable);

  if (keyboard == COIN_MARKET_CAP_KEY) {
    coinMarketCapTable.focus();
  } else if (keyboard == BITSO_KEY) {
    bitsoTable.focus();
  }
};

function init() {
  coinMarketCap = new monitor.MarketCoinCap(coinMarketCapTable); // no Windows supportD
  bitso = new monitor.Bitso(bitsoTable); // no Windows supportD
}

init();
