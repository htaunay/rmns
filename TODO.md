# TODO

## Server

[ ] Independent API (nearest, nearest visible, etc)
[ ] Check is_vec3 and others in rmns.js
[ ] Heuristc
[ ] Code headers (description)
[ ] VisibilityHelper and Plane/CameraInfo redundant
[ ] Async -> Parallelization
[ ] Cubes
[ ] Syntastic Js
[ ] Open source license
[ ] Repeated code in binding.cpp
[ ] Performance tests (https://www.npmjs.com/package/loadtest)
[ ] Number of spheres performance test
[ ] Separate input/internal error msgs (400 from 500)
[ ] Dox: cpp implies everything 100% correct
[ ] Logging
[ ] Return object in msg when invalid
[ ] Max points length per req
[ ] Lots of error checking
[ ] Fix speed vs velocity
[ ] Option to locally load points
[ ] Count which objs (e.g. spheres) are correctly inserted, and give feedback
[ ] 80 col
[ ] Add point array to avoid re-building the kd-tree
[ ] check method case-conventions (oneTwo != one_two)
[ ] Valgrind
[ ] Coveralls
[x] Config file
[x] Grid
[x] Time-stamping
[x] Travis CI
[x] Nearest visible point
[x] Route tests
[x] Define only once V8 strings
[x] Binding h/cpp

## Client Demo

[ ] Better file loading convention, last blank line is ugly
[ ] Sub space inside planet atmospheres
[ ] Mini map
[x] Planet labels with distance
[x] Invert Y/Z option
[x] Asteroid belt as point cloud
[x] Create HTTP module for all server communication
[x] Reset on start
[x] Solar System Demo

## Dox ideas

[ ] Known problem: async, every speed returns with a timestamp
[ ] Dynamic object ids
[ ] States
