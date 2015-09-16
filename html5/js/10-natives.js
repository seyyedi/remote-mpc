Array.prototype.find = function (value, token, itemToken, itemDefault)
{
	if (token === undefined)
	{
		token = 'id';
	}

	for (var i = 0; i < this.length; i++)
	{
		var item = this[i];

		if (item[token] === value)
		{
			if (itemToken !== undefined)
			{
				return item[itemToken] || itemDefault || null;
			}
			else
			{
				return item;
			}
		}
	}

	return itemDefault || null;
};

Array.prototype.findAndRemove = function (id, token)
{
	if (token === undefined)
	{
		token = 'id';
	}

	for (var i = 0; i < this.length; i++)
	{
		var item = this[i];

		if (item[token] === id)
		{
			this.splice(i, 1);
			return item;
		}
	}

	return null;
};

Array.prototype.removeIfExists = function (id, token)
{
	return this.findAndRemove(id, token) !== null;
};

Array.prototype.exists = function (id, token)
{
	return this.find(id, token) !== null;
};

Array.prototype.contains = function (item)
{
	return this.indexOf(item) !== -1;
};

Array.prototype.containsSome = function (items)
{
	for (var i = 0; i < items.length; i++)
	{
		var item = items[i];

		if (this.contains(item))
		{
			return true;
		}
	}

	return false;
};

Array.prototype.remove = function (item)
{
	var index = this.indexOf(item);

	if (index !== -1)
	{
		this.splice(index, 1);

		return item;
	}

	return null;
};

Array.prototype.pushRange = function (array, token)
{
	for (var i = 0; i < array.length; i++)
	{
		var item = array[i];

		if (token !== undefined)
		{
			item = item[token];
		}

		this.push(item);
	}
};

Array.prototype.max = function (token)
{
	var max = Number.MIN_VALUE;
	var maxItem = null;

	for (var i = 0; i < this.length; i++)
	{
		var item = this[i];
		var value = item[token] || Number.MIN_VALUE;

		if (value > max)
		{
			max = value;
			maxItem = item;
		}
	}

	return maxItem;
};

Array.prototype.min = function (token)
{
	var min = Number.MAX_VALUE;
	var minItem = null;

	for (var i = 0; i < this.length; i++)
	{
		var item = this[i];
		var value = item[token] || Number.MAX_VALUE;

		if (value < min)
		{
			min = value;
			minItem = item;
		}
	}

	return minItem;
};

String.prototype.containsAny = function()
{
	for (var i = 0; i < arguments.length; i++)
	{
		var argument = arguments[i];

		if (this.indexOf(argument) !== -1)
		{
			return true;
		}
	}

	return false;
};