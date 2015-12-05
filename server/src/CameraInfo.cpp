#include <math.h>
#include <stdio.h>
#include <rmns/CameraInfo.h>
#include <glm/gtc/matrix_transform.hpp>

CameraInfo::CameraInfo(glm::vec3 eye,
                       glm::vec3 center,
                       glm::vec3 up,
                       float fovy,
                       float aspect,
                       float znear,
                       float zfar)
{
    this->eye    = eye;
    this->center = center;
    this->up     = up;
    this->fovy   = fovy;
    this->aspect = aspect;
    this->znear  = znear;
    this->zfar   = zfar;
}

glm::vec3 CameraInfo::get_eye()
{
    return eye;
}

glm::mat4 CameraInfo::view_matrix()
{
    if(is_identity(view_mat4))
        view_mat4 = glm::lookAt(eye, center, up);

    // TODO add right hand config (directx) fix
    if(true)
    {
        view_mat4[0][0] *= -1;
        view_mat4[1][0] *= -1;
        view_mat4[2][0] *= -1;
        view_mat4[3][0] *= -1;

        glm::mat4 reflect;

        for(int i = 0; i < 4; i++)
            for(int j = 0; j < 4; j++)
                reflect[i][j] = view_mat4[j][i];

        view_mat4 = reflect;
    }

    return view_mat4;
}

glm::mat4 CameraInfo::projection_matrix()
{
    // TODO custom fovy tweak
    float final_fovy = fovy;
    if(true)
        final_fovy /= 0.5f; // if not driectx *= 0.5

    if(is_identity(proj_mat4))
        proj_mat4 = glm::perspective(final_fovy, aspect, znear, zfar);

    // TODO add right hand config (directx) fix
    if(true)
    {
        glm::mat4 reflect;

        for(int i = 0; i < 4; i++)
            for(int j = 0; j < 4; j++)
                reflect[i][j] = proj_mat4[j][i];

        proj_mat4 = reflect;
    }

    return proj_mat4;
}

bool CameraInfo::sphere_inside_frustum(Sphere* sphere)
{
    if(_planes.empty())
        build_planes();
 
    float distance;
    for(unsigned int i = 0; i < _planes.size(); i++)
    {
        distance = _planes[i]->distance(sphere->getCenter());
        if(distance < -sphere->getRadius())
        {
            printf("Sphere %f %f %f is outside plane %d\n",
                    sphere->getCenter().x, sphere->getCenter().y, sphere->getCenter().z, i);
            return false;
        }
    }

    return true;
}

bool CameraInfo::is_identity(glm::mat4 matrix)
{
    for(int i = 0; i < 4; i++)
    {
        for(int j = 0; j < 4; j++)
        {
            if(matrix[j][i] != (j == i ? 1.0f : 0.0f))
                return false;
        }
    }

    return true;
}

void CameraInfo::build_planes()
{
    float final_fovy = fovy;
    if(true)
        final_fovy /= 0.5f; // if not driectx *= 0.5

    glm::vec3 zaxis = glm::normalize(center - eye);
    glm::vec3 xaxis = glm::normalize(glm::cross(up, zaxis));
    glm::vec3 yaxis = glm::cross(zaxis, xaxis);

    printf("EYE = %f\t%f\t%f\n", eye.x, eye.y, eye.z);
    printf("CENTER = %f\t%f\t%f\n", center.x, center.y, center.z);
    printf("UP = %f\t%f\t%f\n", up.x, up.y, up.z);
    printf("Z = %f\t%f\t%f\n", zaxis.x, zaxis.y, zaxis.z);
    printf("X = %f\t%f\t%f\n", xaxis.x, xaxis.y, xaxis.z);
    printf("Y = %f\t%f\t%f\n\n", yaxis.x, yaxis.y, yaxis.z);

    float near_height = 2.0f * tan(final_fovy / 2.0f) * znear;
    float near_width  = near_height * aspect;

    float far_height = 2.0f * tan(final_fovy / 2.0f) * zfar;
    float far_width  = far_height * aspect;

    glm::vec3 nc = eye + zaxis * znear;

    glm::vec3 ntl = nc + (yaxis * near_height/2.0f) - (xaxis * near_width/2.0f);
    glm::vec3 ntr = nc + (yaxis * near_height/2.0f) + (xaxis * near_width/2.0f);
    glm::vec3 nbl = nc - (yaxis * near_height/2.0f) - (xaxis * near_width/2.0f);
    glm::vec3 nbr = nc - (yaxis * near_height/2.0f) + (xaxis * near_width/2.0f);

    glm::vec3 fc = eye + zaxis * zfar;

    glm::vec3 ftl = fc + (yaxis * far_height/2.0f) - (xaxis * far_width/2.0f);
    glm::vec3 ftr = fc + (yaxis * far_height/2.0f) + (xaxis * far_width/2.0f);
    glm::vec3 fbl = fc - (yaxis * far_height/2.0f) - (xaxis * far_width/2.0f);
    glm::vec3 fbr = fc - (yaxis * far_height/2.0f) + (xaxis * far_width/2.0f);

    //_planes.push_back(new Plane(ntr, ntl, ftl)); // TOP
    //_planes.push_back(new Plane(nbl, nbr, fbr)); // BOTTOM
    //_planes.push_back(new Plane(ntl, nbl, fbl)); // LEFT
    //_planes.push_back(new Plane(nbr, ntr, fbr)); // RIGHT
    //_planes.push_back(new Plane(ntl, ntr, nbr)); // NEAR PLANE
    //_planes.push_back(new Plane(ftr, ftl, fbl)); // FAR PLANE

    _planes.push_back(new Plane(ntr, ftl, ntl)); // TOP
    _planes.push_back(new Plane(nbl, fbr, nbr)); // BOTTOM
    _planes.push_back(new Plane(ntl, fbl, nbl)); // LEFT
    _planes.push_back(new Plane(nbr, fbr, ntr)); // RIGHT
    _planes.push_back(new Plane(ntl, nbr, ntr)); // NEAR PLANE
    _planes.push_back(new Plane(ftr, fbl, ftl)); // FAR PLANE
}
