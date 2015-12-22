using UnityEngine;
using System.Collections;

public class SphereInfo
{
	public SphereInfo(int id, Vector3 pos, float radius)
	{
		this.id = id;
		this.pos = pos;
		this.radius = radius;
	}

	public int id;
	public Vector3 pos;
	public float radius;
}

