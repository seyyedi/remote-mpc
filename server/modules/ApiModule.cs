using Nancy;
using Nancy.ModelBinding;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Diagnostics;

namespace Seyyedi.RemoteMpc
{
	public class ApiModule : NancyModule
	{
		protected Config _config;

		protected Mpc _mpc;
		protected MediaLibrary _mediaLibrary;
		protected Omdb _omdb;

		public ApiModule(Mpc mpc, MediaLibrary mediaLibrary, Omdb omdb)
			: base("/api")
		{
			_config = new Config();

			_mpc = mpc;
			_mediaLibrary = mediaLibrary;
			_omdb = omdb;

			Play();
			//RegisterApiMpc("play", 887);
			RegisterApiMpc("pause", 888);

			RegisterApiMpc("volume-up", 907);
			RegisterApiMpc("volume-down", 908);

			NextFile();

			RegisterApiMpc("fullscreen", 830);
			RegisterApiMpc("back", 901);
			RegisterApiMpc("forward", 902);

			GetLibrary();
			GetExtendedItem();
			PlayFile();

			UpdateLibrary();
			ScanItem();
		}

		protected void RegisterApi(string token, Action<dynamic> handler)
		{
			RegisterApi(token, p =>
			{
				handler(p);

				return string.Empty;
			});
		}

		protected void RegisterApi(string token, Func<dynamic, dynamic> handler)
		{
			Post[string.Format("/{0}", token)] = p =>
			{
				return handler(p);
			};
		}

		protected void RegisterApiAsync(string token, Func<dynamic, Task> handler)
		{
			RegisterApiAsync(token, async p =>
			{
				await handler(p);

				return string.Empty;
			});
		}

		protected void RegisterApiAsync(string token, Func<dynamic, Task<dynamic>> handler)
		{
			Post[string.Format("/{0}", token), true] = async (p, ct) =>
			{
				Console.WriteLine("async api call: {0}", token);

				return await handler(p);
			};
		}

		protected void RegisterApiMpc(string token, int command)
		{
			RegisterApiAsync(token, async p =>
			{
				await _mpc.SendCommand(command);
			});
		}

		protected void EnsureMpcInstance()
		{
			var processes = Process.GetProcessesByName("mpc-hc64");

			if (processes.Length == 0)
			{
				Process.Start(@"C:\Program Files\MPC-HC\mpc-hc64.exe");
			}
		}

		protected void Play()
		{
			RegisterApiAsync("play", async p =>
			{
				EnsureMpcInstance();

				await _mpc.SendCommand(887);
			});
		}

		protected void NextFile()
		{
			RegisterApiAsync("next-file", async p =>
			{
				var status = await _mpc.GetStatus();
				var currentFile = new FileInfo(status.File);

				var nextFile = _mediaLibrary.GetNextFile(currentFile);

				if (nextFile != null)
				{
					Console.WriteLine(nextFile.FullName);

					await _mpc.Send("browser.html?" + string.Format("path={0}", nextFile.FullName), string.Empty);
				}

				return new
				{
					status = status,
					nextFile = nextFile == null
						? "null"
						: nextFile.FullName
				};
			});
		}

		protected void GetLibrary()
		{
			RegisterApi("get-library", p =>
			{
				var library = _mediaLibrary.Data;

				return new
				{
					library = new
					{
						items = library.Items
							.OrderBy(i => i.Name)
							.Select(i => new
							{
								name = i.Name,
								//path = i.Path,
								tags = i.AllTags
							}),
						tags = library.Directories
							.SelectMany(d => d.Tags)
							.Concat(library.Items
								.SelectMany(i => i.Tags)
							)
							.Distinct()
							.OrderBy(t => t)
					}
				};
			});
		}

		protected void GetExtendedItem()
		{
			RegisterApi("get-extended-item", p =>
			{
				var data = this.Bind<Dictionary<string, object>>();
				var name = (string)data["name"];

				var item = _mediaLibrary.Data.Items.Find(i => i.Name == name);

				if (item != null)
				{
					var itemDirectory = new DirectoryInfo(item.Path);

					return new
					{
						extended = new
						{
							groups = itemDirectory
								.EnumerateFilesRecursive()
								.Where(f => MediaLibrary.MediaExtensions.Contains(f.Extension.ToLower()))
								.GroupBy(f => f.Directory.FullName.Substring(itemDirectory.FullName.Length).TrimStart(Path.DirectorySeparatorChar))
								.OrderBy(g => g.Key)
								.Select(g => new
								{
									name = g.Key,
									files = g
										.Select(f => new
										{
											name = f.Name,
											path = f.FullName
										})
								})
						}
					};
				}

				return null;
			});
		}

		protected void PlayFile()
		{
			RegisterApiAsync("play-file", async p =>
			{
				var data = this.Bind<Dictionary<string, object>>();
				var path = (string)data["path"];

				if (File.Exists(path))
				{
					await _mpc.Send("browser.html?" + string.Format("path={0}", path), string.Empty);
				}
			});
		}

		protected void UpdateLibrary()
		{
			RegisterApiAsync("update-library", async p =>
			{
				_mediaLibrary.Update();
			});
		}

		protected void ScanItem()
		{
			RegisterApiAsync("scan-item", async p =>
			{
				var data = this.Bind<Dictionary<string, object>>();
				var name = (string)data["name"];
				var update = (bool)data["update"];

				var item = _mediaLibrary.Data.Items.Find(i => i.Name == name);

				if (item != null)
				{
					if (name.EndsWith(")"))
					{
						var pos = name.LastIndexOf("(");

						if (pos != -1)
						{
							name = name
								.Substring(0, pos)
								.Trim();
						}
					}

					name = name
						.Replace("720p", string.Empty)
						.Replace("1080p", string.Empty)
						.Trim();

					var result = await _omdb.Search(name);

					if (result != null)
					{
						Console.WriteLine(
							JsonConvert.SerializeObject(result)
						);

						if (update)
						{
							var newName = string.Format("{0} ({1})", result.Title, result.Year);

							if (item.Name != newName)
							{
								item.Rename(newName);
							}
						}
					}
				}

				return null;
			});
		}
	}
}
