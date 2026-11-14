$('#save-shopping-list-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("shopping-list-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#shopping-list-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("shopping-list-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/shopping_lists', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					window.parent.postMessage(WindowMessageBag("ShoppingListChanged", result.created_object_id), Universal Household.BaseUrl);
					window.parent.postMessage(WindowMessageBag("Ready"), Universal Household.BaseUrl);
					window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("shopping-list-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Components.UserfieldsForm.Save(function()
		{
			Universal Household.Api.Put('objects/shopping_lists/' + Universal Household.EditObjectId, jsonData,
				function(result)
				{
					window.parent.postMessage(WindowMessageBag("ShoppingListChanged", Universal Household.EditObjectId), Universal Household.BaseUrl);
					window.parent.postMessage(WindowMessageBag("Ready"), Universal Household.BaseUrl);
					window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
				},
				function(xhr)
				{
					Universal Household.FrontendHelpers.EndUiBusy("shopping-list-form");
					Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
				}
			);
		});
	}
});

$('#shopping-list-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('shopping-list-form');
});

$('#shopping-list-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('shopping-list-form'))
		{
			return false;
		}
		else
		{
			$('#save-shopping-list-button').click();
		}
	}
});

Universal Household.Components.UserfieldsForm.Load();
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);
Universal Household.FrontendHelpers.ValidateForm('shopping-list-form');
