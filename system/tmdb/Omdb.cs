using Formo;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using System;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace Seyyedi.RemoteMpc
{
	public class Omdb
	{
		public class SearchResults
		{
			public List<SearchResult> Search { get; set; }
		}

		public class SearchResult
		{
			public string Title { get; set; }
			public string Year { get; set; }
			public string imdbID { get; set; }
			public string Type { get; set; }
		}

		protected Config _config;
		protected HttpClient _http;

		public Omdb()
		{
			_config = new Config();
			_http = new HttpClient();
		}

		public async Task<SearchResult> Search(string query)
		{
			var url = string.Format("http://www.omdbapi.com/?s={0}&r=JSON", query);
			var response = await _http.GetAsync(url);

			var respContent = await response.Content.ReadAsStringAsync();

			if (!response.IsSuccessStatusCode)
			{
				System.Console.WriteLine("request to {0} failed: {2} {3}", url, response.StatusCode, response.ReasonPhrase);
			}

			var results = JsonConvert.DeserializeObject<SearchResults>(respContent);

			if (results.Search.Count > 0)
			{
				return results.Search[0];
			}

			return null;
		}
	}
}
