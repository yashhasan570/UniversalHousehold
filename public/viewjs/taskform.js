$('.save-task-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("task-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#task-form').serializeJSON();
	jsonData.assigned_to_user_id = jsonData.user_id;
	delete jsonData.user_id;
	jsonData.due_date = Universal Household.Components.DateTimePicker.GetValue();

	Universal Household.FrontendHelpers.BeginUiBusy("task-form");

	if (Universal Household.EditMode === 'create')
	{
		var addAnother = $(e.currentTarget).hasClass("add-another");

		Universal Household.Api.Post('objects/tasks', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					if (GetUriParam("embedded") !== undefined)
					{
						if (addAnother)
						{
							window.location.href = U('/task/new?embedded');
						}
						else
						{
							window.parent.postMessage(WindowMessageBag("Reload"), Universal Household.BaseUrl);
						}
					}
					else
					{
						if (addAnother)
						{
							window.location.href = U('/task/new');
						}
						else
						{
							window.location.href = U('/tasks');
						}
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("task-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/tasks/' + Universal Household.EditObjectId, jsonData,
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
						window.location.href = U('/tasks');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("task-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#task-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('task-form');
});

$('#task-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('task-form'))
		{
			return false;
		}
		else
		{
			$('.save-task-button').first().click();
		}
	}
});

Universal Household.Components.UserfieldsForm.Load();
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);
Universal Household.Components.DateTimePicker.GetInputElement().trigger('input');
Universal Household.FrontendHelpers.ValidateForm('task-form');
