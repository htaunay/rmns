using UnityEngine;
using System.Collections;

public class PointRegisterer : MonoBehaviour {

	private FlyNavigator navigator = null;

	private void Start()
	{
		navigator = GetComponent<FlyNavigator>();
	}

	private void FixedUpdate()
	{
		Vector3 pos = transform.position;
		Hashtable json = new Hashtable();
		json.Add("x", pos.x);
		// TODO configure invert
		json.Add("y", pos.z);
		json.Add("z", pos.y);

		// When you pass a Hashtable as the third argument, JSON-encoding is assumed
		// i.e. automatic Content-Type = application/json in header
		HTTP.Request someRequest = new HTTP.Request( "post", "http://rmnsvm.cloudapp.net:8081", json );
		someRequest.Send( ( request ) => {

			JSONObject obj = new JSONObject( request.response.Text );
			float speed = float.Parse(obj.GetField("speed").ToString());
			navigator.SetTranslationSpped(speed / 5.0f);
		});
	}
}
