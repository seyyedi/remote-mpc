app.views['/'] =
{
	create: function ()
	{
		var self = this;

		var ui = this.ui = {
			main: new Element('div#main'),
			groups: new Element('div.groups')
		};

		ui.main.adopt(ui.groups);

		ui.groups.adopt(
			this.createGroup('Playback', [
				this.createBtn('play'),
				this.createBtn('pause')
			]),
			this.createGroup('Volume', [
				this.createBtn('volume-down'),
				this.createBtn('volume-up')
			]),
			this.createGroup('Browser', [
				this.createBtn('next-file'),
				this.createBtn('fullscreen')
			]),
			this.createGroup('Playback', [
				this.createBtn('back'),
				this.createBtn('forward')
			])
		);

		return this;
	},

	createGroup: function (title, elements)
	{
		return new Element('div.group').adopt(
			new Element('div.group-title', { html: title }),
			new Element('div.group-body').adopt(
				elements
			)
		);
	},

	createBtn: function (token, callback)
	{
		return new Element('div.btn.' + token).adopt(
			new Element('img.btn-icon', { src: '/icons/' + token + '.png', width: 92, height: 92, border: 0 })
		).addEvents({
			//'click': callback,
			'touchstart': function ()
			{
				this.addClass('active');

				if (callback !== undefined)
				{
					callback();
				}
				else
				{
					app.api(token);
				}
			},
			'touchend': function () { this.removeClass('active'); }
		});
	},

	loadProfile: function ()
	{
		this.me = [];
		this.selected = [];

		var profile = app.getSession('contacts-profile');

		if (profile !== null)
		{
			this.direction = profile.direction || 'desc';

			for (var i = 0; i < profile.me.length; i++)
			{
				var contact = this.contacts.find(profile.me[i], 'address');

				if (contact !== null)
				{
					this.me.push(contact);
				}
			}

			for (var i = 0; i < profile.selected.length; i++)
			{
				var contact = this.contacts.find(profile.selected[i], 'address');

				if (contact !== null)
				{
					this.selected.push(contact);
				}
			}
		}
		else
		{
			this.saveProfile();
		}

		this.adaptContacts();
	},

	saveProfile: function ()
	{
		var profile = {
			direction: this.direction,
			me: [],
			selected: []
		};

		for (var i = 0; i < this.me.length; i++)
		{
			profile.me.push(this.me[i].address);
		}

		for (var i = 0; i < this.selected.length; i++)
		{
			profile.selected.push(this.selected[i].address);
		}

		app.setSession('contacts-profile', profile);
	},

	resize: function ()
	{
		var wndSize = window.getSize();
		//var pos = this.ui.messages.getPosition(this.ui.main);

		//this.ui.messages.setStyles({
		//	height: wndSize.y - pos.y
		//});
	}
};