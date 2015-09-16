utils = new new Class(
{
	initialize: function ()
	{

	},

	formatNumberIteration: function (number)
	{
		if (number <= 0)
		{
			return '';
		}
		else if (number === 1)
		{
			return '1st';
		}
		else if (number === 2)
		{
			return '2nd';
		}
		else if (number >= 3)
		{
			return number + 'th';
		}
	},

	formatNumber: function (number)
	{
		if (number === undefined || number === null)
		{
			return '0';
		}

		return number
			.format({
				decimal: ',',
				group: '.',
				decimals: 1
			})
			.replace(',0', '');
	},

	formatSize: function (bytes)
	{
		var categories = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];

		var i = 0;
		var value = bytes;

		while (value > 1024)
		{
			value = value / 1024;
			i++;
		}

		if (i > categories.length - 1)
		{
			return 'invalid size';
		}

		return value.format({
			decimals: i > 0 ? 2 : 0,
			decimal: '.',
			group: ',',
			suffix: ' ' + categories[i]
		});
	},

	padLeft: function (value, token, length)
	{
		value = value.toString();

		while (value.length < length)
		{
			value = token + value;
		}

		return value;
	}
});