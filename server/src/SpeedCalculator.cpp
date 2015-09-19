#include <rmns/SpeedCalculator.h>

SpeedCalculator::SpeedCalculator()
{
    _isRunning = false;
    _spatialStructure = new Vec3Spatial();
}

bool SpeedCalculator::reset()
{
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
