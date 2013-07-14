/**
 * @fileOverview
 * Code for testing the Approximate Nearest Neighbor package.
 *
 * See: http://www.cs.umd.edu/~mount/ANN/
 */

var childProcess = require('child_process');
var fs = require('fs');
var config = require('../../config');

module.exports = {};

/**
 * Setup for testing with the ann_sample program by creating two files, one
 * listing the points and one with a single query point.
 */
module.exports.setup = function () {
  var out, point, pointIndex, dimensionIndex;

  // Set up the points file.
  out = fs.createWriteStream(config.ann.pointsFile);
  for (pointIndex = 0; pointIndex < config.data.points; pointIndex++) {
    point = [];
    for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
      point[dimensionIndex] = config.data.value();
    }
    out.write(point.join('\t') + '\n');
    // Keep things flowing by closing and opening another stream - very slow
    // for large amounts of data without that.
    if (pointIndex % 10000 === 0) {
      out.end();
      out = fs.createWriteStream(config.ann.pointsFile, { flags: 'a' });
    }
  }
  out.end();

  // Set up the single point in the query file.
  out = fs.createWriteStream(config.ann.queryPointsFile);
  point = [];
  for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
    point[dimensionIndex] = config.data.value();
  }
  out.write(point.join('\t') + '\n');
  out.end();
};

/**
 * Run a nearest neighbor search via ANN on the data created in the setup
 * method.
 */
module.exports.run = function () {
  // To specify 20 dimensions and to get 1 approximate nearest neighbor:
  //
  // ann_sample -d 20 -nn 1 -df /tmp/points.pts -qf /tmp/query.pts > dev/null
  //
  // This prints out all of the points fed to it, so better to send that all to
  // /dev/null than port it back to Node.js. We just care about the elapsed
  // time.
  var time = Date.now();
  var command = config.ann.binPath + 'ann_sample -d ' + config.data.dimensions +
    ' -max ' + config.data.points +
    ' -nn ' + config.ann.numberOfNeighbors + ' -df ' + config.ann.pointsFile +
    ' -qf ' + config.ann.queryPointsFile +
    ' > /dev/null';
  console.log('Running: ' + command);
  var child = childProcess.exec(command, {
    env: process.env
  }, function (error, stdout, stderr) {
    // Called on completion, so figure out the elapsed time.
    var elapsed = Date.now() - time;
    var seconds = Math.floor(elapsed / 1000);
    var milliseconds = elapsed % 1000;
    if (stderr) {
      console.error('Error return: ' + stderr);
    } else {
      console.log(
        'For ' + config.ann.numberOfNeighbors + ' nearest neighbor' +
        ((config.ann.numberOfNeighbors === 1) ? '' : 's') + ': ' +
        ((seconds) ? seconds + 's ' : '') + milliseconds + 'ms'
      );
    }
  });
};
