#include <node.h>
#include <v8.h>
#include <iostream>
#include <glm/vec3.hpp>
#include <glm/gtx/norm.hpp>
#include <spatial/point_multiset.hpp>

using namespace v8;

void GetSpeed(const FunctionCallbackInfo<Value>& args) {

    Isolate* isolate = args.GetIsolate();

    if (args.Length() != 3) {

        isolate->ThrowException(Exception::TypeError(
            String::NewFromUtf8(isolate, "Wrong number of arguments")));
        return;
    }

    if (!args[0]->IsNumber() || !args[1]->IsNumber() || !args[2]->IsNumber()) {

        isolate->ThrowException(Exception::TypeError(
            String::NewFromUtf8(isolate, "Wrong arguments types")));
        return;
    }

    float x = args[0]->NumberValue();
    float y = args[1]->NumberValue();
    float z = args[2]->NumberValue();

    float distance = glm::length(glm::vec3(x, y, z) - glm::vec3(0, 0, 0));

    //typedef spatial::point_multiset<1, float> runtime_container;
    //runtime_container container();

    // Now declare the container with the user-defined accessor
    //spatial::point_multiset<3, glm::vec3> container;
    //container.insert(glm::vec3(1.0f, 2.0f, 3.0f));
    //container.insert(glm::vec3(1.0f, 2.0f, 3.0f));

    //std::cout << "There are " << container.size()
    //    << " elements in space.\n";

    args.GetReturnValue().Set(distance);
}

void init(Handle<Object> target) {
    NODE_SET_METHOD(target, "get_speed", GetSpeed);
}

NODE_MODULE(binding, init);
