#ifndef __SPEED_CALCULATOR__
#define __SPEED_CALCULATOR__

#include <vector>
#include <glm/vec3.hpp>
#include <spatial/point_multiset.hpp>
#include <spatial/neighbor_iterator.hpp>

#include <rmns/Sphere.h>

class SpeedCalculator
{
    public:
        SpeedCalculator();

        bool reset();
        int count();

        bool add_point(glm::vec3 point);
        bool add_points(std::vector<glm::vec3> points);
        bool add_sphere(glm::vec3 center, double radius);
        bool velocity(glm::vec3 pos, glm::vec3& nearest, double& speed);

    private:
        typedef spatial::point_multiset<3, glm::vec3> Vec3Spatial;
        typedef spatial::neighbor_iterator<Vec3Spatial> Iterator;
        Vec3Spatial* _spatialStructure;

        std::vector<Sphere*> _spheres;
};

#endif
