#include <rmns/Plane.h>
#include <glm/geometric.hpp>

Plane::Plane(glm::vec3 p1, glm::vec3 p2, glm::vec3 p3)
{
    glm::vec3 v = p2 - p1;
    glm::vec3 u = p3 - p1;

    glm::vec3 n = glm::cross(v, u);
    n = glm::normalize(n);

    a = n.x;
    b = n.y;
    c = n.z;
    d = glm::dot(-n, p1);
}

float Plane::distance(glm::vec3 p)
{
    return a * p.x + b * p.y + c * p.z + d;
}
