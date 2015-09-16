using System.Collections.Generic;
using System.Linq;
using System.IO;

namespace Seyyedi.RemoteMpc
{
	public class MediaLibraryData
	{
		public List<MediaLibraryDirectory> Directories { get; set; }
		public List<MediaLibraryItem> Items { get; set; }

		public MediaLibraryData()
		{
			Directories = new List<MediaLibraryDirectory>();
			Items = new List<MediaLibraryItem>();
		}

		public void Update()
		{
			var orphanedItems = new List<MediaLibraryItem>();
			var newItems = new List<MediaLibraryItem>(Items.Count);

			foreach (var item in Items)
			{
				if (!Directory.Exists(item.Path))
				{
					System.Console.WriteLine("removing orphaned media library item {0} ({1})", item.Name, item.Path);
					orphanedItems.Add(item);
				}
				else
				{
					newItems.Add(item);
				}
			}

			Items = newItems;

			if (orphanedItems.Count > 0)
			{
				System.Console.WriteLine("{0} items removed from media library", orphanedItems.Count);
			}

			Directories
				.ForEach(d =>
				{
					new DirectoryInfo(d.Path)
						.GetDirectories()
						.Where(mdi =>
							!Items.Exists(i =>
								i.Path == mdi.FullName
							)
						)
						.ForEach(mdi =>
						{
							System.Console.WriteLine("adding new media library item {0}", mdi.Name);

							var item = new MediaLibraryItem
							{
								Name = mdi.Name,
								Path = mdi.FullName
							};

							Items.Add(item);
						});
				});

			Inherit();
		}

		public void Inherit()
		{
			Items
				.ForEach(i =>
				{
					var parent = new DirectoryInfo(i.Path).Parent;

					var mediaDirectory = Directories
						.FirstOrDefault(d => new DirectoryInfo(d.Path).FullName == parent.FullName);

					if (mediaDirectory != null)
					{
						i.InheritedTags = mediaDirectory.Tags;
					}
					else
					{
						i.InheritedTags.Clear();
					}
				});
		}
	}
}
