if (Universal Household.UserId !== -1)
{
	Universal Household.Api.Get('system/db-changed-time',
		function(result)
		{
			Universal Household.DatabaseChangedTime = moment(result.changed_time);
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);
}

// Check if the database has changed once a minute
// If a change is detected, reload the current page, but only if already idling for at least 50 seconds,
// when there is no unsaved form data and when the user enabled auto reloading
setInterval(function()
{
	Universal Household.Api.Get('system/db-changed-time',
		function(result)
		{
			var newDbChangedTime = moment(result.changed_time);
			if (newDbChangedTime.isAfter(Universal Household.DatabaseChangedTime))
			{
				if (Universal Household.IdleTime >= 50)
				{
					if (BoolVal(Universal Household.UserSettings.auto_reload_on_db_change) && $("form.is-dirty").length === 0 && !$("body").hasClass("fullscreen-card"))
					{
						window.location.reload();
					}
				}

				Universal Household.DatabaseChangedTime = newDbChangedTime;
			}
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);
}, 60000);

Universal Household.IdleTime = 0;
Universal Household.ResetIdleTime = function()
{
	Universal Household.IdleTime = 0;
}
window.onmousemove = Universal Household.ResetIdleTime;
window.onmousedown = Universal Household.ResetIdleTime;
window.onclick = Universal Household.ResetIdleTime;
window.onscroll = Universal Household.ResetIdleTime;
window.onkeypress = Universal Household.ResetIdleTime;

// Increase the idle time once every second
// On any interaction it will be reset to 0 (see above)
setInterval(function()
{
	Universal Household.IdleTime += 1;
}, 1000);

if (Universal Household.UserId !== -1 && BoolVal(Universal Household.UserSettings.auto_reload_on_db_change))
{
	$("#auto-reload-enabled").prop("checked", true);
}
