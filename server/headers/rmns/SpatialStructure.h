#ifndef __SPATIAL_STRUCTURE__
#define __SPATIAL_STRUCTURE__

#include <map>
#include <glm/vec3.hpp>
#include <spatial/point_multiset.hpp>
#include <spatial/neighbor_iterator.hpp>

#include <rmns/Sphere.h>
#include <rmns/VisibilityHelper.h>

class SpatialStructure
{
    public:
        SpatialStructure();

        bool reset();
        int count_points();
        int count_spheres();

        bool add_point(glm::vec3 point);
        bool add_points(std::vector<glm::vec3> points);
        bool update_sphere(int id, glm::vec3 center, double radius);

        void nearest_point(glm::vec3 pos, glm::vec3& nearest, double& distance);
        void nearest_vpoint(glm::vec3 pos, glm::vec3& nearest, double& distance);
        void nearest_object(glm::vec3 pos, glm::vec3& nearest, double& distance);

    private:
        void nearest_sphere(glm::vec3 pos, glm::vec3& nearest, double& distance);

    private:
        typedef spatial::point_multiset<3, glm::vec3> Vec3Spatial;
        typedef spatial::neighbor_iterator<Vec3Spatial> Iterator;
        Vec3Spatial* _spatialStructure;

        typedef std::map<int,Sphere*>::iterator sphere_it;
        std::map<int,Sphere*> _spheres;

        VisibilityHelper _helper;
};

#endif
