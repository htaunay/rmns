{
  "targets": [
    {
      "target_name": "binding",
      "sources": [ "binding.cpp" ],
      "include_dirs": [ "headers" ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"]
    }
  ]
}
