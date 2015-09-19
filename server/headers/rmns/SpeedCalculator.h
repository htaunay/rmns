#ifndef __SPEED_CALCULATOR__
#define __SPEED_CALCULATOR__

#include <vector>
#include <glm/vec3.hpp>
#include <spatial/point_multiset.hpp>

class SpeedCalculator
{
    public:
        SpeedCalculator();

        bool reset();
        int count();

        bool add_point(glm::vec3 point);
        bool add_points(std::vector<glm::vec3> points);

    private:
        bool _isRunning;
        typedef spatial::point_multiset<3, glm::vec3> Vec3Spatial;
        Vec3Spatial* _spatialStructure;
};

#endif
