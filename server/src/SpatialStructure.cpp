#include <rmns/SpatialStructure.h>
#include <spatial/neighbor_iterator.hpp>
#include <spatial/region_iterator.hpp>
#include <cfloat>
#include <glm/mat4x4.hpp>
#include <glm/geometric.hpp>

SpatialStructure::SpatialStructure()
{
    //_helper = new VisibilityHelper();
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

void SpatialStructure::nearest_point(glm::vec3 pos, glm::vec3& nearest, double& distance)
{
    Iterator iter =
    spatial::neighbor_begin(*_spatialStructure, pos);

    if(iter == _spatialStructure->end())
    {
        nearest = glm::vec3(0,0,0);
        distance = 10e10;
        return;
    }

    distance = iter.distance();
    nearest = *iter;
}

void SpatialStructure::nearest_vpoint(CameraInfo* camera,
                                      glm::vec3& nearest,
                                      double& distance)
{
    _helper.setMatrices(camera->view_matrix(), camera->projection_matrix());

    Iterator iter = spatial::visible_neighbor_begin(
            *_spatialStructure, camera->get_eye(), _helper);

    if(iter == _spatialStructure->end())
    {
        nearest = glm::vec3(0,0,0);
        // TODO
        distance = 10e10;
        return;
    }

    distance = iter.distance();
    nearest = *iter;
}

void SpatialStructure::nearest_object(glm::vec3 pos, glm::vec3& nearest,
        double& distance)
{
    return nearest_sphere(pos, nearest, distance);
}

void SpatialStructure::nearest_vobject(CameraInfo* camera,
                                       glm::vec3& nearest,
                                       double& distance)
{
    return nearest_vsphere(camera, nearest, distance);
}

void SpatialStructure::nearest_sphere(glm::vec3 pos,
                                      glm::vec3& nearest,
                                      double& distance)
{
    Sphere* sphere = new Sphere(glm::vec3(0,0,0), 0);
    // TODO nearest sphere float, with nearest point double
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

void SpatialStructure::nearest_vsphere(CameraInfo* camera,
                                       glm::vec3& nearest,
                                       double& distance)
{
    Sphere* sphere = new Sphere(glm::vec3(0,0,0), 0);
    // TODO nearest sphere float, with nearest point double
    float minDistance = FLT_MAX;

    for(sphere_it it = _spheres.begin(); it != _spheres.end(); it++)
    {
        Sphere* currentSphere = it->second;
        float newDistance = currentSphere->distanceTo(camera->get_eye());
        if(newDistance < minDistance && camera->sphere_inside_frustum(currentSphere))
        {
            sphere = currentSphere;
            minDistance = newDistance;
        }
    }

    distance = minDistance;
    glm::vec3 unit = glm::normalize(camera->get_eye() - sphere->getCenter());
    nearest = sphere->getCenter() + (((float) sphere->getRadius()) * unit);
}
