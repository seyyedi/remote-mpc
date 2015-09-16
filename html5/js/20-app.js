var app =
{
	views: {},

	start: function ()
	{
		this.profile = this.getSession('profile', {
			session: null
		});

		this.ui = null;
		this.body = $(document.body);

		this.navigate();
		this.resize();
	},

	navigate: function (path)
	{
		if (path === undefined)
		{
			path = document.location.pathname;
		}

		if (this.profile.session === null)
		{
			//path = '/accounts';
		}

		var view = this.views[path];

		if (view !== undefined)
		{
			this.render(view);
		}
	},

	render: function (view)
	{
		this.view = view.create();
		this.ui = this.view.ui.main;

		this.body.empty();
		this.body.adopt(this.ui);
	},

	_api: function(method, data)
	{
		api(method, data, function (resp) {
			console.log(resp);
		});

		return true;
	},

	api: function (method, data, callback)
	{
		data = data || {};

		if (app.profile.session !== null)
		{
			data.session = app.profile.session;
		}

		var url = '/api/' + method;
		var xhr = new XMLHttpRequest();

		if ('withCredentials' in xhr)
		{
			// XHR for Chrome/Safari/Firefox.
			xhr.open('POST', url, true);
			xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		}
		else if (typeof XDomainRequest !== undefined)
		{
			// XDomainRequest for IE.
			xhr = new XDomainRequest();
			xhr.open('POST', url);
		}
		else
		{
			// CORS not supported.
			xhr = null;
		}

		if (xhr === null)
		{
			return;
		}

		xhrData = JSON.encode(data);

		xhr.onload = function ()
		{
			if (xhr.status === 200)
			{
				var responseJson = {};

				if (xhr.responseText !== '')
				{
					responseJson = JSON.decode(xhr.responseText);
				}

				if (callback !== undefined)
				{
					callback(responseJson);
				}
			}
			else if (xhr.status === 400)
			{
				console.warn(xhr.responseText);
			}
		};

		xhr.onerror = function ()
		{

		};

		xhr.onabort = function ()
		{

		};

		xhr.onprogress = function (e)
		{

		};

		xhr.send(xhrData);
	},

	setSession: function (id, data)
	{
		sessionStorage[id] = JSON.encode(data);
	},

	getSession: function (id, defaultData)
	{
		defaultData = defaultData || null;

		var data = sessionStorage[id];

		if (data !== undefined)
		{
			return JSON.decode(data) || defaultData;
		}

		return defaultData;
	},

	resize: function ()
	{
		if (app.view !== undefined && app.view.resize !== undefined)
		{
			app.view.resize();
		}
	}
};

api = app.api;
_api = app._api;

window.addEvent('resize', function ()
{
	app.resize();
});

window.addEvent('unload', function ()
{
	app.setSession('profile', app.profile);
});