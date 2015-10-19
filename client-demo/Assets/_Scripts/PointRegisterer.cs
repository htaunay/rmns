using System.Text;
using UnityEngine;
using System.Collections;

public class PointRegisterer : MonoBehaviour {

	[SerializeField]
	private string url = "http://rmnsvm.cloudapp.net:8081";

	private FlyNavigator navigator = null;

	[SerializeField]
	public bool Activate = false;

	private Transform sphere;

	private void Start()
	{
		navigator = GetComponent<FlyNavigator>();

		sphere = GameObject.Find("Nearest").transform;
	}

	private void FixedUpdate()
	{
		if(Activate)
		{
			Vector3 pos = transform.position;
			Hashtable json = new Hashtable();
			json.Add("x", pos.x);
			// TODO configure invert
			json.Add("y", pos.z);
			json.Add("z", pos.y);

			// When you pass a Hashtable as the third argument, JSON-encoding is assumed
			// i.e. automatic Content-Type = application/json in header
			HTTP.Request someRequest = new HTTP.Request( "post", url + "/velocity", json );
			someRequest.Send( ( request ) => {

				Debug.Log (request.response.Text);
				JSONObject obj = new JSONObject( request.response.Text );
				float speed = float.Parse(obj.GetField("velocity").ToString());
				navigator.SetTranslationSpeed(Mathf.Max(speed / /*TODO remove*/5.0f, 0.1f));

				JSONObject nearest = obj.GetField("nearest");
				float x = float.Parse(nearest.GetField("x").ToString());
				float y = float.Parse(nearest.GetField("z").ToString());
				float z = float.Parse(nearest.GetField("y").ToString());
				sphere.position = new Vector3(x,y,z);
			});
		}
	}

	public void RegisterPoints(Vector3[] points)
	{
		int MAX_LENGTH = 1024;
		int counter = 0;
		string flow = "[";
		for(int i = 0; i < points.Length; i++)
		{
			if(counter != 0)
				flow += ",";
			flow += points[i].x + "," + points[i].z + "," + points[i].y;

			counter++;
			if(counter >= MAX_LENGTH)
			{
				flow += "]";
				byte[] input = Encoding.UTF8.GetBytes(flow);
				HTTP.Request someRequest = new HTTP.Request( "post", url + "/points", input );
				someRequest.AddHeader("Content-Type", "application/json");
				someRequest.Send( ( request ) => {
		
					Debug.Log( request.response.Text );
				});

				flow = "[";
				counter = 0;
			}
		}
		// TODO regiser last batch of points
		flow += "]";
	}
}
