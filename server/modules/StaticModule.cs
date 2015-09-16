using Formo;
using Nancy;
using Nancy.ModelBinding;
using Nancy.Responses;
using System.IO;
using System.Linq;

namespace Seyyedi.RemoteMpc
{
	public class StaticModule : NancyModule
	{
		protected void ScanFiles(string root, string path, bool recursive = true)
		{
			var files = Directory.GetFiles(root);

			foreach (var file in files)
			{
				var name = new FileInfo(file).Name;

				Get[string.Format("{0}/{1}", path, name)] = p => StaticResponse(file);
			}

			if (recursive)
			{
				var directories = Directory.GetDirectories(root);

				foreach (var directory in directories)
				{
					var name = new DirectoryInfo(directory).Name;

					ScanFiles(directory, string.Format("{0}/{1}", path, name));
				}
			}
		}

		public StaticModule()
		{
			var config = new Config();

			ScanFiles(config.Html5, string.Empty);

			Get["/"] = p => StaticResponse(
				Path.Combine(config.Html5, "index.html")
			);

			Get["/media"] = p => StaticResponse(
				Path.Combine(config.Html5, "index.html")
			);

			Get["/js/all.js"] = p =>
			{
				return Response.AsText(
					string.Join("\n\n", Directory
						.GetFiles(Path.Combine(config.Html5, "js"), "*.js")
						.Select(f => File.ReadAllText(f))
					),
					"application/x-javascript"
				);
			};

			//Get["/media/{hash}/{ext}/{session}"] = p =>
			//{
			//	//var request = this.Bind<MediaRequest>();
			//	var session = this.GetSession((string)p.session);

			//	if (session == null)
			//	{
			//		return Response.Error("no session");
			//	}
			//	else
			//	{
			//		var path = config[session.Account].GetHashPath((string)p.hash);

			//		return StaticResponse(path, path + (string)p.ext);
			//	}
			//};
		}

		protected Response StaticResponse(string path, string virtualPath = null)
		{
			if (!File.Exists(path))
			{
				return null;
			}

			var contentType = MimeTypes.GetMimeType(virtualPath ?? path);

			if (path.EndsWith("favicon.ico"))
			{
				contentType = "image/x-icon";
			}

			return new StreamResponse(
				() => File.OpenRead(path),
				contentType
			);
		}
	}

	//public class MediaRequest
	//{
	//	public string hash { get; set; }
	//	public string ext { get; set; }
	//}
}
