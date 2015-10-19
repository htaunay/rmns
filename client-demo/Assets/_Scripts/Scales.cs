using UnityEngine;
using System.Collections;

public class Scales : MonoBehaviour
{
	#region Singleton

	protected Scales() {}

	public static Scales Instance;
	
	void Awake()
	{
		Instance = this;
	}

	#endregion

	private int YEAR = 365;

	[SerializeField]
	private double auToKms = 1.5e8;

	[SerializeField]
	private double yearToSecs = 10;

	[SerializeField]
	private double scale = 1e7;

	/// <summary>
	/// TODO
	/// </summary>
	/// <returns>The au to kms.</returns>
	public float GetScaledValue(double value) { return (float)(value / scale); }

	/// <summary>
	/// TODO
	/// </summary>
	/// <returns>The au to kms.</returns>
	public float GetScaledAu() { return (float)(auToKms / scale); }
	
	/// <summary>
	/// TODO - angles per sec
	/// </summary>
	/// <returns>The au to kms.</returns>
	public float GetRotationSpeed(float days)
	{
		float rotationsPerSec = (float)((YEAR / days) / yearToSecs);
		return rotationsPerSec * 2 * Mathf.PI; // randians per sec
	}
}