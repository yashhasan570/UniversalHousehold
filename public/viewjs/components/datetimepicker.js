Universal Household.Components.DateTimePicker = {};

Universal Household.Components.DateTimePicker.GetInputElement = function()
{
	return $('.datetimepicker').find('input').not(".form-check-input");
}

Universal Household.Components.DateTimePicker.GetValue = function()
{
	return Universal Household.Components.DateTimePicker.GetInputElement().val();
}

Universal Household.Components.DateTimePicker.SetValue = function(value, inputElement = Universal Household.Components.DateTimePicker.GetInputElement())
{
	// "Click" the shortcut checkbox when the desired value is
	// not the shortcut value and it is currently set
	var shortcutValue = $("#datetimepicker-shortcut").data("datetimepicker-shortcut-value");
	if (value != shortcutValue && $("#datetimepicker-shortcut").is(":checked"))
	{
		$("#datetimepicker-shortcut").click();
	}
	inputElement.val(value);
	inputElement.keyup();
}

Universal Household.Components.DateTimePicker.Clear = function()
{
	Universal Household.Components.DateTimePicker.Init(true);

	Universal Household.Components.DateTimePicker.GetInputElement().val("");

	// "Click" the shortcut checkbox when the desired value is
	// not the shortcut value and it is currently set
	value = "";
	var shortcutValue = $("#datetimepicker-shortcut").data("datetimepicker-shortcut-value");
	if (value != shortcutValue && $("#datetimepicker-shortcut").is(":checked"))
	{
		$("#datetimepicker-shortcut").click();
	}

	$('#datetimepicker-timeago').text('');
}

Universal Household.Components.DateTimePicker.ChangeFormat = function(format)
{
	$(".datetimepicker").datetimepicker("destroy");
	Universal Household.Components.DateTimePicker.GetInputElement().data("format", format);
	Universal Household.Components.DateTimePicker.Init();

	if (format == "YYYY-MM-DD")
	{
		Universal Household.Components.DateTimePicker.GetInputElement().addClass("date-only-datetimepicker");
	}
	else
	{
		Universal Household.Components.DateTimePicker.GetInputElement().removeClass("date-only-datetimepicker");
	}
}

var startDate = null;
if (Universal Household.Components.DateTimePicker.GetInputElement().data('init-with-now') === true)
{
	startDate = moment().format(Universal Household.Components.DateTimePicker.GetInputElement().data('format'));
}
if (Universal Household.Components.DateTimePicker.GetInputElement().data('init-value').length > 0)
{
	startDate = moment(Universal Household.Components.DateTimePicker.GetInputElement().data('init-value')).format(Universal Household.Components.DateTimePicker.GetInputElement().data('format'));
}

var limitDate = moment('2999-12-31 23:59:59');
if (Universal Household.Components.DateTimePicker.GetInputElement().data('limit-end-to-now') === true)
{
	limitDate = moment();
}

Universal Household.Components.DateTimePicker.Init = function(reInit = false)
{
	if (reInit)
	{
		$(".datetimepicker").datetimepicker("destroy");
	}

	$(".datetimepicker").each(function()
	{
		$(this).datetimepicker(
			{
				format: $(this).find("input").data('format'),
				buttons: {
					showToday: Universal Household.Components.DateTimePicker.GetInputElement().data('limit-end-to-now') !== true,
					showClose: true
				},
				calendarWeeks: Universal Household.CalendarShowWeekNumbers,
				maxDate: limitDate,
				locale: moment.locale(),
				defaultDate: startDate,
				useCurrent: false,
				icons: {
					time: 'fa-solid fa-clock',
					date: 'fa-solid fa-calendar',
					up: 'fa-solid fa-arrow-up',
					down: 'fa-solid fa-arrow-down',
					previous: 'fa-solid fa-chevron-left',
					next: 'fa-solid fa-chevron-right',
					today: 'fa-solid fa-calendar-day',
					clear: 'fa-solid fa-trash-can',
					close: 'fa-solid fa-check'
				},
				sideBySide: true,
				keyBinds: {
					up: function(widget) { },
					down: function(widget) { },
					'control up': function(widget) { },
					'control down': function(widget) { },
					left: function(widget) { },
					right: function(widget) { },
					pageUp: function(widget) { },
					pageDown: function(widget) { },
					enter: function(widget) { },
					escape: function(widget) { },
					'control space': function(widget) { },
					t: function(widget) { },
					'delete': function(widget) { }
				}
			});
	});
}
Universal Household.Components.DateTimePicker.Init();

Universal Household.Components.DateTimePicker.GetInputElement().on('keyup', function(e)
{
	$('.datetimepicker').datetimepicker('hide');

	var inputElement = $(e.currentTarget)
	var value = inputElement.val();
	var format = inputElement.data('format');
	var nextInputElement = $(inputElement.data('next-input-selector'));

	if (!nextInputElement.is("input"))
	{
		nextInputElement = nextInputElement.find("input");
	}

	// If input is empty and any arrow key is pressed, set date to today
	if (value.length === 0 && (e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 37 || e.keyCode === 39))
	{
		Universal Household.Components.DateTimePicker.SetValue(moment(new Date(), format, true).format(format), inputElement);
		nextInputElement.focus();
	}
	else if (value === 'x' || value === 'X') // Shorthand for never overdue
	{
		Universal Household.Components.DateTimePicker.SetValue(moment('2999-12-31 23:59:59').format(format), inputElement);
		nextInputElement.focus();
	}
	else if ((value.startsWith("+") || value.startsWith("-"))) // Shorthand for [+/-]n[d/m/y]
	{
		var lastCharacter = value.slice(-1).toLowerCase();

		if (lastCharacter == "d" || lastCharacter == "m" || lastCharacter == "y")
		{
			var n = Number.parseInt(value.substring(1, value.length - 1));
			if (value.startsWith("-"))
			{
				n = n * -1;
			}

			if (lastCharacter == "d")
			{
				Universal Household.Components.DateTimePicker.SetValue(moment().add(n, "days").format(format));
				nextInputElement.focus();
			}
			else if (lastCharacter == "m")
			{
				Universal Household.Components.DateTimePicker.SetValue(moment().add(n, "months").format(format));
				nextInputElement.focus();
			}
			else if (lastCharacter == "y")
			{
				Universal Household.Components.DateTimePicker.SetValue(moment().add(n, "years").format(format));
				nextInputElement.focus();
			}
		}
	}
	else if (value.length === 4 && $.isNumeric(value) && Number.parseInt(value.substring(0, 2)) >= 1 && Number.parseInt(value.substring(0, 2)) <= 12) // Shorthand for MMDD
	{
		var date = moment((new Date()).getFullYear().toString() + value);
		if (date.isBefore(moment()))
		{
			date.add(1, "year");
		}
		Universal Household.Components.DateTimePicker.SetValue(date.format(format), inputElement);
		nextInputElement.focus();
	}
	else if (value.length === 8 && $.isNumeric(value)) // Shorthand for YYYYMMDD
	{
		Universal Household.Components.DateTimePicker.SetValue(value.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'), inputElement);
		nextInputElement.focus();
	}
	else if (value.length === 7 && $.isNumeric(value.substring(0, 6)) && (value.substring(6, 7).toLowerCase() === "e" || value.substring(6, 7) === "+")) // Shorthand for YYYYMM[e/+]
	{
		var date = moment(value.substring(0, 4) + "-" + value.substring(4, 6) + "-01").endOf("month");
		Universal Household.Components.DateTimePicker.SetValue(date.format(format), inputElement);
		nextInputElement.focus();
	}
	else
	{
		var dateObj = moment(value, format, true);
		if (dateObj.isValid())
		{
			if (e.shiftKey)
			{
				// WITH shift modifier key

				if (e.keyCode === 38) // Up
				{
					Universal Household.Components.DateTimePicker.SetValue(dateObj.add(-1, 'months').format(format), inputElement);
				}
				else if (e.keyCode === 40) // Down
				{
					Universal Household.Components.DateTimePicker.SetValue(dateObj.add(1, 'months').format(format), inputElement);
				}
				else if (e.keyCode === 37) // Left
				{
					Universal Household.Components.DateTimePicker.SetValue(dateObj.add(-1, 'years').format(format), inputElement);
				}
				else if (e.keyCode === 39) // Right
				{
					Universal Household.Components.DateTimePicker.SetValue(dateObj.add(1, 'years').format(format), inputElement);
				}
			}
			else
			{
				// WITHOUT shift modifier key

				if (e.keyCode === 38) // Up
				{
					Universal Household.Components.DateTimePicker.SetValue(dateObj.add(-1, 'days').format(format), inputElement);
				}
				else if (e.keyCode === 40) // Down
				{
					Universal Household.Components.DateTimePicker.SetValue(dateObj.add(1, 'days').format(format), inputElement);
				}
				else if (e.keyCode === 37) // Left
				{
					Universal Household.Components.DateTimePicker.SetValue(dateObj.add(-1, 'weeks').format(format), inputElement);
				}
				else if (e.keyCode === 39) // Right
				{
					Universal Household.Components.DateTimePicker.SetValue(dateObj.add(1, 'weeks').format(format), inputElement);
				}
			}
		}
	}

	$('#datetimepicker-timeago').attr("datetime", Universal Household.Components.DateTimePicker.GetValue());
	RefreshContextualTimeago(".datetimepicker-wrapper");

	//Custom validation
	value = Universal Household.Components.DateTimePicker.GetValue();
	dateObj = moment(value, format, true);
	var element = Universal Household.Components.DateTimePicker.GetInputElement()[0];
	if (!dateObj.isValid())
	{
		if ($(element).hasAttr("required"))
		{
			element.setCustomValidity("error");
		}
	}
	else
	{
		if (Universal Household.Components.DateTimePicker.GetInputElement().data('limit-end-to-now') === true && dateObj.isAfter(moment()))
		{
			element.setCustomValidity("error");
		}
		else if (Universal Household.Components.DateTimePicker.GetInputElement().data('limit-start-to-now') === true && dateObj.isBefore(moment()))
		{
			element.setCustomValidity("error");
		}
		else
		{
			element.setCustomValidity("");
		}

		var earlierThanLimit = Universal Household.Components.DateTimePicker.GetInputElement().data("earlier-than-limit");
		if (earlierThanLimit)
		{
			if (moment(value).isBefore(moment(earlierThanLimit)))
			{
				$("#datetimepicker-earlier-than-info").removeClass("d-none");
			}
			else
			{
				$("#datetimepicker-earlier-than-info").addClass("d-none");
			}
		}
	}

	// "Click" the shortcut checkbox when the shortcut value was
	// entered manually and it is currently not set
	var shortcutValue = $("#datetimepicker-shortcut").data("datetimepicker-shortcut-value");
	if (value == shortcutValue && !$("#datetimepicker-shortcut").is(":checked"))
	{
		$("#datetimepicker-shortcut").click();
	}
});

Universal Household.Components.DateTimePicker.GetInputElement().on('input', function(e)
{
	$('#datetimepicker-timeago').attr("datetime", Universal Household.Components.DateTimePicker.GetValue());
	RefreshContextualTimeago(".datetimepicker-wrapper");
});

$('.datetimepicker').on('update.datetimepicker', function(e)
{
	Universal Household.Components.DateTimePicker.GetInputElement().trigger('input');
});

$('.datetimepicker').on('hide.datetimepicker', function(e)
{
	Universal Household.Components.DateTimePicker.GetInputElement().trigger('input');
	Universal Household.Components.DateTimePicker.GetInputElement().trigger('change');
	Universal Household.Components.DateTimePicker.GetInputElement().trigger('keypress');
	Universal Household.Components.DateTimePicker.GetInputElement().trigger('keyup');
});

$("#datetimepicker-shortcut").on("click", function()
{
	if (this.checked)
	{
		var value = $("#datetimepicker-shortcut").data("datetimepicker-shortcut-value");
		Universal Household.Components.DateTimePicker.SetValue(value);
		Universal Household.Components.DateTimePicker.GetInputElement().attr("readonly", "");
		$(Universal Household.Components.DateTimePicker.GetInputElement().data('next-input-selector')).focus();
	}
	else
	{
		Universal Household.Components.DateTimePicker.SetValue("");
		Universal Household.Components.DateTimePicker.GetInputElement().removeAttr("readonly");
		Universal Household.Components.DateTimePicker.GetInputElement().focus();
	}

	Universal Household.Components.DateTimePicker.GetInputElement().trigger('input');
	Universal Household.Components.DateTimePicker.GetInputElement().trigger('change');
	Universal Household.Components.DateTimePicker.GetInputElement().trigger('keypress');
});
