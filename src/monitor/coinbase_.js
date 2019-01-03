const axios = require('axios');
const colors = require('colors');

function CoinBase(table, apiName) {
  this.table = table;
  this.humanizeIsEnabled = true;

  var that = this;

  this.updater = function() {
    axios
      .get(that.sourceUrl)
      .then(function(response) {
        that.updateData(response.data);
      })
      .catch(function(error) {
        console.error(error + apiName + ' is not working now. Please try again later.'.red);
      });
  };

  this.setDataTable = function(data) {
    this.table.setData({
      headers: this.headers,
      data: data
    });

    if (this.isRefreshTable) {
      this.table.rows.select(this.rowSelected);
      this.isRefreshTable = false;
    }

    this.table.screen.render();
  };

  this.updater();

  this.interval = setInterval(this.updater, 3000);
}

CoinBase.prototype.refreshTable = function(table) {
  this.rowSelected = this.table.rows.selected;
  this.isRefreshTable = true;
  this.table = table;
  this.updater();
};

CoinBase.prototype.updateData = function(data) {
  //plese, replace this function in the child
};

module.exports = CoinBase;
