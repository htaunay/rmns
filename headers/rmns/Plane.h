#ifndef __PLANE__
#define __PLANE__

#include <glm/vec3.hpp>

class Plane
{
    public:
        Plane(glm::vec3 p1, glm::vec3 p2, glm::vec3 p3);

        float distance(glm::vec3 p);

    private:
        float a;
        float b;
        float c;
        float d;
};

#endif

