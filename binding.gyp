{
    "targets": [
        {
            "target_name": "binding",
            "sources": [
                "src/binding.cpp",
                "src/CameraInfo.cpp",
                "src/Plane.cpp",
                "src/SpatialStructure.cpp",
                "src/Sphere.cpp"
            ],
            'defines': [
                '<!@(node -v |grep "v[^0]" > /dev/null && echo "__NODE_GE_V4__" || true)',
                '<!@(node -v |grep "v0\.1[12]" > /dev/null && echo "__NODE_V0_11_OR_12__" || true)',
                '<!@(command -v iojs > /dev/null && echo "__NODE_V0_11_OR_12__" || true)',
                '<!@(node -v |grep "v0\.10" > /dev/null && echo "__NODE_V0_10__" || true)',
            ],
            "include_dirs": ["headers"],
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"],
            "xcode_settings": {
                "GCC_ENABLE_CPP_RTTI": "YES",
                "GCC_ENABLE_CPP_EXCEPTIONS": "YES",
                "OTHER_CPLUSPLUSFLAGS":["-stdlib=libc++"],
                "OTHER_LDFLAGS":["-stdlib=libc++"],
                "CLANG_CXX_LANGUAGE_STANDARD":"c++11",
                "MACOSX_DEPLOYMENT_TARGET":"10.7"
            }
        }
    ]
}
