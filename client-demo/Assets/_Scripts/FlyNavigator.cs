using UnityEngine;
using System.Collections;

public class FlyNavigator : MonoBehaviour
{
	[SerializeField]
	private bool Activate = false;

	private int activateState = 0;

	[SerializeField]
	private float translationSpeed = 1;

	[SerializeField]
	private float rotationSpeed = 50;

	private void OnGUI ()
	{
		transform.eulerAngles += GetRotation();
		transform.eulerAngles = new Vector3(transform.eulerAngles.x, transform.eulerAngles.y, 0.0f);

		transform.Translate(GetTranslation());

		if(Input.GetKeyUp(KeyCode.M))
		{
			activateState++;
			if(activateState >= 2)
			{
				activateState = 0;
				Activate = !Activate;
			}
		}
	}

	private Vector3 GetRotation()
	{
		Vector3 rotation = Vector3.zero;

		rotation += Vector3.up * Input.GetAxis("Mouse X");
		rotation += Vector3.left * Input.GetAxis("Mouse Y");

		return rotation * rotationSpeed * Mathf.Clamp(Time.deltaTime, 0.0f, 20.0f);
	}
	
	private Vector3 GetTranslation()
	{
		Vector3 translation = Vector3.zero;

		if (Input.GetKey (KeyCode.A)) translation += Vector3.left;
		if (Input.GetKey (KeyCode.D)) translation += Vector3.right;

		if(Input.GetKey (KeyCode.LeftShift))
		{
			if (Input.GetKey (KeyCode.W)) translation += Vector3.up;
			if (Input.GetKey (KeyCode.S)) translation += Vector3.down;
		}
		else
		{
			if (Input.GetKey (KeyCode.W)) translation += Vector3.forward;
			if (Input.GetKey (KeyCode.S)) translation += Vector3.back;
		}

		return translation.normalized * translationSpeed * Time.deltaTime;
	}

	public void SetTranslationSpeed(float speed)
	{
		translationSpeed = speed;
	}

	private void FixedUpdate()
	{
		if(Activate)
			Server.Instance.UpdateTranslationSpeed(transform.position, this);
	}
}
