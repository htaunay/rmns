#include <rmns/SpeedCalculator.h>

SpeedCalculator::SpeedCalculator()
{
    _spatialStructure = new Vec3Spatial();
}

bool SpeedCalculator::reset()
{
    _spheres.clear();
    _spatialStructure->clear();
    return true;
}

int SpeedCalculator::count()
{
    return _spatialStructure->count();
}

bool SpeedCalculator::add_point(glm::vec3 point)
{
    _spatialStructure->insert(point);
    return true;
}

bool SpeedCalculator::add_points(std::vector<glm::vec3> points)
{
    _spatialStructure->insert(points.begin(), points.end());
    return true;
}

bool SpeedCalculator::add_sphere(glm::vec3 center, double radius)
{
    Sphere* sphere = new Sphere(center, radius);
    _spheres.push_back(sphere);
    return true;
}

bool SpeedCalculator::velocity(glm::vec3 pos, glm::vec3& nearest, double& speed)
{
    Iterator iter = spatial::neighbor_begin(*_spatialStructure, pos);
    if(iter == _spatialStructure->end())
    {
        nearest = glm::vec3(0,0,0);
        speed = 0;
        return false;
    }

    speed = iter.distance();
    nearest = *iter;
    return true;
}
