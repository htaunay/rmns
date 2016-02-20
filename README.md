[![Build Status](https://travis-ci.org/htaunay/rmns.svg?branch=master)](https://travis-ci.org/htaunay/rmns)
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

## Starting the server

TODO

## Consuming the service

TODO

## Configurations

TODO

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

