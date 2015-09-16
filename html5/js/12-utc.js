var utc = new new Class(
{
	initialize: function ()
	{
		this.ticks = {};
		this.ticks.millisecond = 1;
		this.ticks.second = this.ticks.millisecond * 1000;
		this.ticks.minute = this.ticks.second * 60;
		this.ticks.hour = this.ticks.minute * 60;
		this.ticks.day = this.ticks.hour * 24;
		this.ticks.week = this.ticks.day * 7;

		this.daysInMonths365 = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
		this.daysInMonths366 = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];

		this.lang = {
			days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
			daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
			months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
			monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		};
	},

	start: function ()
	{
		this.unixDate = new utc.date(0);
	},

	isLeapYear: function (year)
	{
		if (year % 4 !== 0)
		{
			return false;
		}

		if (year % 100 === 0)
		{
			return year % 400 === 0;
		}

		return true;
	},

	daysInMonth: function (year, month)
	{
		var daysInMonths = this.isLeapYear(year)
			? this.daysInMonths366
			: this.daysInMonths365;

		return daysInMonths[month + 1] - daysInMonths[month];
	},

	format: function (unixTicks, text)
	{
		return this.unix(unixTicks).format(text);
	},

	unix: function (unixTicks)
	{
		return new utc.date(this.unixDate.ticks).addSeconds(unixTicks);
	},

	unixTime: function (a, b)
	{
		return this.deltaTime(
			utc.unix(a),
			utc.unix(b)
		);
	},

	deltaTime: function (a, b)
	{
		return new utc.time(
			Math.abs(a.ticks - b.ticks)
		);
	}
});

utc.date = new Class(
{
	initialize: function (ticks)
	{
		this.setTicks(ticks);
	},

	setTicks: function (ticks)
	{
		this.ticks = ticks;

		this.adapt();

		return this;
	},

	adapt: function ()
	{
		this.date = new Date(this.ticks);

		this.year = this.date.getUTCFullYear();
		this.month = this.date.getUTCMonth();
		this.day = this.date.getUTCDate();
		this.weekday = this.date.getUTCDay();
		this.hours = this.date.getUTCHours();
		this.minutes = this.date.getUTCMinutes();
		this.seconds = this.date.getUTCSeconds();
		this.milliseconds = this.date.getUTCMilliseconds();

		this.tt = 'am';
		this.hours12 = this.hours;

		if (this.hours12 > 11) { this.tt = 'pm'; }
		if (this.hours12 > 12) { this.hours12 -= 12; }
		if (this.hours12 == 0) { this.hours12 = 12; }
	},

	set: function (data)
	{
		if (data.year !== undefined)
		{
			this.addYears(data.year - this.year);
		}

		if (data.month !== undefined)
		{
			this.addMonths((data.month - 1) - this.month);
		}

		if (data.day !== undefined)
		{
			this.addDays(data.day - this.day);
		}

		if (data.hours !== undefined)
		{
			this.addHours(data.hours - this.hours);
		}

		if (data.minutes !== undefined)
		{
			this.addMinutes(data.minutes - this.minutes);
		}

		if (data.seconds !== undefined)
		{
			this.addSeconds(data.seconds - this.seconds);
		}

		if (data.milliseconds !== undefined)
		{
			this.addMilliseconds(data.milliseconds - this.milliseconds);
		}

		return this;
	},

	resetTime: function ()
	{
		this.addMilliseconds(
			this.milliseconds * -1
		);

		this.addSeconds(
			this.seconds * -1
		);

		this.addMinutes(
			this.minutes * -1
		);

		this.addHours(
			this.hours * -1
		);

		return this;
	},

	addTicks: function (ticks)
	{
		return this.setTicks(
			this.ticks + ticks
		);
	},

	addMilliseconds: function (milliseconds)
	{
		return this.setTicks(
			this.ticks + utc.ticks.millisecond * milliseconds
		);
	},

	addSeconds: function (seconds)
	{
		return this.setTicks(
			this.ticks + utc.ticks.second * seconds
		);
	},

	addMinutes: function (minutes)
	{
		return this.setTicks(
			this.ticks + utc.ticks.minute * minutes
		);
	},

	addHours: function (hours)
	{
		return this.setTicks(
			this.ticks + utc.ticks.hour * hours
		);
	},

	addDays: function (days)
	{
		return this.setTicks(
			this.ticks + utc.ticks.day * days
		);
	},

	addMonths: function (months)
	{
		var days = 0;
		var year = this.year;
		var month = this.month;

		if (months > 0)
		{
			for (var i = 0; i < months; i++)
			{
				days += utc.daysInMonth(year, month);

				if (month === 11)
				{
					month = 0;
					year++;
				}
				else
				{
					month++;
				}
			}
		}
		else
		{
			for (var i = 0; i < months * -1; i++)
			{
				if (month === 0)
				{
					month = 11;
					year--;
				}
				else
				{
					month--;
				}

				days -= utc.daysInMonth(year, month);
			}
		}

		return this.addDays(days);
	},

	addYears: function (years)
	{
		var days = 0;

		if (years > 0)
		{
			for (var i = this.year; i < this.year + years; i++)
			{
				if (utc.isLeapYear(i))
				{
					days += 366;
				}
				else
				{
					days += 365;
				}
			}
		}
		else
		{
			for (var i = this.year; i > this.year + years; i--)
			{
				if (utc.isLeapYear(i - 1))
				{
					days -= 366;
				}
				else
				{
					days -= 365;
				}
			}
		}

		return this.addDays(days);
	},

	format: function (text)
	{
		var data = {
			dd: utils.padLeft(this.day, '0', 2),
			ddd: utc.lang.daysShort[this.weekday],
			dddd: utc.lang.days[this.weekday],
			MM: utils.padLeft(this.month + 1, '0', 2),
			MMMM: utc.lang.months[this.month],
			yyyy: utils.padLeft(this.year, '0', 4),
			HH: utils.padLeft(this.hours, '0', 2),
			hh: utils.padLeft(this.hours12, '0', 1),
			tt: this.tt,
			TT: this.tt.toUpperCase(),
			mm: utils.padLeft(this.minutes, '0', 2),
			ss: utils.padLeft(this.seconds, '0', 2),
			fff: utils.padLeft(this.milliseconds, '0', 3),
			time: this.formatTimePart(this)
		};

		data.yy = data.yyyy.substr(2, 2);

		return text.substitute(data);
	},

	formatTimePart: function (date)
	{
		var ap = '';
		var hours = date.hours;

		var clock24 = true;

		if (!clock24)
		{
			ap = ' AM';

			if (hours > 11) { ap = ' PM'; }
			if (hours > 12) { hours = hours - 12; }
			if (hours == 0) { hours = 12; }
		}

		var sHours = hours.toString();
		var sMinutes = utils.padLeft(date.minutes, '0', 2);

		return sHours + ':' + sMinutes + ap;
	},

	formatAbsolute: function ()
	{
		return this.format('{MMMM} {dd}, {yyyy} {time}');
	},

	formatLog: function ()
	{
		return this.format('{dd}.{MM}.{yy} {HH}:{mm}:{ss}.{fff}');
	}
});

utc.time = new Class(
{
	initialize: function (delta)
	{
		this.delta = delta;

		var _ = this._ = {};

		_.millisecond = 1;
		_.second = 1000;
		_.minute = _.second * 60;
		_.hour = _.minute * 60;
		_.day = _.hour * 24;

		this.adapt();
	},

	adapt: function ()
	{
		var _ = this._;
		var delta = this.delta;

		this.totalMilliseconds = delta / _.millisecond;
		this.totalSeconds = delta / _.second;
		this.totalMinutes = delta / _.minute;
		this.totalHours = delta / _.hour;
		this.totalDays = delta / _.day;

		this.days = Math.floor(this.totalDays);
		this.hours = Math.floor(this.totalHours - this.days * 24);
		this.minutes = Math.floor(this.totalMinutes - this.days * 24 * 60 - this.hours * 60);
		this.seconds = Math.floor(this.totalSeconds - this.days * 24 * 60 * 60 - this.hours * 60 * 60 - this.minutes * 60);
		this.milliseconds = Math.floor(this.totalMilliseconds - this.days * 24 * 60 * 60 * 1000 - this.hours * 60 * 60 * 1000 - this.minutes * 60 * 1000 - this.seconds * 1000);
	},

	format: function (text, force)
	{
		force = force || false;

		var data = {};

		if (force || (this.days > 0 && text.containsAny('{d}')))
		{
			data.d = utils.padLeft(this.days, '0', 1);
			data.D = 'd';
			data.DDD = 'days';

			force = true;
		}

		if (force || (this.hours > 0 && text.containsAny('{h}')))
		{
			data.h = utils.padLeft(this.hours, '0', 1);
			data.hh = utils.padLeft(this.hours, '0', 2);
			data.H = 'h';
			data.HHH = 'hours';

			force = true;
		}

		if (force || (this.minutes > 0 && text.containsAny('{m}')))
		{
			data.m = utils.padLeft(this.minutes, '0', 1);
			data.mm = utils.padLeft(this.minutes, '0', 2);
			data.M = 'm';
			data.MM = 'min';
			data.MMM = 'minutes';

			force = true;
		}

		if (force || (this.seconds > 0 && text.containsAny('{s}')))
		{
			data.s = utils.padLeft(this.seconds, '0', 1);
			data.ss = utils.padLeft(this.seconds, '0', 2);
			data.S = 's';
			data.SS = 'sec';
			data.SSS = 'seconds';

			force = true;
		}

		if (force || (this.milliseconds > 0 && text.containsAny('{ms}')))
		{
			data.ms = utils.formatNumber(this.milliseconds);
			data.MS = 'ms';
			data.MSMS = 'milliseconds';

			force = true;
		}

		return text.substitute(data).trim();
	}
});

utc.start();