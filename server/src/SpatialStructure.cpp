#include <rmns/SpatialStructure.h>
#include <cfloat>
#include <glm/geometric.hpp>

SpatialStructure::SpatialStructure()
{
    _spatialStructure = new Vec3Spatial();
}

bool SpatialStructure::reset()
{
    _spheres.clear();
    _spatialStructure->clear();
    return true;
}

int SpatialStructure::count_points()
{
    return _spatialStructure->count();
}

int SpatialStructure::count_spheres()
{
    return _spheres.size();
}

bool SpatialStructure::add_point(glm::vec3 point)
{
    _spatialStructure->insert(point);
    return true;
}

bool SpatialStructure::add_points(std::vector<glm::vec3> points)
{
    _spatialStructure->insert(points.begin(), points.end());
    return true;
}

bool SpatialStructure::update_sphere(int id, glm::vec3 center, double radius)
{
    if(_spheres.count(id) == 0)
    {
        Sphere* sphere = new Sphere(center, radius);
        _spheres[id] = sphere;
    }
    else
    {
       _spheres[id]->setCenter(center);
       _spheres[id]->setRadius(radius);
    }

    // TODO cehck return false

    return true;
}

bool SpatialStructure::velocity(glm::vec3 pos, glm::vec3& nearest, double& speed)
{
    glm::vec3 n_point, n_sphere;
    float d_point, d_sphere;

    nearest_point(pos, n_point, d_point);
    nearest_sphere(pos, n_sphere, d_sphere);

    if(d_point != 0 && d_point < d_sphere)
    {
        nearest = n_point;
        speed = d_point;
    }
    else
    {
        nearest = n_sphere;
        speed = d_sphere;
    }

    // TODO check for return false

    return true;
}

void SpatialStructure::nearest_point(glm::vec3 pos, glm::vec3& nearest, float& distance)
{
    Iterator iter = spatial::neighbor_begin(*_spatialStructure, pos);
    if(iter == _spatialStructure->end())
    {
        nearest = glm::vec3(0,0,0);
        distance = 0;
        return;
    }

    distance = iter.distance();
    nearest = *iter;
}

void SpatialStructure::nearest_vpoint(glm::vec3 pos, glm::vec3& nearest, float& distance)
{
    Iterator iter = spatial::neighbor_begin(*_spatialStructure, pos);
    if(iter == _spatialStructure->end())
    {
        nearest = glm::vec3(0,0,0);
        distance = 0;
        return;
    }

    distance = iter.distance();
    nearest = *iter;
}

void SpatialStructure::nearest_sphere(glm::vec3 pos, glm::vec3& nearest, float& distance)
{
    Sphere* sphere = new Sphere(glm::vec3(0,0,0), 0);
    float minDistance = FLT_MAX;


    for(sphere_it it = _spheres.begin(); it != _spheres.end(); it++)
    {
        Sphere* currentSphere = it->second;
        float newDistance = currentSphere->distanceTo(pos);
        if(newDistance < minDistance)
        {
            sphere = currentSphere;
            minDistance = newDistance;
        }
    }

    distance = minDistance;
    glm::vec3 unit = glm::normalize(pos - sphere->getCenter());
    nearest = sphere->getCenter() + (((float) sphere->getRadius()) * unit);
}
