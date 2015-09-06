using UnityEngine;
using System.Collections;

public class PointRegisterer : MonoBehaviour {

	void FixedUpdate ()
	{
		HTTP.Request someRequest = new HTTP.Request( "get", "http://rmnsvm.cloudapp.net:8081" );
		someRequest.Send( ( request ) => {
			// parse some JSON, for example:
			//JSONObject thing = new JSONObject( request.response.Text );
			Debug.Log(request.response.Text);
			//Debug.Log( request.response.Text );
		});
	}
}
