using Formo;
using System.IO;

namespace Seyyedi.RemoteMpc
{
	public class Config
	{
		private static Config _instance;

		public string Html5 { get; protected set; }
		public string Url { get; protected set; }
		public string MpcUrl { get; protected set; }
		public string MediaLibrary { get; protected set; }

		public Config()
		{
			EnsureInstance();

			Html5 = _instance.Html5;
			Url = _instance.Url;
			MpcUrl = _instance.MpcUrl;
			MediaLibrary = _instance.MediaLibrary;
		}

		private Config(dynamic configuration)
		{
			Html5 = (string)configuration.html5;
			Url = (string)configuration.Url;
			MpcUrl = (string)configuration.MpcUrl;
			MediaLibrary = (string)configuration.MediaLibrary;
		}

		void EnsureInstance()
		{
			if (_instance == null)
			{
				_instance = new Config(
					new Configuration()
				);
			}
		}
	}
}
