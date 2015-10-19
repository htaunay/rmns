using UnityEngine;
using Object = UnityEngine.Object;

using System;
using System.Collections;
using System.Collections.Generic;

public class PointCloudLoader : MonoBehaviour
{
	private static int POINT_LIMIT = 65535;

	[SerializeField]
	private string project = "";

	[SerializeField]
	private float ratio = 1;

	[SerializeField]
	private Material material = null; 
	
	[SerializeField]
	private bool correction = false;
	
	[SerializeField]
	private bool invertYZ = false;

	[SerializeField]
	private bool scaleFromAU = false;

    public void Start()
    {
		Object[] files = Resources.LoadAll(project, typeof(TextAsset));
		// LOGGER Debug.Log("Loading " + files.Length + " file(s)" );

        GameObject parent = new GameObject("Points");
        foreach(Object file in files)
        {
            Create((TextAsset) file, parent);
        }
    }
	
	private void Create(TextAsset file, GameObject root)
	{
		Vector3[] points = LoadPoints(file);
		Server.Instance.RegisterPoints(points);

		int numGroups = Mathf.CeilToInt(points.Length * 1.0f / POINT_LIMIT * 1.0f);
		
		GameObject pointCloud = new GameObject(file.name);
		
		GameObject go;
		for (int i = 0; i < numGroups-1; i ++) {
			go = InstantiateMesh (points, file.name, pointCloud, i, POINT_LIMIT);
			go.transform.parent = root.transform;
		}
		go = InstantiateMesh (points, file.name, pointCloud, numGroups-1, points.Length- (numGroups-1) * POINT_LIMIT);
		go.transform.parent = root.transform;
	}
	
	private Vector3[] LoadPoints(TextAsset file)
	{
		string[] lines = file.text.Split('\n');
		// Ignore last blank line
		int numpoints = lines.Length-1;
		Vector3[] points = new Vector3[numpoints];
		
		for(int i = 0; i < numpoints; i++)
		{
			string[] pointList = lines[i].Split((char[])null, StringSplitOptions.RemoveEmptyEntries);
			if(pointList.Length != 3)
				throw new Exception("Invalid file format: " + file.name + " => " + i);
			
			Vector3 CORRECTION = (correction) ? new Vector3(388372.5625f, 7519702f, 0f) : new Vector3(0,0,0);
			

			Vector3 point = Vector3.zero;
			point.x = (float.Parse(pointList[0]) - CORRECTION.x) / ratio;
			if(invertYZ)
			{
				point.y = (float.Parse(pointList[2]) - CORRECTION.z) / ratio;
				point.z = (float.Parse(pointList[1]) - CORRECTION.y) / ratio;
			}
			else
			{
				point.y = (float.Parse(pointList[1]) - CORRECTION.y) / ratio;
				point.z = (float.Parse(pointList[2]) - CORRECTION.z) / ratio;
			}

			if(scaleFromAU)
				point *= Scales.Instance.GetScaledAu();
			
			points[i] = point;
		}
		
		return points;
	}
	
	// TODO remove legacy conventions
	private GameObject InstantiateMesh(Vector3[] points, string name, GameObject root, int meshInd, int nPoints)
	{
		// Create Mesh
		GameObject pointGroup = new GameObject (name + meshInd);
		pointGroup.AddComponent<MeshFilter>();
		pointGroup.AddComponent<MeshRenderer>();
		pointGroup.renderer.material = material;
		
		pointGroup.GetComponent<MeshFilter>().mesh = CreateMesh(points, meshInd, nPoints, POINT_LIMIT);
		pointGroup.transform.parent = root.transform;
		
		return pointGroup;
		// Store Mesh
		//UnityEditor.AssetDatabase.CreateAsset(pointGroup.GetComponent<MeshFilter> ().mesh, "Assets/Resources/PointCloudMeshes/" + filename + @"/" + filename + meshInd + ".asset");
		//UnityEditor.AssetDatabase.SaveAssets ();
		//UnityEditor.AssetDatabase.Refresh();
	}
	
	private Mesh CreateMesh(Vector3[] points, int id, int nPoints, int limitPoints)
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
