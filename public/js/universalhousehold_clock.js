$(document).on("change", "#show-clock-in-header", function()
{
	CheckHeaderClockEnabled();
});

function RefreshHeaderClock()
{
	$("#clock-small").text(moment().format("l LT"));
	$("#clock-big").text(moment().format("LLLL"));
}

Universal Household.HeaderClockInterval = null;
function CheckHeaderClockEnabled()
{
	if (Universal Household.UserId === -1)
	{
		return;
	}

	// Refresh the clock in the header every second when enabled
	if (BoolVal(Universal Household.UserSettings.show_clock_in_header))
	{
		RefreshHeaderClock();
		$("#clock-container").removeClass("d-none");

		Universal Household.HeaderClockInterval = setInterval(function()
		{
			RefreshHeaderClock();
		}, 1000);
	}
	else
	{
		if (Universal Household.HeaderClockInterval !== null)
		{
			clearInterval(Universal Household.HeaderClockInterval);
			Universal Household.HeaderClockInterval = null;
		}

		$("#clock-container").addClass("d-none");
	}
}
CheckHeaderClockEnabled();

if (Universal Household.UserId !== -1 && BoolVal(Universal Household.UserSettings.show_clock_in_header))
{
	$("#show-clock-in-header").prop("checked", true);
}
