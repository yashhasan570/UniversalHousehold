$('#save-location-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("location-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#location-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("location-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/locations', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					if (GetUriParam("embedded") !== undefined)
					{
						window.parent.postMessage(WindowMessageBag("Reload"), Universal Household.BaseUrl);
					}
					else
					{
						window.location.href = U('/locations');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("location-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/locations/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					if (GetUriParam("embedded") !== undefined)
					{
						window.parent.postMessage(WindowMessageBag("Reload"), Universal Household.BaseUrl);
					}
					else
					{
						window.location.href = U('/locations');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("location-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#location-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('location-form');
});

$('#location-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('location-form'))
		{
			return false;
		}
		else
		{
			$('#save-location-button').click();
		}
	}
});

Universal Household.Components.UserfieldsForm.Load();
Universal Household.FrontendHelpers.ValidateForm('location-form');
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);
