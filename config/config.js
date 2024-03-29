/**
 * @fileOverview
 * Configuration for the nnComparison tool.
 */

module.exports = {
  ann: {
    // Path to ANN binaries. If already in the path, use ''.
    binPath: '',
    // How many of the nearest neighbors to find.
    numberOfNeighbors: 10,
    // Path to the points file that is created / used.
    pointsFile: '/tmp/points.pts',
    // Path to the query points file that is created / used.
    queryPointsFile: '/tmp/query.pts'
  },
  data: {
    dimensions: 20,
    points: 10000,
    // Called for the value of each dimension for each point.
    value: function () {
      return Math.random();
    }
  },
  mysql: {
    // Used to figure out how large a net to cast when looking for near
    // neighbors. A near neighbor must have every dimension within [range] of
    // the search point. This is absolute, so scale it by whatever the maximum
    // value for the dimensions.
    range: 0.35,
    // Determining the names of what we're setting up.
    columnPrefix: 'nn',
    tableName: 'nn',
    // Connection info.
    host: '127.0.0.1',
    port: 3306,
    database: 'test',
    // Assume root user, no password.
    user: 'root',
    password: undefined
  }
};
