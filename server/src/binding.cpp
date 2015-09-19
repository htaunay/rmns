#include <v8.h>
#include <node.h>
#include <iostream>
#include <glm/vec3.hpp>
#include <glm/gtx/norm.hpp>
#include <rmns/SpeedCalculator.h>
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

    if(length % 3 != 0)
        return -1;

    return length;
}

//void GetSpeed(const FunctionCallbackInfo<Value>& args) {
//
//    Isolate* isolate = args.GetIsolate();
//
//    if (args.Length() != 3) {
//
//        isolate->ThrowException(Exception::TypeError(
//            String::NewFromUtf8(isolate, "Wrong number of arguments")));
//        return;
//    }
//
//    if (!args[0]->IsNumber() || !args[1]->IsNumber() || !args[2]->IsNumber()) {
//
//        isolate->ThrowException(Exception::TypeError(
//            String::NewFromUtf8(isolate, "Wrong arguments types")));
//        return;
//    }
//
//    float x = args[0]->NumberValue();
//    float y = args[1]->NumberValue();
//    float z = args[2]->NumberValue();
//
//    float distance = glm::length(glm::vec3(x, y, z) - glm::vec3(0, 0, 0));
//
//    //typedef spatial::point_multiset<1, float> runtime_container;
//    //runtime_container container();
//
//    // Now declare the container with the user-defined accessor
//    //spatial::point_multiset<3, glm::vec3> container;
//    //container.insert(glm::vec3(1.0f, 2.0f, 3.0f));
//    //container.insert(glm::vec3(1.0f, 2.0f, 3.0f));
//
//    //std::cout << "There are " << container.size()
//    //    << " elements in space.\n";
//
//    args.GetReturnValue().Set(distance);
//}

SpeedCalculator* speedCalculator = new SpeedCalculator();

void reset(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    int code;
    std::string msg;

    if(speedCalculator->reset())
    {
        code = 200;
        std::stringstream stream;
        stream << "Reset operation successful. Spatial structure currenlty "
            << "has " << speedCalculator->count() << " points";
        msg = stream.str();
    }
    else
    {
        code = 500;
        msg = "Internal server error - unable to reset spatial structure";
    }

    output->Set(String::NewFromUtf8(isolate, "code"),
            Number::New(isolate, code));
    output->Set(String::NewFromUtf8(isolate, "msg"),
            String::NewFromUtf8(isolate, msg.c_str()));

    args.GetReturnValue().Set(output);
}

void points(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();
    Local<Object> output = Object::New(isolate);

    int code;
    std::string msg;

    int length = GetArrayLength(args);
    if(length < 0)
    {
        code = 400;
        msg = "Invalid argument type or size";
    }
    else
    {
        Local<Object> array = args[0]->ToObject();

        for(int i = 0; i < length; i+=3)
        {
            float x = array->Get(i)->NumberValue();
            float y = array->Get(i+1)->NumberValue();
            float z = array->Get(i+2)->NumberValue();
            speedCalculator->add_point(glm::vec3(x,y,z));
        }

        code = 200;
        std::stringstream stream;
        stream << "Added " << (length / 3) << " point(s) successfully. "
            "The total now is " << speedCalculator->count() << " point(s)";
        msg = stream.str();
    }

    output->Set(String::NewFromUtf8(isolate, "code"),
            Number::New(isolate, code));
    output->Set(String::NewFromUtf8(isolate, "msg"),
            String::NewFromUtf8(isolate, msg.c_str()));

    args.GetReturnValue().Set(output);
}

void init(Handle<Object> target) {
    NODE_SET_METHOD(target, "reset", reset);
    NODE_SET_METHOD(target, "points", points);
}

NODE_MODULE(binding, init);
