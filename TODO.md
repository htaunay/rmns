# TODO

## Server

[ ] Independent API (nearest, nearest visible, etc)
[ ] Heuristc
[ ] Code headers (description)
[ ] Async -> Parallelization
[ ] Grid
[ ] Cubes
[ ] Repeated code in binding.cpp
[ ] Performance tests (https://www.npmjs.com/package/loadtest)
[ ] Separate input/internal error msgs (400 from 500)
[ ] Dox: cpp implies everything 100% correct
[ ] Config file
[ ] Logging
[ ] Time-stamping
[ ] Return object in msg when invalid
[ ] Max points length per req
[ ] In code TODOs
[ ] Lots of error checking
[ ] Fix speed vs velocity
[ ] Option to locally load points
[ ] Count which objs (e.g. spheres) are correctly inserted, and give feedback
[ ] 80 col
[ ] Test nearest sphere in velocity endpoint
[ ] Add point array to avoid re-building the kd-tree
[ ] check method case-conventions (oneTwo != one_two)
[ ] Valgrind
[ ] Coveralls
[x] Travis CI
[x] Nearest visible point
[x] Route tests
[x] Define only once V8 strings
[x] Binding h/cpp

## Client Demo

[ ] Code headers
[ ] Better file loading convention, last blank line is ugly
[ ] Planet labels with distance
[ ] Sub space inside planet atmospheres
[ ] Mini map
[x] Invert Y/Z option
[x] Asteroid belt as point cloud
[x] Create HTTP module for all server communication
[x] Reset on start
[x] Solar System Demo

## Dox ideas

[ ] Known problem: async, every speed returns with a time-stamp
[ ] Dynamic object ids
[ ] States
[ ] velocity endpoint is a convenience (Promise may delay), you can access directly the endpoints themselves

## Targets

[ ] Remote service
[ ] Remote parallel service
[ ] Remote parallel service with LoD
