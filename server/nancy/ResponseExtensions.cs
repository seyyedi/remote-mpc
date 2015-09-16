using Nancy;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;

namespace Seyyedi.RemoteMpc
{
	public static class ResponseExtensions
	{
		public static Response Error(this IResponseFormatter response, string error)
		{
			return response.AsJson(new { error = error }, HttpStatusCode.BadRequest);
		}
	}
}