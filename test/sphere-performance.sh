#!/bin/bash

############################
###### Configurations ######
############################

num_spheres=1000000
spheres_per_req=1000
test_nearest=0
test_vnearest=0
test_velocity=1
req_interval=100000

############################
###### Helper Methods ######
############################

build_vec3() {

    if [ $# -eq 3 ]
    then
        x=$1
        y=$2
        z=$3
    else
        x=$RANDOM
        y=$RANDOM
        z=$RANDOM
    fi

    vec3="{\"x\":"$x",\"y\":"$y",\"z\":"$z"}"
    echo $vec3
}

build_sphere_json() {

    id=$1
    radius=$RANDOM

    json="{\"id\":"$id","
    json+="\"center\":"$(build_vec3)","
    json+="\"radius\":"$radius"}"
    echo $json
}

build_spheres_req() {

    if [ $# -eq 1 ]
    then
        start_id=$1
    else
        start_id=0
    fi

    req="["

    for((i = 1; i <= spheres_per_req; i++))
    do
        if [ $i -ne 1 ]
        then
            req+=","
        fi

        id=$((i + start_id))
        req+=$(build_sphere_json $id)
    done

    req+="]"

    echo $req
}

build_nearest_req() {

    req="{\"eye\":"$(build_vec3)"}"

    echo $req
}

build_vnearest_req() {

    req="{\"eye\":"$(build_vec3)",\"center\":"$(build_vec3 0 0 0)","
    req+="\"up\":"$(build_vec3 0 1 0)",\"fovy\":60,\"aspect\":1.7,"
    req+="\"znear\":0.1,\"zfar\":10000}"

    echo $req
}

############################
########### Test ###########
############################

# Register spheres
for((i = 0; i < num_spheres; i += spheres_per_req))
do
    register_body=$(build_spheres_req $i)
    curl -XPOST 127.0.0.1:8081/spheres -d $register_body &
done

# Test performance
while [ 1 ]
do
    if [ $test_velocity -eq 1 ]
    then
        velocity_body=$(build_vnearest_req)
        time curl -XPOST 127.0.0.1:8081/velocity -d $velocity_body
    fi

    usleep $req_interval 
done
