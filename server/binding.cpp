#include <node.h>
#include <v8.h>
#include <iostream>
#include <glm/vec3.hpp>
#include <spatial/point_multiset.hpp>

using namespace v8;

void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  //typedef spatial::point_multiset<1, float> runtime_container;
  //runtime_container container();

  // Now declare the container with the user-defined accessor
  spatial::point_multiset<3, glm::vec3> container;
  container.insert(glm::vec3(1.0f, 2.0f, 3.0f));
  container.insert(glm::vec3(1.0f, 2.0f, 3.0f));

    std::cout << "There are " << container.size()
            << " elements in space.\n";

  args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
}

void init(Handle<Object> target) {
  NODE_SET_METHOD(target, "hello", Method);
}

NODE_MODULE(binding, init);
