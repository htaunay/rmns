{
    "targets": [
        {
            "target_name": "binding",
            "sources": [
                "src/binding.cpp",
                "src/SpeedCalculator.cpp",
                "src/Sphere.cpp"
            ],
            "include_dirs": [ "headers" ],
            "cflags!": ["-fno-exceptions"],
            "cflags_cc!": ["-fno-exceptions"]
        }
    ]
}
