using UnityEngine;
using System.Collections;
using System.Collections.Generic;

public class VertexFileLoader : MonoBehaviour {

    public void Start()
    {
        Object[] files = Resources.LoadAll("", typeof(TextAsset));
        Debug.Log(files.Length);

        List<TextAsset> vertexFiles = new List<TextAsset>();
        foreach(Object file in files)
        {
            vertexFiles.Add((TextAsset) file);
        }

        Debug.Log(vertexFiles.Count);
    }

    private void LoadFile(TextAsset file)
    {

    }
}
