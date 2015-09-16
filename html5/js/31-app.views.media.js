app.views['/media'] =
{
	create: function ()
	{
		var self = this;

		var ui = this.ui = {
			main: new Element('div.media.loading'),
			filters: {
				main: new Element('div.media-filters')
			},
			items: new Element('div.media-items'),
			btns: {
				main: new Element('div.media-btns')
			}
		};

		if (app.profile.filter === undefined)
		{
			app.profile.filter = {};
		}

		this.filter = {
			text: app.profile.filter.text || '',
			tags: app.profile.filter.tags || []
		};

		app.profile.filter = this.filter;

		this.currentItem = null;

		ui.main.adopt(
			ui.filters.main,
			ui.items,
			ui.btns.main
		);

		ui.btns.main.adopt(
			ui.btns.clear = new Element('div.media-btn.clear').addEvents({
				'click': function()
				{
					if (ui.filters.tbText !== undefined)
					{
						ui.filters.tbText.value = '';
						ui.filters.tbText.focus();

						self.filter.text = '';
						self.updateLibrary();
					}
				}
			}),
			ui.btns.update = new Element('div.media-btn.update').addEvents({
				'click': function()
				{
					app.api('update-library', {}, function (resp)
					{
						self.loadLibrary();
					});
				}
			})
		);

		this.loadLibrary();

		return this;
	},

	loadLibrary: function()
	{
		var self = this;

		app.api('get-library', {}, function (resp)
		{
			self.updateLibrary(resp.library);
		});
	},

	updateFilters: function ()
	{
		var self = this;

		this.ui.filters.main.empty();

		this.ui.filters.main.adopt(
			this.ui.filters.text = new Element('div.media-filter-text').adopt(
				this.ui.filters.tbText = new Element('input.media-filter-text-tb', { value: this.filter.text })
			),
			this.ui.filters.tags = new Element('div.media-filter-tags')
		);

		this.ui.filters.tbText.addEvents({
			'keyup': function ()
			{
				self.filter.text = this.value;
				self.updateLibrary();
			}
		});

		for (var i = 0; i < this.library.tags.length; i++)
		{
			var tag = this.library.tags[i];
			var ui = this.createTagUI(tag);

			this.ui.filters.tags.adopt(ui.main);
		}

		this.ui.filters.main.adopt(
			this.ui.filters.text,
			this.ui.filters.tags
		);

		this.ui.filters.tbText.focus();
	},

	updateItems: function ()
	{
		this.ui.items.empty();

		for (var i = 0; i < this.library.items.length; i++)
		{
			var item = this.library.items[i];

			if (!this.filterByText(item) || !this.filterByTags(item))
			{
				continue;
			}

			var ui = this.createItemUI(item);

			this.ui.items.adopt(ui.main);
		}
	},

	updateLibrary: function (library)
	{
		if (library !== undefined)
		{
			this.ui.main.removeClass('loading');

			this.library = library;

			this.updateFilters();
		}

		this.updateItems();

		this.resize();
	},

	createTagUI: function (tag)
	{
		var self = this;

		var ui = {
			tag: tag,
			main: new Element('div.media-filter-tag', { html: tag })
		};

		if (this.filter.tags.contains(tag))
		{
			ui.main.addClass('active');
		}

		ui.main.addEvents({
			'click': function ()
			{
				var isActive = ui.main.hasClass('active');
				var tags = self.ui.filters.tags.getChildren();

				for (var i = 0; i < tags.length; i++)
				{
					tags[i].removeClass('active');
				}

				self.filter.tags = [];

				if (isActive)
				{
					//self.filter.tags.remove(tag);
					ui.main.removeClass('active');
				}
				else
				{
					self.filter.tags.push(tag);
					ui.main.addClass('active');
				}

				self.updateLibrary();
			}
		});

		return ui;
	},

	createItemUI: function (item)
	{
		var self = this;

		var ui = item.ui = {
			item: item,
			main: new Element('div.media-item').adopt(
				new Element('div.media-item-lbl', { html: item.name })
			)
		};

		ui.main.addEvents({
			'click': function (e)
			{
				if (e.control)
				{
					app.api('scan-item', { name: item.name, update: e.alt }, function (resp)
					{
						if (e.alt)
						{
							self.loadLibrary();
						}

						console.log(resp);
					});

					return;
				}

				if (self.currentItem !== null)
				{
					self.dropExtendedItemUI(self.currentItem);

					if (self.currentItem === item)
					{
						self.currentItem = null;
						return;
					}
				}

				self.currentItem = item;
				self.createExtendedItemUI(item);
			}
		})

		return ui;
	},

	scrollToItem: function(item)
	{
		var pos = item.ui.main.getPosition(this.ui.items);
		var scroll = this.ui.items.getScroll();

		this.ui.items.scrollTo(0, pos.y + scroll.y);
	},

	dropExtendedItemUI: function (item)
	{
		if (item.ui.extended !== undefined)
		{
			item.ui.main.removeClass('extended');
			item.ui.extended.destroy();
			delete item.ui.extended;
		}
	},

	createExtendedItemUI: function (item)
	{
		var self = this;

		this.dropExtendedItemUI(item);

		item.ui.main.addClass('extended');

		item.ui.main.adopt(
			item.ui.extended = new Element('div.media-item-extended').adopt(

			)
		);

		self.scrollToItem(item);

		app.api('get-extended-item', { name: item.name }, function (resp)
		{
			self.adaptExtendedItemUI(item, resp.extended);
			self.scrollToItem(item);
		});
	},

	adaptExtendedItemUI: function (item, extended)
	{
		item.extended = extended;

		item.ui.extended.empty();

		for (var g = 0; g < extended.groups.length; g++)
		{
			var group = extended.groups[g];

			group.ui = new Element('div.media-item-extended-group');
			group.uiFiles = new Element('div.media-item-extended-files');

			if (group.name !== '')
			{
				group.ui.adopt(
					new Element('div.media-item-extended-group-title', { html: group.name })
				);
			}

			group.ui.adopt(group.uiFiles);

			for (var f = 0; f < group.files.length; f++)
			{
				var file = group.files[f];

				this.createExtendedFileUI(file);

				group.uiFiles.adopt(file.ui);
			}

			item.ui.extended.adopt(group.ui);
		}
	},

	createExtendedFileUI: function(file)
	{
		return file.ui = new Element('div.media-item-extended-file', { html: file.name })
			.addEvents({
				'click': function (e)
				{
					e.stopPropagation();

					app.api('play-file', { path: file.path });
				}
			});
	},

	filterByText: function (item)
	{
		if (this.filter.text !== '')
		{
			var query = this.filter.text.trim().toLowerCase();
			var name = item.name.toLowerCase();

			var queryTokens = query.split(' ');

			for (var i = 0; i < queryTokens.length; i++)
			{
				var token = queryTokens[i];

				if (token.containsAny(':'))
				{

				}
				else if (!name.containsAny(token))
				{
					return false;
				}
			}
		}

		return true;
	},

	filterByTags: function (item)
	{
		if (this.filter.tags.length > 0)
		{
			if (!item.tags.containsSome(this.filter.tags))
			{
				return false;
			}
		}

		return true;
	},

	resize: function ()
	{
		var wndSize = window.getSize();

		//this.ui.main.setStyles({
		//	width: wndSize.x,
		//	height: wndSize.y
		//});

		var pos = this.ui.items.getPosition(this.ui.main);

		this.ui.items.setStyles({
			width: wndSize.x,
			height: wndSize.y - pos.y
		});

		var btnsSize = this.ui.btns.main.getSize();

		this.ui.filters.main.setStyles({
			width: wndSize.x - btnsSize.x
		});

		this.ui.btns.main.setStyles({
			left: wndSize.x - btnsSize.x
		});
	}
};