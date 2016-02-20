#include <rmns/Sphere.h>
#include <glm/geometric.hpp>

Sphere::Sphere(glm::vec3 center, double radius)
{
    _radius = radius;
    _center = center;
}

double Sphere::getRadius()
{
    return _radius;
}

void Sphere::setRadius(double radius)
{
    _radius = radius;
}

glm::vec3 Sphere::getCenter()
{
    return _center;
}

void Sphere::setCenter(glm::vec3 center)
{
    _center = center;
}

double Sphere::distanceTo(glm::vec3 point)
{
    double distance = glm::distance(_center, point) - _radius;

    // Clamp if inside sphere
    if(distance < 0) distance = 0;

    return distance;
}

