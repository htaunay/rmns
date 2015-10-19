#ifndef __SPHERE__
#define __SPHERE__

#include <vector>
#include <glm/vec3.hpp>

class Sphere
{
    public:
        Sphere(glm::vec3 center, double radius);

        double getRadius();
        void setRadius(double radius);

        glm::vec3 getCenter();
        void setCenter(glm::vec3 center);

        double distanceTo(glm::vec3 point);

    private:
        double _radius;
        glm::vec3 _center;
};

#endif

