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
function getConnection(callback) {
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
 * Get an array of column names.
 *
 * @return {array}
 *   An array of the column names in the data table.
 */
function getColumnNames() {
  var dimensionIndex, columnNames = [];
  for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
    columnNames[dimensionIndex] = (config.mysql.columnPrefix + dimensionIndex);
  }
  return columnNames;
}

/**
 * Setup for testing with MySQL by creating a table and adding a bunch of
 * rows.
 */
module.exports.setup = function () {
  var connection, dimensionIndex;
  var columnNames = getColumnNames();

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
      var values = columnNames.map(function (columnName, index, array) {
        return '?';
      });

      var inserts = [];
      var groupedValues = [];
      var params = [];

      function createInsert() {
        inserts.push({
          query: 'insert into ' + mysql.escapeId(config.mysql.tableName) +
            ' (' + fields.join(', ') + ') values' + groupedValues.join(', '),
          params: params
        });
        groupedValues = [];
        params = [];
      }

      for (var rowIndex = 0; rowIndex < config.data.points; rowIndex++) {
        for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
          params.push(config.data.value());
        }
        groupedValues.push(' (' + values.join(', ') + ')');
        if (rowIndex && rowIndex % 40 === 0) {
          createInsert();
        }
      }
      if (groupedValues.length) {
        createInsert();
      }

      // This doesn't have to be particularly fast, so being lazy and not
      // batching the inserts.
      async.forEachSeries(inserts, function (insert, innerAsyncCallback) {
        connection.query(insert.query, insert.params, innerAsyncCallback);
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

/**
 * Run a nearest neighbor search in MySQL on the data created in the setup
 * method.
 *
 * This is technically a "near neighbor" search with a limit on how near "near"
 * happens to be. Further work has to be done to order what turns up in terms
 * of nearness.
 */
module.exports.run = function () {
  var time = Date.now();

  var dimensionIndex, connection, points;
  var point = [];
  var columnNames = getColumnNames();

  // Generate a random query point.
  for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
    point[dimensionIndex] = config.data.value();
  }

  // Construct a query. Lots of clauses. Take the form of:
  //
  // select * from nn where a > ? and a < ? and b > ? and b < ? and ...
  //
  // Essentially look for things in a volume around the point.
  //
  var query = 'select * from ' + mysql.escapeId(config.mysql.tableName) + 'where ';
  query += columnNames.map(function (columnName, index, array) {
    return mysql.escapeId(columnName) + ' > ? and ' +
      mysql.escapeId(columnName) + ' < ?';
  }).join(' and ');
  var params = [];
  for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
    var value = point[dimensionIndex];
    var min = value - config.mysql.range;
    var max = value + config.mysql.range;
    if (min < 0) {
      max = max - min;
      min = 0;
    }
    params.push(min);
    params.push(max);
  }

  // Run the query.
  var fns = {
    getConnection: function (asyncCallback) {
      getConnection(function (error, newConnection) {
        connection = newConnection;
        asyncCallback(error);
      });
    },
    runQuery: function (asyncCallback) {
      connection.query(query, params, function (error, loadedPoints) {
        points = loadedPoints || [];
        asyncCallback(error);
      });
    },
    closeConnection: function (asyncCallback) {
      connection.end(asyncCallback);
    }
  };

  async.series(fns, function (error) {
    if (error) {
      console.error('Error: ' + error);
    } else {
      // Called on completion, so figure out the elapsed time.
      var elapsed = Date.now() - time;
      var seconds = Math.floor(elapsed / 1000);
      var milliseconds = elapsed % 1000;
      console.log(
        'For ' + points.length + ' near neighbor' +
        ((points.length === 1) ? '' : 's') + ': ' +
        ((seconds) ? seconds + 's ' : '') + milliseconds + 'ms'
      );
    }
  });

};
