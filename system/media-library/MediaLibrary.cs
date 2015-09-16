using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Newtonsoft.Json;

namespace Seyyedi.RemoteMpc
{
	public class MediaLibrary : IService
	{
		protected Config _config;
		public MediaLibraryData Data { get; private set; }

		public static string[] MediaExtensions = new string[] { ".mkv", ".mp4", ".avi", ".wmv", ".m4v" };

		public string ServiceName
		{
			get { return "MediaLibrary"; }
		}

		public MediaLibrary()
		{
			_config = new Config();
		}

		public void Start()
		{
			Load();
		}

		public void Stop()
		{
			Save();
		}

		public void Load()
		{
			if (!File.Exists(_config.MediaLibrary))
			{
				Data = new MediaLibraryData();

				return;
			}

			var libraryJson = File.ReadAllText(_config.MediaLibrary, Encoding.UTF8);

			Data = JsonConvert.DeserializeObject<MediaLibraryData>(libraryJson);
			Data.Update();

			//Install();
		}

		protected void Install()
		{
			Data.Directories.Clear();
			Data.Items.Clear();

			Data.Directories.AddRange(new MediaLibraryDirectory[] {
				new MediaLibraryDirectory() {
					Path = @"D:\Archive\Movies",
					Tags = new List<string> { "Movies" }
				},
				new MediaLibraryDirectory() {
					Path = @"E:\Archive\Movies",
					Tags = new List<string> { "Movies" }
				},
				new MediaLibraryDirectory() {
					Path = @"Y:\Movies",
					Tags = new List<string> { "Movies" }
				},
				new MediaLibraryDirectory() {
					Path = @"D:\Archive\Episodes",
					Tags = new List<string> { "Episodes" }
				},
				new MediaLibraryDirectory() {
					Path = @"Y:\Episodes",
					Tags = new List<string> { "Episodes" }
				},
				new MediaLibraryDirectory() {
					Path = @"Z:\Episodes",
					Tags = new List<string> { "Episodes" }
				},
				new MediaLibraryDirectory() {
					Path = @"E:\Archive\Episodes",
					Tags = new List<string> { "Episodes" }
				},
				new MediaLibraryDirectory() {
					Path = @"E:\Archive\Docus",
					Tags = new List<string> { "Docus" }
				},
				new MediaLibraryDirectory() {
					Path = @"Z:\Docus",
					Tags = new List<string> { "Docus" }
				},
				new MediaLibraryDirectory() {
					Path = @"Z:\Standup",
					Tags = new List<string> { "Standup" }
				}
			});

			Data.Update();
		}

		public void Save()
		{
			if (Data == null)
			{
				throw new Exception("media library has not been loaded");
			}

			var libraryJson = JsonConvert.SerializeObject(Data);

			File.WriteAllText(_config.MediaLibrary, libraryJson, Encoding.UTF8);
		}

		public void Update()
		{
			Data.Update();
		}

		public FileInfo GetNextFile(DirectoryInfo currentDirectory, FileInfo currentFile)
		{
			var files = currentDirectory
				.GetFiles()
				.OrderBy(f => f.Name)
				.Where(f => MediaExtensions.Contains(
					f.Extension.ToLower()
				))
				.ToArray();

			if (currentFile != null)
			{
				var index = Array.FindIndex<FileInfo>(files,
					f => f.Name == currentFile.Name
				);

				if (index >= 0 && index < files.Length - 1)
				{
					return files[index + 1];
				}
			}
			else if (files.Length > 0)
			{
				return files[0];
			}

			return null;
		}

		public DirectoryInfo GetNextDirectory(DirectoryInfo currentDirectory)
		{
			var directories = currentDirectory.Parent
				.GetDirectories()
				.OrderBy(d => d.Name)
				.ToArray();

			var index = Array.FindIndex<DirectoryInfo>(directories,
				d => d.Name == currentDirectory.Name
			);

			if (index >= 0 && index < directories.Length - 1)
			{
				return directories[index + 1];
			}

			return null;
		}

		public FileInfo GetNextFile(FileInfo currentFile)
		{
			var nextFile = GetNextFile(currentFile.Directory, currentFile);

			if (nextFile == null)
			{
				var nextDirectory = currentFile.Directory;

				while (nextDirectory != null)
				{
					nextDirectory = GetNextDirectory(nextDirectory);

					if (nextDirectory != null)
					{
						nextFile = GetNextFile(nextDirectory, null);

						if (nextFile != null)
						{
							break;
						}
					}
				}
			}

			return nextFile;
		}
	}
}
