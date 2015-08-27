using UnityEngine;
using System;

public class PointCloud {

    private static int POINT_LIMIT = 64000;

    public static void Create(TextAsset file, GameObject root)
    {
        Vector3[] points = LoadPoints(file);
        int numGroups = Mathf.CeilToInt (points.Length*1.0f / POINT_LIMIT*1.0f);

        GameObject pointCloud = new GameObject(file.name);

        for (int i = 0; i < numGroups-1; i ++) {
            InstantiateMesh (points, file.name, pointCloud, i, POINT_LIMIT);
            if (i%10==0){
                Debug.Log(i.ToString() + " out of " + numGroups.ToString() + " PointGroups loaded");
            }
            //    guiText = i.ToString() + " out of " + numPointGroups.ToString() + " PointGroups loaded";
            //    yield return null;
            //}
        }
        InstantiateMesh (points, file.name, pointCloud, numGroups-1, points.Length- (numGroups-1) * POINT_LIMIT);
    }

    private static Vector3[] LoadPoints(TextAsset file)
    {
        Vector3[] points = null;
        string[] lines = file.text.Split('\n');
        for(int i = 0; i < lines.Length; i++)
        {
            if(i == 0)
            {
                int numPoints = int.Parse(lines[i]);
                points = new Vector3[numPoints];
                continue;
            }

            string[] pointList = lines[i].Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
            if(pointList.Length != 3)
            {
                if(lines[i] == "")
                    break;

                throw new Exception("Invalid file format: " + file.name + " => " + i);
            }

            float x = float.Parse(pointList[0]);
            float y = float.Parse(pointList[1]);
            float z = float.Parse(pointList[2]);

            points[i-1] = new Vector3(x,z,y);
        }

        return points;
    }

    // TODO remove legacy conventions
    private static void InstantiateMesh(Vector3[] points, string name, GameObject root, int meshInd, int nPoints)
    {
        // Create Mesh
        GameObject pointGroup = new GameObject (name + meshInd);
        pointGroup.AddComponent<MeshFilter>();
        pointGroup.AddComponent<MeshRenderer>();
        pointGroup.renderer.material = null;//matVertex;

        pointGroup.GetComponent<MeshFilter>().mesh = CreateMesh(points, meshInd, nPoints, POINT_LIMIT);
        pointGroup.transform.parent = root.transform;

        // Store Mesh
        //UnityEditor.AssetDatabase.CreateAsset(pointGroup.GetComponent<MeshFilter> ().mesh, "Assets/Resources/PointCloudMeshes/" + filename + @"/" + filename + meshInd + ".asset");
        //UnityEditor.AssetDatabase.SaveAssets ();
        //UnityEditor.AssetDatabase.Refresh();
    }

    private static Mesh CreateMesh(Vector3[] points, int id, int nPoints, int limitPoints)
    {    
        Mesh mesh = new Mesh ();
        
        Vector3[] myPoints = new Vector3[nPoints]; 
        int[] indecies = new int[nPoints];
        Color[] myColors = new Color[nPoints];

        for(int i=0;i<nPoints;++i) {
            myPoints[i] = points[id*POINT_LIMIT + i];
            indecies[i] = i;
            myColors[i] = Color.white;
        }


        mesh.vertices = myPoints;
        mesh.colors = myColors;
        mesh.SetIndices(indecies, MeshTopology.Points,0);
        mesh.uv = new Vector2[nPoints];
        mesh.normals = new Vector3[nPoints];

        return mesh;
    }
}
