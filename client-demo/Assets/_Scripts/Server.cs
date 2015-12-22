using UnityEngine;
using System;
using System.Text;
using System.Collections;
using System.Collections.Generic;

public class Server : MonoBehaviour {

	// TODO DEBUG
	public GameObject nearest;
	public GameObject vnearest;
	public GameObject[] points;

	private JSONObject result;
	private bool waitingForResponse = false;

	private Dictionary<int, SphereInfo> spheres = new Dictionary<int, SphereInfo>();

	#region Singleton
	
	protected Server() {}
	
	public static Server Instance;
	
	private void Awake()
	{
		Instance = this;
	}
	
	#endregion

	private bool initialized = false;
	private double lastTimestamp = 0;
	
	private int MAX_POINTS_PER_REQUEST = 1024;

	[SerializeField]
	private string url = "http://192.168.88.128:8081";
	
	private void Start()
	{
		HTTP.Request request = new HTTP.Request( "get", url + "/reset");
		request.Send( ( req ) => {

			if(req.response.status == 200)
			{
				initialized = true;
			}
			else
			{
				// TODO
			}
		});
	}

	private void OnGUI()
	{
		/*if(!result) return;

		string distance 		= result.GetField("distance").ToString();
		string velocity 		= result.GetField("velocity").ToString();
		string cos_similarity 	= result.GetField("cos_similarity").ToString();
		string multiplier 		= result.GetField("multiplier").ToString();
		string times 			= result.GetField("times").ToString();

		string log =
			"Distance: " + distance + "\n" + 
			"Velocity: " + velocity + "\n" + 
			"Cos Similarity: " + cos_similarity + "\n" + 
			"Multiplier: " + multiplier + "\n" + 
			"Times: " + times; 

		GUI.Label(new Rect(20, 20, 500, 100), log);*/
	}

	private void FixedUpdate()
	{
		UpdateSpheres();
	}

	public bool IsInitialized()
	{
		return initialized;
	}

	public void RegisterSphere(SphereInfo sphere)
	{
		spheres[sphere.id] = sphere;
	}

	public void RegisterPoints(Vector3[] points)
	{
		int counter = 0;
		string flow = "[";
		for(int i = 0; i < points.Length; i++)
		{
			if(counter != 0)
				flow += ",";
			flow += points[i].x + "," + points[i].y + "," + points[i].z;
			
			counter++;
			if(counter >= MAX_POINTS_PER_REQUEST)
			{
				flow += "]";
				byte[] input = Encoding.UTF8.GetBytes(flow);
				HTTP.Request someRequest = new HTTP.Request( "post", url + "/points", input );
				someRequest.AddHeader("Content-Type", "application/json");
				someRequest.Send( ( request ) => {
					
					// LOGGER Debug.Log( request.response.Text );
				});
				
				flow = "[";
				counter = 0;
			}
		}
		// TODO regiser last batch of points
		flow += "]";
	}

	public void UpdateTranslationSpeed(Vector3 pos, FlyNavigator navigator)
	{
		if(waitingForResponse)
			return;

		Hashtable json = new Hashtable();

		Transform cameraTransform = Camera.main.transform;
		json.Add("eye", BuildVec3Hashtable(cameraTransform.position));
		json.Add("center", BuildVec3Hashtable(cameraTransform.position + cameraTransform.forward));
		json.Add("up", BuildVec3Hashtable(cameraTransform.up));
		json.Add("fovy", Camera.main.fieldOfView);
		json.Add("aspect", Camera.main.aspect);
		json.Add("znear", Camera.main.nearClipPlane);
		json.Add("zfar", Camera.main.farClipPlane);

		//ArrayList mv = new ArrayList();
		//ArrayList proj = new ArrayList();
		//Matrix4x4 camMv = Camera.main.worldToCameraMatrix;
		//Matrix4x4 camProj = Camera.main.projectionMatrix;
		//Debug.Log (Camera.main.fieldOfView + " " + Camera.main.aspect);
		//Debug.Log (camProj);

		//for(int i = 0; i < 16; i++)
		//{
		//	mv.Add(camMv[i]);
		//	proj.Add(camProj[i]);
		//}

		//json.Add("mv", mv);
		//json.Add("proj", proj);

		HTTP.Request request = new HTTP.Request( "post", url + "/velocity", json );
		waitingForResponse = true;

		request.Send( ( req ) => {

			waitingForResponse = false;

			// TODO LOGGER Debug.Log (req.response.Text);
			JSONObject responseObj = new JSONObject( req.response.Text );
			double timestamp = responseObj.GetField("timestamp").n;

			if(timestamp <= lastTimestamp) return;
			else lastTimestamp = timestamp;

			result = responseObj.GetField("result");
			float speed = float.Parse(result.GetField("velocity").ToString());

			navigator.SetTranslationSpeed(Mathf.Max(speed / /*TODO remove*/5.0f, 0.1f));

			if(nearest)
			{
				JSONObject nearestObj = result.GetField("nearest");
				if(!nearestObj.IsNull)
				{
					float x = float.Parse(nearestObj.GetField("x").ToString());
					float y = float.Parse(nearestObj.GetField("y").ToString());
					float z = float.Parse(nearestObj.GetField("z").ToString());
					nearest.transform.position = new Vector3(x,y,z);
				}
				else
				{
					nearest.transform.position = Vector3.zero;
				}
			}
			
			if(vnearest)
			{
				JSONObject vnearestObj = result.GetField("vnearest");
				if(!vnearestObj.IsNull)
				{
					float x = float.Parse(vnearestObj.GetField("x").ToString());
					float y = float.Parse(vnearestObj.GetField("y").ToString());
					float z = float.Parse(vnearestObj.GetField("z").ToString());
					vnearest.transform.position = new Vector3(x,y,z);
				}
				else
				{
					vnearest.transform.position = Vector3.zero;
				}
			}

//			JSONObject pointsObj = obj.GetField("points");
//			for(int i = 0; i < 8; i++)
//			{
//				JSONObject pointObj = pointsObj.list[i];
//				float x = float.Parse(pointObj.GetField("x").ToString());
//				float y = float.Parse(pointObj.GetField("y").ToString());
//				float z = float.Parse(pointObj.GetField("z").ToString());
//				points[i].transform.position = new Vector3(x,y,z);
//			}
		});
	}

	private void UpdateSpheres()
	{
		/*string inputStr = "[{\"id\":" + id + ", " +
			"\"center\": {" +
			"\"x\":" + center.x + ", " +
			"\"y\":" + center.y + ", " +
			"\"z\":" + center.z + "}, " +
			"\"radius\":" + radius + "}]";*/

		bool first = true;
		string inputStr = "[";

		foreach(KeyValuePair<int, SphereInfo> pair in spheres)
		{
			if(first) first = false;
			else inputStr += ",";

			SphereInfo sphere = pair.Value;
			inputStr += "{\"id\":" + sphere.id + ", " +
						"\"center\": {" +
						"\"x\":" + sphere.pos.x + ", " +
						"\"y\":" + sphere.pos.y + ", " +
						"\"z\":" + sphere.pos.z + "}, " +
						"\"radius\":" + sphere.radius + "}";
		}

		inputStr += "]";

		// LOGGER Debug.Log (inputStr);


		byte[] input = Encoding.UTF8.GetBytes(inputStr);
		HTTP.Request request = new HTTP.Request( "post", url + "/spheres", input );
		request.AddHeader("Content-Type", "application/json");
		request.Send( ( req ) => {
			// LOGGER Debug.Log( req.response.Text );
		});
	}

	private Hashtable BuildVec3Hashtable(Vector3 vec3)
	{
		Hashtable vec3Obj = new Hashtable();
		vec3Obj.Add("x", vec3.x);
		vec3Obj.Add("y", vec3.y);
		vec3Obj.Add("z", vec3.z);

		return vec3Obj;
	}
}
