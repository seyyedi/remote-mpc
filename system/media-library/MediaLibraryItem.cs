using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Newtonsoft.Json;

namespace Seyyedi.RemoteMpc
{
	public class MediaLibraryItem
	{
		public string Name { get; set; }
		public string Path { get; set; }

		[JsonIgnore]
		public List<string> InheritedTags { get; set; }

		public List<string> Tags { get; set; }

		public IEnumerable<string> AllTags
		{
			get { return Tags.Concat(InheritedTags); }
		}

		public MediaLibraryItem()
		{
			InheritedTags = new List<string>();
			Tags = new List<string>();
		}

		public void Rename(string name)
		{
			var invalidPathChars = System.IO.Path
				.GetInvalidPathChars()
				.Concat(System.IO.Path
					.GetInvalidFileNameChars()
				)
				.ToArray();

			name = name.Replace(":", " - ");

			while (name.Contains("  "))
			{
				name = name.Replace("  ", " ");
			}

			var sb = new StringBuilder(name.Length);

			for (int i = 0; i < name.Length; i++)
			{
				var c = name[i];

				if (!invalidPathChars.Contains(c))
				{
					sb.Append(c);
				}
			}

			name = sb.ToString();

			var directory = new DirectoryInfo(Path);
			var path = System.IO.Path.Combine(directory.Parent.FullName, name);

			directory.MoveTo(path);

			Name = name;
			Path = path;
		}
	}
}
