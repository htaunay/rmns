using UnityEngine;
using System.Collections;

public class Planet : MonoBehaviour
{
	private Camera camera = null;

	private float scaledRadius = 0;

	private float rotationSpeed = 0;

	private float distanceToSun = 0;

	[SerializeField]
	private float yearInEarthDays = 0;

	[SerializeField]
	private double approximateRadiusKm = 0;
	
	[SerializeField]
	private float distanceAu = 0;

	[SerializeField]
	private Material material = null;
	
	[SerializeField]
	private Color color = Color.black;

	private void Start ()
	{
		camera = GameObject.Find("Camera").GetComponent<Camera>();
		// TODO check if exists

		if(approximateRadiusKm > 0)
		{
			scaledRadius = Scales.Instance.GetScaledValue(approximateRadiusKm);
			transform.localScale *= (scaledRadius * 2);
		}

		if(yearInEarthDays > 0)
			rotationSpeed = Scales.Instance.GetRotationSpeed(yearInEarthDays);

		if(distanceAu > 0)
			distanceToSun = Scales.Instance.GetScaledAu() * distanceAu;

		if(material != null)
		{
			GetComponent<MeshRenderer>().material = material;
			//CreatePoint(gameObject);
		}
	}
	
	// Update is called once per frame
	private void Update ()
	{
		// Maybe someday
		//transform.Rotate(Vector3.up, RotationSpeed * Time.deltaTime);

		if(rotationSpeed > 0)
		{
			float radians = GetAngle() + (rotationSpeed * Time.deltaTime);
			if(radians >= (2 * Mathf.PI)) radians -= (2 * Mathf.PI);

			Vector3 newPos = Vector3.zero;
			newPos.x = distanceToSun * Mathf.Sin(radians);
			newPos.z = distanceToSun * Mathf.Cos(radians);

			transform.position = newPos;
		}
	}

	private void OnGUI()
	{
		Vector3 screenpos = camera.WorldToScreenPoint(transform.position);
		if(screenpos.z > 0)
		{
			float distanceInAu = Vector3.Distance(transform.position, camera.transform.position);
			double distanceInKm = Scales.Instance.GetRealValue(distanceInAu);

			string text = gameObject.name + "\n" + Scales.Instance.FormatDistanceText(distanceInKm);
			GUI.Label(new Rect(screenpos.x, camera.pixelHeight - screenpos.y, 100, 40), text);
		}
	}

	private void OnDrawGizmos()
	{
		UnityEditor.Handles.color = color;
		UnityEditor.Handles.DrawWireDisc(Vector3.zero, Vector3.up, distanceToSun);
	}

	private float GetAngle()
	{
		return Mathf.Atan2(transform.position.x, transform.position.z);
	}

	private void CreatePoint(GameObject root)
	{
		// Create Mesh
		GameObject pointObj = new GameObject ("Planet Core");
		pointObj.AddComponent<MeshFilter>();
		pointObj.AddComponent<MeshRenderer>();
		pointObj.renderer.material = material;

		Mesh mesh = new Mesh ();
		mesh.vertices = new Vector3[]{Vector3.zero,Vector3.right,Vector3.up};
		mesh.colors = new Color[]{Color.white,Color.white,Color.white};
		mesh.SetIndices(new int[]{0,1,2}, MeshTopology.Points, 0);
		mesh.uv = new Vector2[3];
		mesh.normals = new Vector3[3];

		pointObj.GetComponent<MeshFilter>().mesh = mesh;
		pointObj.transform.parent = root.transform;
		pointObj.transform.localPosition = Vector3.zero;
	}
}
