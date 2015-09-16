using System.Collections.Generic;

namespace Seyyedi.RemoteMpc
{
	public class MediaLibraryDirectory
	{
		public string Path { get; set; }
		public List<string> Tags { get; set; }

		public MediaLibraryDirectory()
		{
			Tags = new List<string>();
		}
	}
}
