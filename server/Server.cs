using Nancy.Hosting.Self;
using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using Seyyedi;

namespace Seyyedi.RemoteMpc
{
	public class Server
	{
		protected Config _config;
		protected Uri[] _uris;

		protected NancyHost _nancy;
		protected IEnumerable<IService> _services;

		public Server(IEnumerable<IService> services)
		{
			_config = new Config();

			_uris = _config.Url
				.Split(' ')
				.Select(u => new Uri(u))
				.ToArray();

			_services = services;
		}

		protected void EnsureInstallation()
		{
			
		}

		public void Run()
		{
			EnsureInstallation();

			foreach (var service in _services)
			{
				Console.WriteLine("Starting service {0}", service.ServiceName);
				service.Start();
			}

			_nancy = new NancyHost(_uris);
			_nancy.Start();

			Console.WriteLine("Running server at {0}", _uris
				.Select(u => u.ToString())
				.Join(", ")
			);

			Console.ReadLine();

			Console.WriteLine("Stopping server");
			_nancy.Stop();

			foreach (var service in _services)
			{
				Console.WriteLine("Stopping service {0}", service.ServiceName);
				service.Stop();
			}
		}
	}
}
