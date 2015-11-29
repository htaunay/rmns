#include <rmns/SpatialStructure.h>
#include <spatial/neighbor_iterator.hpp>
#include <spatial/region_iterator.hpp>
#include <cfloat>
#include <glm/geometric.hpp>

SpatialStructure::SpatialStructure()
{
    //_helper = new VisibilityHelper();
    _spatialStructure = new Vec3Spatial();

    // Default values
    _activate_grid = false;
    _cell_size = 1.0f;
}

void SpatialStructure::activateGrid(bool activate)
{
    _activate_grid = activate;
}

void SpatialStructure::setCellSize(float cellSize)
{
    _cell_size = cellSize;
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
    if(_activate_grid)
    {
        glm::vec3 grid_point = glm::vec3(
            (int)(point.x / _cell_size),
            (int)(point.y / _cell_size),
            (int)(point.z / _cell_size)
        );
        Vec3Set::iterator it = _grid.find(grid_point);
        if(it == _grid.end())
        {
            _spatialStructure->insert(grid_point * _cell_size);
            _grid.insert(grid_point);
        }
    }
    else
    {
        _spatialStructure->insert(point);
    }

    return true;
}

bool SpatialStructure::add_points(std::vector<glm::vec3> points)
{
    for(unsigned int i = 0; i < points.size(); i++)
        add_point(points[i]);

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

void SpatialStructure::nearest_point(glm::vec3 pos, glm::vec3& nearest, double& distance)
{
    Iterator iter =
    spatial::neighbor_begin(*_spatialStructure, pos);

    if(iter == _spatialStructure->end())
    {
        nearest = glm::vec3(0,0,0);
        distance = 0;
        return;
    }

    distance = iter.distance();
    nearest = *iter;
}

void SpatialStructure::nearest_vpoint(glm::vec3 pos, glm::vec3& nearest, double& distance)
{
    //_helper.setFrustrum;

    Iterator iter =
    spatial::visible_neighbor_begin(*_spatialStructure, pos, _helper);

    if(iter == _spatialStructure->end())
    {
        nearest = glm::vec3(0,0,0);
        distance = 0;
        return;
    }

    distance = iter.distance();
    nearest = *iter;
}

void SpatialStructure::nearest_object(glm::vec3 pos, glm::vec3& nearest, double& distance)
{
    return nearest_sphere(pos, nearest, distance);
}

void SpatialStructure::nearest_sphere(glm::vec3 pos, glm::vec3& nearest, double& distance)
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
