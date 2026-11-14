$('#save-shopping-location-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("shoppinglocation-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#shoppinglocation-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("shoppinglocation-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/shopping_locations', jsonData,
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
						window.location.href = U('/shoppinglocations');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("shoppinglocation-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/shopping_locations/' + Universal Household.EditObjectId, jsonData,
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
						window.location.href = U('/shoppinglocations');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("shoppinglocation-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#shoppinglocation-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('shoppinglocation-form');
});

$('#shoppinglocation-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('shoppinglocation-form'))
		{
			return false;
		}
		else
		{
			$('#save-shopping-location-button').click();
		}
	}
});

Universal Household.Components.UserfieldsForm.Load();
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);
Universal Household.FrontendHelpers.ValidateForm('shoppinglocation-form');
