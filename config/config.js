/**
 * @fileOverview
 * Configuration for the nnComparison tool.
 */

module.exports = {
  ann: {
    // Path to the points file that is created / used.
    pointsFile: '/tmp/points.csv',
    // Path to the query points file that is created / used.
    queryFile: '/tmp/query.csv',
    // Path to ANN binaries. If already in the path, use "./"
    binPath: './'
  },
  data: {
    dimensions: 20,
    rows: 10,
    // Called for the value of each dimension for each point.
    value: function () {
      return (10000 + (Math.random() * 10000));
    }
  },
  mysql: {
    tableName: 'nn',
    columnPrefix: 'nn'
  }
};
