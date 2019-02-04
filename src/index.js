#!/usr/bin/env node

const blessed = require('blessed');
const contrib = require('blessed-contrib');
const monitor = require('./monitor');
const constants = require('./utils/constants.js');

let bitso, coinMarketCap;
var screen = blessed.screen();
var grid = new contrib.grid({
  rows: 12,
  cols: 10,
  screen: screen
});

let configTable = (label, columnWidth, isActive_) => {
  return {
    keys: true,
    label,
    columnSpacing: 1,
    selectedFg: isActive_ ? 'blue' : 'green',
    selectedBg: isActive_ ? 'green' : 'gray',
    columnWidth
  };
};

screen.key(['escape', 'q', 'C-c'], (ch, key) => {
  return process.exit(0);
});

screen.key([constants.COIN_MARKET_CAP_KEY, constants.BITSO_KEY], (ch, key) => {
  //allow control the table with the keyboard
  activeTable(ch);
});

screen.on('resize', a => {
  coinMarketCap.table.emit('attach');
  bitso.table.emit('attach');
});

let createBitsoTable = keyboard => {
  return genericCreateTable(
    keyboard,
    6,
    0,
    5,
    9,
    constants.BITSO_LABEL,
    [9, 18, 18, 18, 18],
    constants.BITSO_KEY
  );
};

let createCoinMarketCapTable = keyboard => {
  return genericCreateTable(
    keyboard,
    0,
    0,
    6,
    9,
    constants.COIN_MARKET_CAP_LABEL,
    [7, 7, 17, 12, 12, 12, 14],
    constants.COIN_MARKET_CAP_KEY
  );
};

let genericCreateTable = (keyboard, h, i, x, y, label, columns, key) => {
  return grid.set(
    h,
    i,
    x,
    y,
    contrib.table,
    configTable(label, columns, keyboard == key ? true : false)
  );
};

var activeTable = keyboard => {
  coinMarketCap.refreshTable(keyboard);
  bitso.refreshTable(keyboard);

  switch (keyboard) {
    case constants.COIN_MARKET_CAP_KEY:
      coinMarketCap.getFocus();
      break;
    case constants.BITSO_KEY:
      bitso.getFocus();
      break;
    default:
  }
};

coinMarketCap = new monitor.MarketCoinCap(createCoinMarketCapTable); // no Windows supportD
bitso = new monitor.Bitso(createBitsoTable); // no Windows supportD
bitso.getFocus();
