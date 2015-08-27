using UnityEngine;
using Object = UnityEngine.Object;

using System;
using System.Collections;
using System.Collections.Generic;

public class VertexFileLoader : MonoBehaviour
{
    private Vector3 CORRECTION = new Vector3(388372.5625f, 7519702f, 0f);
    private Dictionary<Vector3, bool> vertexMap = new Dictionary<Vector3, bool>();

    public void Start()
    {
        Object[] files = Resources.LoadAll("", typeof(TextAsset));
        Debug.Log(files.Length);

        foreach(Object file in files)
            LoadFile((TextAsset) file);

        GameObject parent = new GameObject("Points");
        foreach(KeyValuePair<Vector3, bool> entry in vertexMap)
            CreateSphere(parent, entry.Key);
    }

    private void LoadFile(TextAsset file)
    {
        string[] lines = file.text.Split('\n');
        int counter = 0;
        foreach(string line in lines)
        {
            counter++;

            string[] points = line.Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
            if(points.Length != 3)
            {
                if(line == "")
                    break;

                throw new Exception("Invalid file format: " + file.name + " => " + counter);
            }

            float x = ((float.Parse(points[0]) - CORRECTION.x) / 10000f);
            float y = ((float.Parse(points[1]) - CORRECTION.y) / 10000f);
            float z = ((float.Parse(points[2]) - CORRECTION.z) / 10000f);

            Vector3 point = new Vector3(x,z,y);
            if(!vertexMap.ContainsKey(point))
                vertexMap.Add(point, true);
        }
    }

    private void CreateSphere(GameObject parent, Vector3 point)
    {
        GameObject go = GameObject.CreatePrimitive(PrimitiveType.Cube);
        go.transform.name = "Point";
        go.transform.position = point;
        go.transform.parent = parent.transform;
    }
}
