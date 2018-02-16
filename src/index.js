#!/usr/bin/env node
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const monitor = require('./monitor');
const screen = blessed.screen();

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
  configTable('coinmarketcap (z)', [7, 7, 17, 12, 12, 12, 14], false)
);

var bitsoTable = grid.set(
  6,
  0,
  5,
  9,
  contrib.table,
  configTable('bitso (y)', [9, 18, 18, 18, 18], true)
);

screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

screen.key(['z', 'y'], function(ch, key) {
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
      'coinmarketcap (z)',
      [7, 7, 17, 12, 12, 12, 14],
      keyboard == 'z' ? true : false
    )
  );

  bitsoTable = grid.set(
    6,
    0,
    5,
    9,
    contrib.table,
    configTable(
      'bitso (y)',
      [9, 18, 18, 18, 18],
      keyboard == 'y' ? true : false
    )
  );

  init();

  if (keyboard == 'z') {
    coinMarketCapTable.focus();
  } else if (keyboard == 'y') {
    bitsoTable.focus();
  }
};

function init() {
  new monitor.MarketCoinCap(coinMarketCapTable); // no Windows supportD
  new monitor.Bitso(bitsoTable); // no Windows supportD
}

init();
