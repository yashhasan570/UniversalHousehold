Universal Household.WakeLock = {};
Universal Household.WakeLock.NoSleepJsIntance = null;
Universal Household.WakeLock.InitDone = false;

$("#keep_screen_on").on("change", function()
{
	var value = $(this).is(":checked");
	if (value)
	{
		Universal Household.WakeLock.Enable();
	}
	else
	{
		Universal Household.WakeLock.Disable();
	}
});

Universal Household.WakeLock.Enable = function()
{
	if (Universal Household.WakeLock.NoSleepJsIntance === null)
	{
		Universal Household.WakeLock.NoSleepJsIntance = new NoSleep();
	}
	Universal Household.WakeLock.NoSleepJsIntance.enable();
	Universal Household.WakeLock.InitDone = true;
}

Universal Household.WakeLock.Disable = function()
{
	if (Universal Household.WakeLock.NoSleepJsIntance !== null)
	{
		Universal Household.WakeLock.NoSleepJsIntance.disable();
	}
}

// Handle "Keep screen on while displaying a fullscreen-card" when the body class "fullscreen-card" has changed
new MutationObserver(function(mutations)
{
	if (BoolVal(Universal Household.UserSettings.keep_screen_on_when_fullscreen_card) && !BoolVal(Universal Household.UserSettings.keep_screen_on))
	{
		mutations.forEach(function(mutation)
		{
			if (mutation.attributeName === "class")
			{
				var attributeValue = $(mutation.target).prop(mutation.attributeName);
				if (attributeValue.contains("fullscreen-card"))
				{
					Universal Household.WakeLock.Enable();
				}
				else
				{
					Universal Household.WakeLock.Disable();
				}
			}
		});
	}
}).observe(document.body, {
	attributes: true
});

// Enabling NoSleep.Js only works in a user input event handler,
// so if the user wants to keep the screen on always,
// do this in on the first click on anything
$(document).click(function()
{
	if (Universal Household.WakeLock.InitDone === false && BoolVal(Universal Household.UserSettings.keep_screen_on))
	{
		Universal Household.WakeLock.Enable();
	}

	Universal Household.WakeLock.InitDone = true;
});
