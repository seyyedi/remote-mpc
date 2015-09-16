namespace Seyyedi.RemoteMpc
{
	public class MpcStatus
	{
		public string WindowTitle { get; set; }
		public string State { get; set; }
		public int CurrentTimeMs { get; set; }
		public string CurrentTime { get; set; }
		public int TotalLengthMs { get; set; }
		public string TotalLength { get; set; }
		public bool Muted { get; set; }
		public int Volume { get; set; }
		public string File { get; set; }

		public static MpcStatus Parse(string raw)
		{
			var status = raw
				.Substring(9, raw.Length - 10)
				.Replace("\"", string.Empty)
				.Split(',');

			return new MpcStatus
			{
				WindowTitle = status[0].Trim(),
				State = status[1].Trim(),
				CurrentTimeMs = int.Parse(status[2]),
				CurrentTime = status[3].Trim(),
				TotalLengthMs = int.Parse(status[4]),
				TotalLength = status[5].Trim(),
				Muted = int.Parse(status[6]) == 1,
				Volume = int.Parse(status[7]),
				File = status[8].Trim()
			};
		}
	}
}
