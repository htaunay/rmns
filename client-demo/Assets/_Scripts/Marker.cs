using UnityEngine;
using System.Collections;

public class Marker : MonoBehaviour
{
	private Camera camera = null;

	private void Start()
	{
		camera = GameObject.Find("Camera").GetComponent<Camera>();
	}

	private void OnGUI()
	{
		Vector3 screenpos = camera.WorldToScreenPoint(transform.position);
		if(screenpos.z > 0)
		{
			int ypos = (int)(camera.pixelHeight - screenpos.y);
			ypos -= (gameObject.name == "VNearest") ? 80 : 40;
			GUI.Label(new Rect(screenpos.x, ypos, 80, 40), gameObject.name);
		}
	}
}
