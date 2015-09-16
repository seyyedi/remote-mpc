using System.Collections.Generic;
using Autofac;

namespace Seyyedi.RemoteMpc
{
	public class AutofacModule : Autofac.Module
	{
		protected override void Load(ContainerBuilder builder)
		{
			base.Load(builder);

			builder
				.Register(c => new Server(
					c.Resolve<IEnumerable<IService>>()
				))
				.SingleInstance()
				.As<Server>();

			builder
				.Register(c => new MediaLibrary())
				.SingleInstance()
				.As<IService>()
				.As<MediaLibrary>();

			builder
				.Register(c => new Mpc())
				.SingleInstance()
				.As<Mpc>();

			builder
				.Register(c => new Omdb())
				.SingleInstance()
				.As<Omdb>();
		}
	}
}
