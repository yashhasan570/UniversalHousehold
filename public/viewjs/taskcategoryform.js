$('#save-task-category-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("task-category-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#task-category-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("task-category-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/task_categories', jsonData,
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
						window.location.href = U('/taskcategories');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("task-category-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/task_categories/' + Universal Household.EditObjectId, jsonData,
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
						window.location.href = U('/taskcategories');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("task-category-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#task-category-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('task-category-form');
});

$('#task-category-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('task-category-form'))
		{
			return false;
		}
		else
		{
			$('#save-task-category-button').click();
		}
	}
});

Universal Household.Components.UserfieldsForm.Load();
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);
Universal Household.FrontendHelpers.ValidateForm('task-category-form');
