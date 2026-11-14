$('#save-battery-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("battery-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#battery-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("battery-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/batteries', jsonData,
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
						window.location.href = U('/batteries');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("battery-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/batteries/' + Universal Household.EditObjectId, jsonData,
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
						window.location.href = U('/batteries');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("battery-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#battery-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('battery-form');
});

$('#battery-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('battery-form'))
		{
			return false;
		}
		else
		{
			$('#save-battery-button').click();
		}
	}
});

$(document).on('click', '.battery-householdcode-label-print', function(e)
{
	e.preventDefault();

	var batteryId = $(e.currentTarget).attr('data-battery-id');
	Universal Household.Api.Get('batteries/' + batteryId + '/printlabel', function(labelData)
	{
		if (Universal Household.Webhooks.labelprinter !== undefined)
		{
			Universal Household.FrontendHelpers.RunWebhook(Universal Household.Webhooks.labelprinter, labelData);
		}
	});
});

Universal Household.Components.UserfieldsForm.Load();
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);
Universal Household.FrontendHelpers.ValidateForm('battery-form');
