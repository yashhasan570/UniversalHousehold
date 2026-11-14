$('#save-userentity-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("userentity-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#userentity-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("userentity-form");

	var redirectUrl = U("/userentities");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/userentities', jsonData,
			function(result)
			{
				if (GetUriParam("embedded") !== undefined)
				{
					window.parent.postMessage(WindowMessageBag("Reload"), Universal Household.BaseUrl);
				}
				else
				{
					window.location.href = redirectUrl;
				}
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("userentity-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/userentities/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				if (GetUriParam("embedded") !== undefined)
				{
					window.parent.postMessage(WindowMessageBag("Reload"), Universal Household.BaseUrl);
				}
				else
				{
					window.location.href = redirectUrl;
				}
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("userentity-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#userentity-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('userentity-form');
});

$('#userentity-form select').change(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('userentity-form');
});

$('#userentity-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('userentity-form'))
		{
			return false;
		}
		else
		{
			$('#save-userentity-button').click();
		}
	}
});

$("#show_in_sidebar_menu").on("click", function()
{
	if (this.checked)
	{
		$("#icon_css_class").removeAttr("disabled");
	}
	else
	{
		$("#icon_css_class").attr("disabled", "");
	}
});

Universal Household.FrontendHelpers.ValidateForm('userentity-form');
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);

// Click twice to trigger on-click but not change the actual checked state
$("#show_in_sidebar_menu").click();
$("#show_in_sidebar_menu").click();
