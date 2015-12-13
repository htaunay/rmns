#ifndef __CAMERA_INFO__
#define __CAMERA_INFO__

// TODO DEBUG
#include <set>
// DEBUG

#include <vector>
#include <glm/vec3.hpp>
#include <glm/mat4x4.hpp>

#include <rmns/Plane.h>
#include <rmns/Sphere.h>

class CameraInfo
{
    public:
        CameraInfo(glm::vec3 eye,
                   glm::vec3 center,
                   glm::vec3 up,
                   float fovy,
                   float aspect,
                   float znear,
                   float zfar);

        glm::vec3 get_eye();
        void set_fovy(float fovy);

        glm::mat4 view_matrix();
        glm::mat4 projection_matrix();

        bool sphere_inside_frustum(Sphere* sphere);

// TODO DEBUG
        std::vector<glm::vec3> campoints();
// DEBUG

    private:
        bool is_identity(glm::mat4 matrix);
        void build_planes();

    private:
        glm::vec3 eye;
        glm::vec3 center;
        glm::vec3 up;

        float _fovy;
        float aspect;
        float znear;
        float zfar;

        glm::mat4 view_mat4;
        glm::mat4 proj_mat4;

        std::vector<Plane*> _planes;

        // TODO DEBUG
        std::vector<glm::vec3> points;
        // DEBUG
};

#endif

