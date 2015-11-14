#include <v8.h>
#include <node.h>
#include <iostream>
#include <glm/vec3.hpp>
#include <glm/gtx/norm.hpp>
#include <rmns/SpatialStructure.h>
#include <spatial/point_multiset.hpp>

using namespace v8;

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

SpatialStructure* speedCalculator = new SpatialStructure();

void stats(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    int numPoints = speedCalculator->count_points();
    int numSpheres = speedCalculator->count_spheres();

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
        speedCalculator->add_point(glm::vec3(x,y,z));
    }

    output->Set(String::NewFromUtf8(isolate, "total"),
        Number::New(isolate, speedCalculator->count_points()));

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

        speedCalculator->update_sphere(id, glm::vec3(x,y,z), radius);
    }

    output->Set(String::NewFromUtf8(isolate, "total"),
        Number::New(isolate, speedCalculator->count_spheres()));

    args.GetReturnValue().Set(output);
}

void reset(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    bool success = speedCalculator->reset();

    output->Set(String::NewFromUtf8(isolate, "success"),
            Boolean::New(isolate, success));

    args.GetReturnValue().Set(output);
}

void velocity(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    Local<Object> posObj = args[0]->ToObject();
    double x = posObj->Get(String::NewFromUtf8(isolate, "x"))->NumberValue();
    double y = posObj->Get(String::NewFromUtf8(isolate, "y"))->NumberValue();
    double z = posObj->Get(String::NewFromUtf8(isolate, "z"))->NumberValue();

    double speed;
    glm::vec3 nearest;
    glm::vec3 pos(x,y,z);

    if(speedCalculator->velocity(pos, nearest, speed))
    {
        // Set velocity
        output->Set(String::NewFromUtf8(isolate, "velocity"),
               Number::New(isolate, speed)); 

        // Set Nearest point
        Local<Object> nearestObj = Object::New(isolate);
        nearestObj->Set(String::NewFromUtf8(isolate, "x"),
               Number::New(isolate, nearest.x));
        nearestObj->Set(String::NewFromUtf8(isolate, "y"),
               Number::New(isolate, nearest.y));
        nearestObj->Set(String::NewFromUtf8(isolate, "z"),
               Number::New(isolate, nearest.z));
        output->Set(String::NewFromUtf8(isolate, "nearest"), nearestObj);
    }

    args.GetReturnValue().Set(output);
}

void init(Handle<Object> target) {
    NODE_SET_METHOD(target, "stats",    stats);
    NODE_SET_METHOD(target, "points",   points);
    //NODE_SET_METHOD(target, "cubes",    cubes);
    NODE_SET_METHOD(target, "spheres",  spheres);
    NODE_SET_METHOD(target, "reset",    reset);
    NODE_SET_METHOD(target, "velocity", velocity);
}

NODE_MODULE(binding, init);
