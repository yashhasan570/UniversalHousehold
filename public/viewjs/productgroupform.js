$('#save-product-group-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("product-group-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#product-group-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("product-group-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/product_groups', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("product-group-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/product_groups/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("product-group-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#product-group-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('product-group-form');
});

$('#product-group-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('product-group-form'))
		{
			return false;
		}
		else
		{
			$('#save-product-group-button').click();
		}
	}
});

Universal Household.Components.UserfieldsForm.Load();
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);
Universal Household.FrontendHelpers.ValidateForm('product-group-form');
