#ifndef __VISIBILITY_HELPER__
#define __VISIBILITY_HELPER__

#include <algorithm>

#include <glm/vec3.hpp>
#include <glm/vec4.hpp>
#include <glm/mat4x4.hpp>
#include <glm/gtc/matrix_transform.hpp>

enum Side
{
    ABOVE,
    BELOW,
    CROSS
};

class VisibilityHelper
{

public:
    VisibilityHelper(){}

    /*void setMatrices( glm::mat4 mv, glm::mat4 proj )
    {
        _mv = mv;
        _proj = proj;
        _mvp = mv * proj;
        calculateFrustumPoints();
    }

    void calculateFrustumPoints()
    {
        const double near = _proj[3][2] / (_proj[2][2]-1.0);
        const double far = _proj[3][2] / (1.0+_proj[2][2]);

        // Get the sides of the near plane.
        const double nLeft = near * (_proj[2][0]-1.0) / _proj[0][0];
        const double nRight = near * (1.0+_proj[2][0]) / _proj[0][0];
        const double nTop = near * (1.0+_proj[2][1]) / _proj[1][1];
        const double nBottom = near * (_proj[2][1]-1.0) / _proj[1][1];

        // Get the sides of the far plane.
        const double fLeft = far * (_proj[2][0]-1.0) / _proj[0][0];
        const double fRight = far * (1.0+_proj[2][0]) / _proj[0][0];
        const double fTop = far * (1.0+_proj[2][1]) / _proj[1][1];
        const double fBottom = far * (_proj[2][1]-1.0) / _proj[1][1];

        // Our vertex array needs only 9 vertices: The origin, and the
        // eight corners of the near and far planes.
        glm::vec4* v = new glm::vec4[8];
        v[0] = glm::vec4(nLeft,  nBottom, -near, 0);
        v[1] = glm::vec4(nRight, nBottom, -near, 0);
        v[2] = glm::vec4(nRight, nTop,    -near, 0);
        v[3] = glm::vec4(nLeft,  nTop,    -near, 0);
        v[4] = glm::vec4(fLeft,  fBottom, -far,  0);
        v[5] = glm::vec4(fRight, fBottom, -far,  0);
        v[6] = glm::vec4(fRight, fTop,    -far,  0);
        v[7] = glm::vec4(fLeft,  fTop,    -far,  0);

        glm::mat4 mvInverse = glm::inverse( _mv );
        
        glm::vec4 current = v[0];
        current = current * mvInverse;
        _frustumMin = _frustumMax = glm::vec3(current);

        for( int i = 1; i < 8; i++ )
        {
            current = v[i];
            current = current * mvInverse;
            for( int j = 0; j < 3; j++ )
            {
                _frustumMin[j] = std::min(current[j], _frustumMin[j]);
                _frustumMax[j] = std::max(current[j], _frustumMax[j]);
            }
        }

        delete v;
    }*/

    template <typename Key, typename dimension_type>
    Side planeRelatedToFrustum( Key input, dimension_type node_dim ) const
    {
        double planeEq = input[node_dim];
        double sgn = planeEq - _frustumMin[node_dim];
        if( sgn < -10.e-6 )
        {
            return BELOW;
        }

        sgn = planeEq - _frustumMax[node_dim];
        if( sgn > 10.e-6 )
        {
            return ABOVE;
        }
        
        return CROSS;
    }

    template <typename Key>
    void getFrustumAABB( Key& min, Key& max )
    {
        for( int i = 0; i < 3; i++ )
        {
            min[i] = _frustumMin[i];
            max[i] = _frustumMax[i];
        }
        
    }

    template <typename Key>
    bool visible( Key current ) const
    {
        // TODO Compare point to each plane?

        //glm::vec4 input( current[0], current[1], current[2], 1 );

        //glm::vec4 result = input * _mvp;
        //bool visible = abs(result.x()) < result.w() && 
        //       abs(result.y()) < result.w() && 
        //       0 < result.z() && 
        //       result.z() < result.w();

        //return visible;
        return true;
    }
    
private:
    //glm::mat4 _mv;
    //glm::mat4 _proj;
    //glm::mat4 _mvp;
    glm::vec3 _frustumMin;
    glm::vec3 _frustumMax;
};
#endif
