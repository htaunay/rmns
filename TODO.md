# TODO

## Server

[ ] Test nearest sphere in velocity endpoint
[ ] Independent API (nearest, nearest visible, etc)
[ ] VisibilityHelper and Plane/CameraInfo redundant
[ ] In code TODOs
[ ] Repeated code in binding.cpp
[ ] Max/Min speed config
[ ] Remove points

[ ] Cubes
[ ] Code headers (description)
[ ] Async -> Parallelization
[ ] Fix speed vs velocity
[ ] Logging
[ ] Check is_vec3 and others in rmns.js
[ ] Number of spheres performance test
[ ] Open source license
[ ] Separate input/internal error msgs (400 from 500)

[ ] 80 col
[ ] Add point array to avoid re-building the kd-tree
[ ] check method case-conventions (oneTwo != one_two)
[ ] Count which objs (e.g. spheres) are correctly inserted, and give feedback
[ ] Coveralls
[ ] Dox: cpp implies everything 100% correct
[ ] Lots of error checking
[ ] Max points length per req
[ ] Option to locally load points
[ ] Performance tests (https://www.npmjs.com/package/loadtest)
[ ] Return object in msg when invalid
[ ] Syntastic Js
[ ] Valgrind

[x] Heuristc
[x] Config file
[x] Grid
[x] Time-stamping
[x] Travis CI
[x] Nearest visible point
[x] Route tests
[x] Define only once V8 strings
[x] Binding h/cpp

## Client Demo

[ ] Code headers
[ ] Better file loading convention, last blank line is ugly
[ ] Sub space inside planet atmospheres
[ ] Mini map
[ ] Skybox
[x] Planet labels with distance
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
