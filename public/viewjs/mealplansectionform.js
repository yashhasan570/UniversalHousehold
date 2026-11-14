$('#save-mealplansection-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("mealplansection-form", true))
	{
		return;
	}

	var jsonData = $('#mealplansection-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("mealplansection-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/meal_plan_sections', jsonData,
			function(result)
			{
				if (GetUriParam("embedded") !== undefined)
				{
					window.parent.postMessage(WindowMessageBag("Reload"), Universal Household.BaseUrl);
				}
				else
				{
					window.location.href = U('/mealplansections');
				}
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("mealplansection-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/meal_plan_sections/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				if (GetUriParam("embedded") !== undefined)
				{
					window.parent.postMessage(WindowMessageBag("Reload"), Universal Household.BaseUrl);
				}
				else
				{
					window.location.href = U('/mealplansections');
				}
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("mealplansection-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#mealplansection-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('mealplansection-form');
});

$('#mealplansection-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('mealplansection-form'))
		{
			return false;
		}
		else
		{
			$('#save-mealplansections-button').click();
		}
	}
});

Universal Household.FrontendHelpers.ValidateForm('mealplansection-form');
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);
