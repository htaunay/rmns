using UnityEngine;
using System.Collections;

public class SphereRegisterer : MonoBehaviour {

	[SerializeField]
	private int id;

	private void Start()
	{
		id = (int)(Random.value * 1000000);
	}

	private void FixedUpdate ()
	{
		if(Server.Instance.IsInitialized())
			Server.Instance.RegisterSphere(id, transform.position, transform.localScale.x / 2);
	}
}
