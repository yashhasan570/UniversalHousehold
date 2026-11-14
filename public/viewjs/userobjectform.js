$('#save-userobject-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("userobject-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = {};
	jsonData.userentity_id = Universal Household.EditObjectParentId;

	Universal Household.FrontendHelpers.BeginUiBusy("userobject-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/userobjects', jsonData,
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
						window.location.href = U('/userobjects/' + Universal Household.EditObjectParentName);
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("userobject-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/userobjects/' + Universal Household.EditObjectId, jsonData,
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
						window.location.href = U('/userobjects/' + Universal Household.EditObjectParentName);
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("userobject-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

Universal Household.Components.UserfieldsForm.Load();
$("#userfields-form").removeClass("border").removeClass("border-info").removeClass("p-2").find("h2").addClass("d-none");

setTimeout(function()
{
	$(".userfield-input").first().focus();
}, Universal Household.FormFocusDelay);
