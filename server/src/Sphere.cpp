#include <rmns/Sphere.h>
#include <glm/geometric.hpp>

Sphere::Sphere(glm::vec3 center, double radius)
{
    _radius = radius;
    _center = center;
}

double Sphere::distanceTo(glm::vec3 point)
{
    return glm::distance(_center, point) - _radius;
}

