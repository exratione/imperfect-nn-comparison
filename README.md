Imperfect Nearest Neighbor Comparison
=====================================

This package contains some tools written while comparing different approaches
to finding nearest neighbor points in a large dataset. It speeds up the process
of generating data sets and then running nearest neighbor searches.

The approaches presently compared:

ANN
---

The approximate nearest neighbor (ANN) package is a C++ library. Here we're
using a sample program that comes with the library distribution to run searches.
See:

http://www.cs.umd.edu/~mount/ANN/

What does this do: it finds the nearest N neighbors to a designated point,
approximately, in order of distance. It supposedly doesn't do well above about
20 dimensions.

To setup and run, edit /config/config.js for dimensions and number of rows,
then:

    node imperfect-nn-comparison ann setup
    node imperfect-nn-comparison ann run

MySQL With Indexed Columns
--------------------------

You can perform a constrained search for nearest neighbors in SQL by building
an indexed table for your data, one row per point, one column per dimension.

You should probably turn off the MySQL query cache before trying this to avoid
potentially misleading results.

What does this do? It looks for all neighbors within a volume around the
designated point. So it doesn't specifically find the nearest wherever it might
be, nor does it order those it does find.

Not that ordering would be hard once you have the results. The hard part is
how to know how big the volume should be, since you have to process all the
results from the volume to figure out which are the nearest. This is very
dependent on the nature of the data.

To setup and run, edit /config/config.js for dimensions and number of rows,
then:

    node imperfect-nn-comparison mysql setup
    node imperfect-nn-comparison mysql run

Notes
-----

These are obviously not apples-to-apples comparisons. The searches are of
different forms and data is moved around in different ways: on disk, in memory,
and so forth. The sample ANN program reads in data from a file and builds all
of its data structures from scratch for each test, while MySQL is using some
mix of file system and memory for its data and has already built its indexes
before the test is run.

High Level Results
------------------

I ran some non-rigorous experiments on a small Digital Ocean virtual SSD drive
server with 2G RAM and two CPUs. These notes are here for the purpose of
steering expectations, and shouldn't be taken as being in any way accurate.

For 20 dimensions and 10,000 rows:

ANN: ~450-500ms to find 10 nearest neighbors. The time taken doesn't have much
of a dependency on the number of nearest neighbors requested.

MySQL: ~40-100ms to find 0-500 close neighbors. Returning more results takes
longer, but that's expected with a SQL client: it's looking at more indexes as
the search volume is made larger.

For 20 dimensions and 100,000 rows:

ANN: ~4600-5000ms to find 10 nearest neighbors.

MySQL: ~140-200ms to find 0-500 close neighbors. Returning more results takes
longer, as before.

For 20 dimensions and 1,000,000 rows:

ANN: ~50000-60000ms to find 10 nearest neighbors.

MySQL: ~900-1100ms to find 0-500 close neighbors. Returning more results takes
longer, as before.
