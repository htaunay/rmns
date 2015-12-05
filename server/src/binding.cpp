#include <v8.h>
#include <node.h>
#include <iostream>
#include <glm/vec3.hpp>
#include <glm/gtx/norm.hpp>
#include <rmns/CameraInfo.h>
#include <rmns/SpatialStructure.h>
#include <spatial/point_multiset.hpp>

using namespace v8;

// ********** Helper Methods ********** //

// TODO convention name + explicit internal method
int GetArrayLength(const FunctionCallbackInfo<Value>& args)
{
    if (args.Length() != 1 || !args[0]->IsArray())
        return -1;

    Isolate* isolate = args.GetIsolate();
    Local<Object> arrayObj = args[0]->ToObject();
    Local<String> lengthString = String::NewFromUtf8(isolate, "length");
    Local<Value> arrayLengthVal = arrayObj->Get(lengthString);
    int length = arrayLengthVal->ToObject()->Uint32Value();

    return length;
}

glm::vec3 Vec3FromJsonObj(Local<Object> obj, Isolate* isolate)
{
    double x = obj->Get(String::NewFromUtf8(isolate, "x"))->NumberValue();
    double y = obj->Get(String::NewFromUtf8(isolate, "y"))->NumberValue();
    double z = obj->Get(String::NewFromUtf8(isolate, "z"))->NumberValue();

    return glm::vec3(x,y,z);
}

// ********** Binding Methods ********** //


SpatialStructure* spatialStructure = new SpatialStructure();

void setup_config(const FunctionCallbackInfo<Value>& args)
{
    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    Local<Object> config_obj = args[0]->ToObject();
    Local<Array> property_names = config_obj->GetOwnPropertyNames();

    for (unsigned int i = 0; i < property_names->Length(); ++i)
    {
        Local<Value> keyValue = property_names->Get(i);
        String::Utf8Value keyUtf8(keyValue);
        std::string key = std::string(*keyUtf8);

        Local<Value> value = config_obj->Get(keyValue->ToString());

        if(key.compare("activate_grid") == 0)
            spatialStructure->activateGrid(value->BooleanValue());

        if(key.compare("cell_size") == 0)
            spatialStructure->setCellSize(value->NumberValue());
    }

    output->Set(String::NewFromUtf8(isolate, "success"),
            Boolean::New(isolate, true));

    args.GetReturnValue().Set(output);
}

void stats(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    int numPoints = spatialStructure->count_points();
    int numSpheres = spatialStructure->count_spheres();

    output->Set(String::NewFromUtf8(isolate, "num_points"),
            Number::New(isolate, numPoints));
    output->Set(String::NewFromUtf8(isolate, "num_spheres"),
            Number::New(isolate, numSpheres));

    args.GetReturnValue().Set(output);
}

/*!
 * This method must receive an v8 number array, with a length multiple
 * of three, and returns the total points already registered..
 * Any other input may not result in expected behaviour. 
 */
void points(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    int length = GetArrayLength(args);
    Local<Object> array = args[0]->ToObject();

    for(int i = 0; i < length; i+=3)
    {
        float x = array->Get(i)->NumberValue();
        float y = array->Get(i+1)->NumberValue();
        float z = array->Get(i+2)->NumberValue();
        spatialStructure->add_point(glm::vec3(x,y,z));
    }

    output->Set(String::NewFromUtf8(isolate, "total"),
        Number::New(isolate, spatialStructure->count_points()));

    args.GetReturnValue().Set(output);
}

void spheres(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();

    Local<Object> output = Object::New(isolate);

    Local<String> xStr = String::NewFromUtf8(isolate, "x"); 
    Local<String> yStr = String::NewFromUtf8(isolate, "y"); 
    Local<String> zStr = String::NewFromUtf8(isolate, "z"); 
    Local<String> idStr = String::NewFromUtf8(isolate, "id");
    Local<String> centerStr = String::NewFromUtf8(isolate, "center"); 
    Local<String> radiusStr = String::NewFromUtf8(isolate, "radius"); 

    int length = GetArrayLength(args);
    Local<Object> array = args[0]->ToObject();

    for(int i = 0; i < length; i++)
    {
        Local<Object> sphereObj = array->Get(i)->ToObject();
        Local<Object> center = sphereObj->Get(centerStr)->ToObject();
        double x = center->Get(xStr)->NumberValue();
        double y = center->Get(yStr)->NumberValue();
        double z = center->Get(zStr)->NumberValue();
        int id = (int) sphereObj->Get(idStr)->NumberValue();
        double radius = sphereObj->Get(radiusStr)->NumberValue();

        spatialStructure->update_sphere(id, glm::vec3(x,y,z), radius);
    }

    output->Set(String::NewFromUtf8(isolate, "total"),
        Number::New(isolate, spatialStructure->count_spheres()));

    args.GetReturnValue().Set(output);
}

void reset(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    bool success = spatialStructure->reset();

    output->Set(String::NewFromUtf8(isolate, "success"),
            Boolean::New(isolate, success));

    args.GetReturnValue().Set(output);
}

void nearest_point(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    Local<Object> posObj = args[0]->ToObject();
    double x = posObj->Get(String::NewFromUtf8(isolate, "x"))->NumberValue();
    double y = posObj->Get(String::NewFromUtf8(isolate, "y"))->NumberValue();
    double z = posObj->Get(String::NewFromUtf8(isolate, "z"))->NumberValue();

    double distance;
    glm::vec3 nearest;
    glm::vec3 pos(x,y,z);
    spatialStructure->nearest_point(pos, nearest, distance);

    output->Set(String::NewFromUtf8(isolate, "distance"),
           Number::New(isolate, distance)); 

    Local<Object> nearestObj = Object::New(isolate);
    nearestObj->Set(String::NewFromUtf8(isolate, "x"),
           Number::New(isolate, nearest.x));
    nearestObj->Set(String::NewFromUtf8(isolate, "y"),
           Number::New(isolate, nearest.y));
    nearestObj->Set(String::NewFromUtf8(isolate, "z"),
           Number::New(isolate, nearest.z));
    output->Set(String::NewFromUtf8(isolate, "nearest"), nearestObj);

    args.GetReturnValue().Set(output);
}

void nearest_vpoint(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    glm::vec3 eye       = Vec3FromJsonObj(args[0]->ToObject(), isolate);
    glm::vec3 center    = Vec3FromJsonObj(args[1]->ToObject(), isolate);
    glm::vec3 up        = Vec3FromJsonObj(args[2]->ToObject(), isolate);
    float fovy          = args[3]->NumberValue();
    float aspect        = args[4]->NumberValue();
    float znear         = args[5]->NumberValue();
    float zfar          = args[6]->NumberValue();
    
    //Local<Object> mvObj = args[1]->ToObject();
    //std::vector<double> mvArray;
    //for(int i = 0; i < 16; i++)
    //    mvArray.push_back(mvObj->Get(i)->NumberValue());

    //Local<Object> projObj = args[2]->ToObject();
    //std::vector<double> projArray;
    //for(int i = 0; i < 16; i++)
    //    projArray.push_back(projObj->Get(i)->NumberValue());

    CameraInfo* camera = new CameraInfo(eye, center, up,
                                        fovy, aspect, znear, zfar);
    double distance;
    glm::vec3 nearest;
    spatialStructure->nearest_vpoint(camera, nearest, distance);

    output->Set(String::NewFromUtf8(isolate, "distance"),
           Number::New(isolate, distance)); 

    Local<Object> nearestObj = Object::New(isolate);
    nearestObj->Set(String::NewFromUtf8(isolate, "x"),
           Number::New(isolate, nearest.x));
    nearestObj->Set(String::NewFromUtf8(isolate, "y"),
           Number::New(isolate, nearest.y));
    nearestObj->Set(String::NewFromUtf8(isolate, "z"),
           Number::New(isolate, nearest.z));
    output->Set(String::NewFromUtf8(isolate, "nearest"), nearestObj);

    args.GetReturnValue().Set(output);
}

void nearest_object(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    Local<Object> posObj = args[0]->ToObject();
    double x = posObj->Get(String::NewFromUtf8(isolate, "x"))->NumberValue();
    double y = posObj->Get(String::NewFromUtf8(isolate, "y"))->NumberValue();
    double z = posObj->Get(String::NewFromUtf8(isolate, "z"))->NumberValue();

    double distance;
    glm::vec3 nearest;
    glm::vec3 pos(x,y,z);
    spatialStructure->nearest_object(pos, nearest, distance);

    output->Set(String::NewFromUtf8(isolate, "distance"),
           Number::New(isolate, distance)); 

    Local<Object> nearestObj = Object::New(isolate);
    nearestObj->Set(String::NewFromUtf8(isolate, "x"),
           Number::New(isolate, nearest.x));
    nearestObj->Set(String::NewFromUtf8(isolate, "y"),
           Number::New(isolate, nearest.y));
    nearestObj->Set(String::NewFromUtf8(isolate, "z"),
           Number::New(isolate, nearest.z));
    output->Set(String::NewFromUtf8(isolate, "nearest"), nearestObj);

    args.GetReturnValue().Set(output);
}

void nearest_vobject(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    glm::vec3 eye       = Vec3FromJsonObj(args[0]->ToObject(), isolate);
    glm::vec3 center    = Vec3FromJsonObj(args[1]->ToObject(), isolate);
    glm::vec3 up        = Vec3FromJsonObj(args[2]->ToObject(), isolate);
    float fovy          = args[3]->NumberValue();
    float aspect        = args[4]->NumberValue();
    float znear         = args[5]->NumberValue();
    float zfar          = args[6]->NumberValue();

    //Local<Object> posObj = args[0]->ToObject();
    //double x = posObj->Get(String::NewFromUtf8(isolate, "x"))->NumberValue();
    //double y = posObj->Get(String::NewFromUtf8(isolate, "y"))->NumberValue();
    //double z = posObj->Get(String::NewFromUtf8(isolate, "z"))->NumberValue();

    CameraInfo* camera = new CameraInfo(eye, center, up,
                                        fovy, aspect, znear, zfar);
    double distance;
    glm::vec3 nearest;
    std::vector<glm::vec3> points;
    spatialStructure->nearest_vobject(camera, nearest, distance, points);

    output->Set(String::NewFromUtf8(isolate, "distance"),
           Number::New(isolate, distance)); 

    Local<Array> pointsObj = Array::New(isolate, 8);
    for(int i = 0; i < 8; i++)
    {
        Local<Object> point = Object::New(isolate);
        point->Set(String::NewFromUtf8(isolate, "x"),
               Number::New(isolate, points[i].x));
        point->Set(String::NewFromUtf8(isolate, "y"),
               Number::New(isolate, points[i].y));
        point->Set(String::NewFromUtf8(isolate, "z"),
               Number::New(isolate, points[i].z));

        pointsObj->Set(i, point);
    }
    output->Set(String::NewFromUtf8(isolate, "points"), pointsObj); 

    Local<Object> nearestObj = Object::New(isolate);
    nearestObj->Set(String::NewFromUtf8(isolate, "x"),
           Number::New(isolate, nearest.x));
    nearestObj->Set(String::NewFromUtf8(isolate, "y"),
           Number::New(isolate, nearest.y));
    nearestObj->Set(String::NewFromUtf8(isolate, "z"),
           Number::New(isolate, nearest.z));
    output->Set(String::NewFromUtf8(isolate, "nearest"), nearestObj);

    args.GetReturnValue().Set(output);
}

void init(Handle<Object> target) {
    NODE_SET_METHOD(target, "setup_config",     setup_config);
    NODE_SET_METHOD(target, "stats",            stats);
    NODE_SET_METHOD(target, "points",           points);
    //NODE_SET_METHOD(target, "cubes",    cubes);
    NODE_SET_METHOD(target, "spheres",          spheres);
    NODE_SET_METHOD(target, "reset",            reset);
    NODE_SET_METHOD(target, "nearest_point",    nearest_point);
    NODE_SET_METHOD(target, "nearest_vpoint",   nearest_vpoint);
    NODE_SET_METHOD(target, "nearest_object",   nearest_object);
    NODE_SET_METHOD(target, "nearest_vobject",  nearest_vobject);
}

NODE_MODULE(binding, init);
