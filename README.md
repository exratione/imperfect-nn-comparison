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

MySQL
-----

You can perform a constrained search for nearest neighbors in SQL by building
an indexed table for your data, one row per point, one column per dimension.

You should probably turn off the MySQL query cache before trying this to avoid
potentially misleading results.

Notes
-----

These are not apple-to-apple comparisons. The form of the searchers are slightly
different, and data is loaded from disk versus already in memory to different
degrees.
