#ifndef __SPHERE__
#define __SPHERE__

#include <vector>
#include <glm/vec3.hpp>

class Sphere
{
    public:
        Sphere(glm::vec3 center, double radius);

        double distanceTo(glm::vec3 point);
    private:
        double _radius;
        glm::vec3 _center;
};

#endif

