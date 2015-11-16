using UnityEngine;
using System.Text;
using System.Collections;

public class Server : MonoBehaviour {

	#region Singleton
	
	protected Server() {}
	
	public static Server Instance;
	
	private void Awake()
	{
		Instance = this;
	}
	
	#endregion

	private bool initialized = false;
	
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

	public bool IsInitialized()
	{
		return initialized;
	}

	public void RegisterSphere(int id, Vector3 center, float radius)
	{
		string inputStr = "[{\"id\":" + id + ", " + 
			"\"center\": {" + 
			"\"x\":" + center.x + ", " + 
			"\"y\":" + center.y + ", " +
			"\"z\":" + center.z + "}, " +
			"\"radius\":" + radius + "}]";

		// LOGGER Debug.Log (inputStr);

		byte[] input = Encoding.UTF8.GetBytes(inputStr);
		HTTP.Request request = new HTTP.Request( "post", url + "/spheres", input );
		request.AddHeader("Content-Type", "application/json");
		request.Send( ( req ) => {
			// LOGGER Debug.Log( req.response.Text );
		});
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

	public void UpdateTranslationSpeed(Vector3 pos, FlyNavigator navigator, Transform marker = null)
	{
		Hashtable json = new Hashtable();

		Hashtable posObj = new Hashtable();
		posObj.Add("x", pos.x);
		// TODO configure invert
		posObj.Add("y", pos.y);
		posObj.Add("z", pos.z);
		json.Add("pos", posObj);

		ArrayList mv = new ArrayList();
		ArrayList proj = new ArrayList();
		Matrix4x4 camMv = Camera.main.worldToCameraMatrix;
		Matrix4x4 camProj = Camera.main.projectionMatrix;

		for(int i = 0; i < 16; i++)
		{
			mv.Add(camMv[i]);
			proj.Add(camProj[i]);
		}

		json.Add("mv", mv);
		json.Add("proj", proj);

		HTTP.Request request = new HTTP.Request( "post", url + "/velocity", json );
		request.Send( ( req ) => {
			
			// TODO LOGGER
			Debug.Log (req.responseTime);
			JSONObject result = new JSONObject( req.response.Text ).GetField("result");
			float speed = float.Parse(result.GetField("velocity").ToString());
			navigator.SetTranslationSpeed(Mathf.Max(speed / /*TODO remove*/5.0f, 0.1f));

			if(marker)
			{
				JSONObject nearest = result.GetField("nearest");
				float x = float.Parse(nearest.GetField("x").ToString());
				float y = float.Parse(nearest.GetField("y").ToString());
				float z = float.Parse(nearest.GetField("z").ToString());
				marker.position = new Vector3(x,y,z);
			}
		});
	}
}
