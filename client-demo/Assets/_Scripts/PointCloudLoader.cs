using UnityEngine;
using Object = UnityEngine.Object;

using System;
using System.Collections;
using System.Collections.Generic;

public class PointCloudLoader : MonoBehaviour
{
    //private Vector3 CORRECTION = new Vector3(388372.5625f, 7519702f, 0f);

    public void Start()
    {
        Object[] files = Resources.LoadAll("", typeof(TextAsset));
        Debug.Log(files.Length);

        GameObject parent = new GameObject("Points");
        foreach(Object file in files)
        {
            PointCloud.Create((TextAsset) file, parent);
        }
    }
}
