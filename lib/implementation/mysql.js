/**
 * @fileOverview
 * Code for testing the Approximate Nearest Neighbor package.
 *
 * See: http://www.cs.umd.edu/~mount/ANN/
 */

var async = require('async');
var mysql = require('mysql');
var config = require('../../config');

module.exports = {};


/**
 * Obtain a MySQL connection.
 *
 * @param  {Function} callback
 *   Of the form function (error, connection).
 */
function getConnection (callback) {
  var connection = mysql.createConnection({
    host: config.mysql.host,
    port: config.mysql.port,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database
  });
  connection.connect(function (error) {
    callback(error, connection);
  });
}

/**
 * Setup for testing with MySQL by creating a table and adding a bunch of
 * rows.
 */
module.exports.setup = function () {
  var connection, dimensionIndex;

  var columnNames = [];
  for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
    columnNames.push(config.mysql.columnPrefix + dimensionIndex);
  }

  var fns = {
    getConnection: function (asyncCallback) {
      getConnection(function (error, newConnection) {
        connection = newConnection;
        asyncCallback(error);
      });
    },
    dropTable: function (asyncCallback) {
      var query = 'drop table if exists ' + mysql.escapeId(config.mysql.tableName);
      connection.query(query, [], asyncCallback);
    },
    createTable: function (asyncCallback) {
      var params = [config.mysql.tablename];
      params.concat(columnNames.slice(0));
      var fields = columnNames.map(function (columnName, index, array) {
        return mysql.escapeId(columnName) + ' float not null';
      });
      fields.concat(columnNames.map(function (columnName, index, array) {
        return mysql.escapeId(columnName + 'idx') + '(' + mysql.escapeId(columnName) + ')';
      }));
      var query = 'create table ' + mysql.escapeId(config.mysql.tableName) + ' (' + fields.join(',') + ')';
      connection.query(query, [], asyncCallback);
    },
    insertRows: function (asyncCallback) {
      var fields = columnNames.map(function (columnName, index, array) {
        return mysql.escapeId(columnName);
      });
      var inserts = columnNames.map(function (columnName, index, array) {
        return '?';
      });

      var rows = [];
      for (var rowIndex = 0; rowIndex < config.data.points; rowIndex++) {
        var params = [];
        for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
          params[dimensionIndex] = config.data.value();
        }
        rows.push({
          query: 'insert into ' + mysql.escapeId(config.mysql.tableName) +
            ' (' + fields.join(', ') + ') values (' + inserts.join(', ') + ')',
          params: params
        });
      }
      // This doesn't have to be particularly fast, so being lazy and not
      // batching the inserts.
      async.forEachSeries(rows, function (row, innerAsyncCallback) {
        connection.query(row.query, row.params, innerAsyncCallback);
      }, asyncCallback);
    },
    closeConnection: function (asyncCallback) {
      connection.end(asyncCallback);
    }
  };

  async.series(fns, function (error) {
    if (error) {
      console.error('Error: ' + error);
    } else {
      console.log('Setup completed.');
    }
  });
};

module.exports.run = function () {



};
