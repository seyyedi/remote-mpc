using System;
using Autofac;

namespace Seyyedi.RemoteMpc
{
	class Program
	{
		public static Server Server { get; private set; }
		public static ILifetimeScope Kernel { get; private set; }

		static void Main(string[] args)
		{
			var builder = new ContainerBuilder();
			builder.RegisterModule<AutofacModule>();

			var container = builder.Build();

			using (Kernel = container.BeginLifetimeScope())
			{
				Server = Kernel.Resolve<Server>();

				try
				{
					Server.Run();
				}
				catch (Exception ex)
				{
					WriteException(ex);

					Console.WriteLine();
					Console.WriteLine("press any key to exit");
					Console.ReadLine();
				}
			}
		}

		public static void WriteException(Exception ex)
		{
			Console.WriteLine("[{0}] {1}\n{2}", ex.GetType().FullName, ex.Message, ex.StackTrace);
		}
	}
}
