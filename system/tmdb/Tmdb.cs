using Formo;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System;

namespace Seyyedi.RemoteMpc
{
	public class Tmdb
	{
		protected Config _config;
		protected HttpClient _http;

		public Tmdb()
		{
			_config = new Config();
			_http = new HttpClient();
		}

		public async Task<string> SendCommand(int code)
		{
			return await Send(
				"command.html",
				string.Format("wm_command={0}", code)
			);
		}

		public async Task<string> Send(string handler, string content)
		{
			var url = string.Format("{0}/{1}", _config.MpcUrl, handler);
			var reqContent = new StringContent(content);

			var response = await _http.PostAsync(url, reqContent);

			var respContent = await response.Content.ReadAsStringAsync();

			if (!response.IsSuccessStatusCode)
			{
				System.Console.WriteLine("request to {0} with content {1} failed: {2} {3}", url, content, response.StatusCode, response.ReasonPhrase);
			}

			return respContent;
		}

		public async Task<MpcStatus> GetStatus()
		{
			var raw = await Send("status.html", string.Empty);

			return MpcStatus.Parse(raw);
		}
	}
}
