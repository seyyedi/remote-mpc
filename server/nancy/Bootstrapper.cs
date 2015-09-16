using Nancy;
using Nancy.Bootstrappers.Autofac;
using Nancy.Conventions;
using Nancy.Json;

namespace Seyyedi.RemoteMpc
{
	public class Bootstrapper : AutofacNancyBootstrapper
	{
		protected override byte[] FavIcon
		{
			get { return null; }
		}

		protected override Autofac.ILifetimeScope GetApplicationContainer()
		{
			return Program.Kernel;
		}

		protected override void ConfigureConventions(NancyConventions conventions)
		{
			JsonSettings.MaxJsonLength = 1024 * 1024 * 1024;

			base.ConfigureConventions(conventions);
		}
	}
}