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

		Debug.Log (inputStr);

		byte[] input = Encoding.UTF8.GetBytes(inputStr);
		HTTP.Request request = new HTTP.Request( "post", url + "/spheres", input );
		request.AddHeader("Content-Type", "application/json");
		request.Send( ( req ) => {
			Debug.Log( req.response.Text );
		});
	}

	public void UpdateTranslationSpeed(Vector3 pos, FlyNavigator navigator, Transform marker = null)
	{
		Hashtable json = new Hashtable();
		json.Add("x", pos.x);
		// TODO configure invert
		json.Add("y", pos.y);
		json.Add("z", pos.z);

		HTTP.Request request = new HTTP.Request( "post", url + "/velocity", json );
		request.Send( ( req ) => {
			
			//Debug.Log (req.response.Text);
			JSONObject obj = new JSONObject( req.response.Text );
			float speed = float.Parse(obj.GetField("velocity").ToString());
			navigator.SetTranslationSpeed(Mathf.Max(speed / /*TODO remove*/5.0f, 0.1f));

			if(marker)
			{
				JSONObject nearest = obj.GetField("nearest");
				float x = float.Parse(nearest.GetField("x").ToString());
				float y = float.Parse(nearest.GetField("z").ToString());
				float z = float.Parse(nearest.GetField("y").ToString());
				marker.position = new Vector3(x,y,z);
			}
		});
	}
}
