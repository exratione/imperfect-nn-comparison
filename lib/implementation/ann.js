/**
 * @fileOverview
 * Code for testing the Approximate Nearest Neighbor package.
 *
 * See: http://www.cs.umd.edu/~mount/ANN/
 */

var childProcess = require('child_process');
var csv = require('csv');
var config = require('../../config');

module.exports = {};

/**
 * Return a CSV instance to write to a file.
 *
 * @param {string} filePath
 *   Absolute path to the file to write.
 * @return {object}
 *   A CSV instance.
 */
function getCsvInstance(filePath) {
  var csvInstance = csv();
  csvInstance.to.options({
    delimiter: '\t'
  }).to.path(filePath);
  csvInstance.on('error', function (error){
    console.error(error.message);
  });
  return csvInstance;
}

/**
 * Setup for testing with the ann_sample program by creating two files, one
 * listing the points and one with a single query point.
 */
module.exports.setup = function () {
  var csvInstance, point, pointIndex, dimensionIndex;

  // Set up the points file.
  csvInstance = getCsvInstance(config.ann.pointsFile);
  for (pointIndex = 0; pointIndex < config.data.points; pointIndex++) {
    point = [];
    for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
      point[dimensionIndex] = config.data.value();
    }
    csvInstance.write(point);
  }

  // Set up the single point in the query file.
  csvInstance = getCsvInstance(config.ann.queryPointsFile);
  point = [];
  for (dimensionIndex = 0; dimensionIndex < config.data.dimensions; dimensionIndex++) {
    point[dimensionIndex] = config.data.value();
  }
  csvInstance.write(point);
};

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
    ' -nn ' + config.ann.numberOfNeighbors + ' -df ' + config.ann.pointsFile +
    ' -qf ' + config.ann.queryPointsFile +
    ' > /dev/null';
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
        ((seconds) ? seconds + 's' : '') + milliseconds + 'ms'
      );
    }
  });
};
