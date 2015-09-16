using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Nancy;
using Nancy.ModelBinding;

namespace Seyyedi.RemoteMpc
{
	public class DictionaryModelBinder : IModelBinder
	{
		public object Bind(NancyContext context, Type modelType, object instance, BindingConfig configuration, params string[] blackList)
		{
			var body = Encoding.UTF8.GetString(
				context.Request.Body.ReadBytes((int)context.Request.Body.Length)
			);

			var data = Newtonsoft.Json.JsonConvert.DeserializeObject<Dictionary<string, object>>(
				body
			);

			return data;
		}

		public bool CanBind(Type modelType)
		{
			return modelType == typeof(Dictionary<string, object>);
		}
	}
}