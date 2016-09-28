[![Build Status](https://travis-ci.org/htaunay/rmns.svg?branch=master)](https://travis-ci.org/htaunay/rmns)
[![Coverage Status](https://coveralls.io/repos/github/htaunay/rmns/badge.svg?branch=master)](https://coveralls.io/github/htaunay/rmns?branch=master)
[![View this project on NPM](https://img.shields.io/npm/v/rmns.svg)](https://npmjs.org/package/qtester)
[![Join the chat at https://gitter.im/htaunay/rmns](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/htaunay/rmns?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
<!--[![Coverage Status](https://coveralls.io/repos/htaunay/rmns/badge.svg?branch=master&service=github)](https://coveralls.io/github/htaunay/rmns?branch=master) -->

# rmns

Remote Multiscale Navigation System

## The Problem

Freely navigating in a 3D virtual environment can prove to be problematic,
even for the most experienced users[1], and
possibly deal-breaking for laymen, especially when dealing with massive
multiscale scenes. Some systems are able to tackle such scenarios more easily
given their nature (e.g., examine focused applications, an exocentric
interaction technique where the user can orbit and zoom in/out around a point
of interest); however others that demand more navigation freedom (e.g., fly,
an egocentric interaction technique) are more susceptible to user errors.

The problem of egocentric multiscale navigation has been tackled previously
from mainly two distinct approaches: level of scale (LoS) based solutions, and
automatic speed adjustment solutions. In LoS based solutions, the virtual
environment surrounding the camera --- or avatar --- grows/shrinks according
to user input[2] (i.e., a navigation with seven
degrees of freedom (7DOF)); alternatively, the user can transit in and out
from predefined discrete layers of scale[3]. The solution
presented in this work follows the second approach, i.e. automatic speed
adjustment, using the closest geometry position as input to heuristics that
determine the optimal navigation speed at any given moment.

Examples of this last approach used an image-based environment representation
named *cubemap*[4][5]. Given the camera position, the cubemap is
constructed from 6 rendering passes, each in a different direction in order to
cover the whole environment. Targeting a more fluid navigation experience
(i.e., without discrete scene scale layers or manual scale adjustment) with
six degrees of freedom (6DOF), the cubemap technique is used to obtain an
automatic speed adjustment for the scenario, which has proved to be an
effective multiscale interaction technique solution.

However, recently a new limitation has arisen: the render bottleneck. As
virtual environment scenes grow in detail and complexity, despite the fast
improvements in modern hardware, rendering six screens per frame is a
GPU-intensive operation and can become unfeasible given the scenario.

## The Solution

Following the motivation of eliminating such extra render steps, we propose a
CPU based solution where the virtual environment's geometries are stored in a
*k*-d tree[6]. This structure is used to obtain the nearest
objects --- visible as well as non-visible --- allowing the application of a
similar but revisited heuristic used in the cubemap solution.

With this project, we introduce **rmns**, an isolated and language agnostic
tool that offers the optimal navigation speed heuristic feature as a service,
while also allowing such solution to be scaled with ease.

The **rmns** is a service made for defining an ideal velocity for navigation
in 3D multiscale scenes. It bases itself on a heuristic that a optimal
navigation velocity is relative to the closest object to the camera in any
given moment. On top of that, their are a number of improvements and
adjustments to the heuristic, such as taking into account the nearest visible
object to influence the navigation's acceleration, as well as offering
optimizations such as reducing the total number of points in the scene with a
regular and normalized point grid.

This project was inspired by the "A spatial partitioning heuristic for
automatic-adjustment of the 3D navigation speed in a multiscale virtual
environment"[7] paper, and more information can be found there.

## Starting the service

The straight forward way to start-up a service is through npm and using the
default configurations (found at `config/stand-alone.json`):

```bash
# Install rmns globally
npm install -g rmns

# Start the server
rmns

# You can also specify a configuration file
rmns /my/config/file.json
```
In case you want to customize any configuration, take a
look at its [section](#configurations).

To start-up a server from the source, just follow these steps:

```bash
# Clone the repo
git clone git@github.com:htaunay/rmns.git

# Install dependencies and build C++ code
npm install
npm run-script build

# Just to be safe, make sure all tests are OK
npm test

# Initialize the server
npm start
```

### Dependencies

This project depends on a Node.js version later than 0.12.0, and on gcc and
[node-gyp](https://github.com/nodejs/node-gyp) for the C++ binding.

## Consuming the service

All requests are made through HTTP requests, with a JSON body when necessary.
Here is the latest API, along usage examples taking into account a local server
running at the port 8081:

### Points

The `/points` endpoint is for registering 3d points in the server's **k**-d tree.
The data structure should consist of an array, with a number of elements
multiple of three, otherwise an error will be returned. There is no size limit
imposed by the service to the number of points in a single request, the limit
is implicit by the max size of the HTTP request and possibly the JS compiler.

Example:

```bash
# Register two points: p1 = vec3(0,1,2), p2 = vec3(0.1,0.2,0.3)
curl -XPOST -H "Content-type: application/json" -d "[0,1,2,0.1,0.2,0.3]" localhost:8081/points
```

### Spheres

The `/spheres` endpoint is for registering sphere objects in the service. Every
sphere must have and ID, since it offers the possibility of being updated.
An sphere object consists of a vec3 representing its center, and a float value
representing its radius, plus the id.
The data structure should consist of an array, where each element is an key/value
object.

Example:

```bash
# Register two spheres: s1 = center(5,5,5) and radius = 2, s2 = center(-0.5,0,0.5) and radius = 100
curl -XPOST -H "Content-type: application/json" -d "[
    {
        'id': 1,
        'radius': 2.0,
        'center': {'x': 5, 'y': 5, 'z': 5}
    },
    {
        'id': 2,
        'radius': 100.0,
        'center': {'x': -0.5, 'y': 0, 'z': 0.5}
    },
]" localhost:8081/spheres
```

### Velocity

The `velocity` endpoint uses the nearest point and sphere information, visible
and global, and applies it to an heuristic in order to determine the optimal
velocity of navigation given a scene's state and camera's position. This method
as uses as input pre-defined values specified at the service's configuration
file.

Example:

```bash
# Get optimal speed given current camera state
curl -XPOST -H "Content-type: application/json" -d "{
    'eye': {'x': 0, 'y': 0, 'z': 0},
    'center': {'x': 0, 'y': 0, 'z': -5},
    'up': {'x': 0, 'y': 1, 'z': 0},
    'fovy': 60.0,
    'aspect': 1.66,
    'znear': 1,
    'zfar': 1000
}" localhost:8081/velocity
```

### Stats

The `/stats` endpoint returns the current number of points and spheres already
registered in the server. The `/stats` endpoints takes no input.

Example:

```bash
curl localhost:8081/stats
```

### Reset

The `/reset` endpoint clears all data already registeredi, returning the server
to its initial state. The `/reset` endpoints takes no input.

Example:

```bash
curl localhost:8081/reset
```

### Nearest Point

The `/nearest_point` endpoint returns the closest point in the **k**-d tree to
a given point object. There is also the `nearest_vpoint` endpoint, that as the
velocity endpoint, it takes a camera's state information as input.

Example:

```bash
# Get nearest point to vec3(5,6,7)
curl -XPOST -H "Content-type: application/json" -d "{'eye': {'x': 5, 'y': 6, 'z': 7}}" localhost:8081/nearest_point

# Get nearest visible point
curl -XPOST -H "Content-type: application/json" -d "{
    'eye': {'x': 5, 'y': 6, 'z': 7},
    'center': {'x': 0, 'y': 0, 'z': -5},
    'up': {'x': 0, 'y': 1, 'z': 0},
    'fovy': 60.0,
    'aspect': 1.66,
    'znear': 1,
    'zfar': 1000
}" localhost:8081/nearest_vpoint
```

### Nearest Sphere

The `/nearest_sphere` endpoint returns the closest sphere already registered to
a given point object. There is also the `nearest_vsphere` endpoint, that as the
velocity endpoint, it takes a camera's state information as input.

Example:

```bash
# Get nearest sphere to vec3(5,6,7)
curl -XPOST -H "Content-type: application/json" -d "{'eye': {'x': 5, 'y': 6, 'z': 7}}" localhost:8081/nearest_sphere

# Get nearest visible sphere
curl -XPOST -H "Content-type: application/json" -d "{
    'eye': {'x': 5, 'y': 6, 'z': 7},
    'center': {'x': 0, 'y': 0, 'z': -5},
    'up': {'x': 0, 'y': 1, 'z': 0},
    'fovy': 60.0,
    'aspect': 1.66,
    'znear': 1,
    'zfar': 1000
}" localhost:8081/nearest_vsphere
```

## Configurations

All server configurations must be made in a JSON file inside the `config` folder
at the project's root. By default, the `stand-alone.json` file is used, but this
can be configured by using the `NODE_ENV` environment variable. For example, if
defined `NODE_ENV=master`, the server will try to load the `master.json` file
from the `config` folder.

A current config file for a stand-alone server contains the following variables:

```js
{
    // Port number to run service
    "port": "8081",
    // Scale for fovy angle to use in visible search, 1.0 will keep default angle
    "visible_fovy": 0.75,
    // Trigger preprocessing optimization for joining close points
    "activate_grid": false,
    // Cell side size to be used during pre-processingi, only used if "activate_grid" is true
    "cell_size": 1.0,
    // Multiplier to be applied over final speed result on the "/velocity" endpoint
    "velocity_multiplier": 1.0,
    // Only set to true if you wish to work with slave servers (see next example)
    "is_master": false
}
```

Now the distributed example, pointing to slaves running on ports 8082 and 8083.
In this example, the server on 8083 is reponsabile for the visible point endpoint,
while server 8082 is responsabile for the remaining nearest endpoints:

```js
{
    "port": "8081",
    "visible_fovy": 0.75,
    "activate_grid": false,
    "cell_size": 1.0,
    "velocity_multiplier": 1.0,
    "is_master": true,
    "slaves": {
        "/stats": {
            "ip": "127.0.0.1",
            "port": "8082"
        },
        "/points": [
            {
                "ip": "127.0.0.1",
                "port": "8082"
            },
            {
                "ip": "127.0.0.1",
                "port": "8083"
            }
        ],
        "/spheres": {
            "ip": "127.0.0.1",
            "port": "8082"
        },
        "/reset": [
            {
                "ip": "127.0.0.1",
                "port": "8082"
            },
            {
                "ip": "127.0.0.1",
                "port": "8083"
            }
        ],
        "/nearest_point": {
            "ip": "127.0.0.1",
            "port": "8082"
        },
        "/nearest_vpoint": {
            "ip": "127.0.0.1",
            "port": "8083"
        },
        "/nearest_object": {
            "ip": "127.0.0.1",
            "port": "8082"
        },
        "/nearest_vobject": {
            "ip": "127.0.0.1",
            "port": "8082"
        }
    }
}
```

## References

[1] FITZMAURICE, G. W.; MATEJKA, J.; MORDATCH, I.; KHAN, A. ; KURTENBACH,
G.. **Safe 3D navigation**. In: Haines, E.; McGuire, M., editors,
SI3D, p. 7{15. ACM, 2008.

[2] ZHANG, **X.. Multiscale traveling: crossing the boundary between space
and scale**. Virtual Reality, 13(2):101{115, 2009.

[3] KOPPER, R.; NI, T.; BOWMAN, D. A. ; PINHO, M.. **Design and evaluation
of navigation techniques for multiscale virtual environments**. In: VR '06:
PROCEEDINGS OF THE IEEE VIRTUAL REALITY CONFERENCE (VR
2006), p. 24, Washington, DC, USA, 2006. IEEE Computer Society.

[4] MCCRAE, J.; MORDATCH, I.; GLUECK, M. ; KHAN, A.. **Multiscale
3d navigation**. In: PROCEEDINGS OF THE 2009 SYMPOSIUM ON
INTERACTIVE 3D GRAPHICS AND GAMES, I3D '09, p. 7{14, New York,
NY, USA, 2009. ACM.

[5] TRINDADE, D.; RAPOSO, A.. **Improving 3D navigation techniques in
multiscale environments: a cubemap-based approach**. Multimedia Tools
and Applications, 73(2):939{959, 2014.

[6] BENTLEY, J. L.. **Multidimensional binary search trees used for associative
searching**. Communications of the ACM, 18(9):509{517, Sept. 1975.

[7] H. Taunay, V. Rodrigues, R. Braga, P. Elias, L. Reis, and A. Raposo.
**A Spatial Partitioning Heuristic for Automatic Adjustment of the
3D Navigation Speed in Multiscale Virtual Environments**. In IEEE
Symposium on 3D User Interfaces (3DUI), pages 51–58, 2015.

