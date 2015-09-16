using System.Threading.Tasks;

namespace Seyyedi.RemoteMpc
{
	public interface IService
	{
		string ServiceName { get; }

		void Start();
		void Stop();
	}
}
