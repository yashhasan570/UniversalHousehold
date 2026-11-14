$('#save-userfield-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("userfield-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#userfield-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("userfield-form");

	var redirectUrl = U("/userfields");
	if (GetUriParam("entity"))
	{
		redirectUrl = U("/userfields?entity=" + GetUriParam("entity"));
	}

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/userfields', jsonData,
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
				Universal Household.FrontendHelpers.EndUiBusy("userfield-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/userfields/' + Universal Household.EditObjectId, jsonData,
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
				Universal Household.FrontendHelpers.EndUiBusy("userfield-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#userfield-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('userfield-form');
});

$('#userfield-form select').change(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('userfield-form');
});

$('#userfield-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('userfield-form'))
		{
			return false;
		}
		else
		{
			$('#save-userfield-button').click();
		}
	}
});

$("#type").on("change", function(e)
{
	var value = $(this).val();

	if (value === "preset-list" || value === "preset-checklist")
	{
		$("#config").parent().removeClass("d-none");
		$("#config-hint").text(__t("A predefined list of values, one per line"));
	}
	else
	{
		$("#config").parent().addClass("d-none");
		$("#config-hint").text("");
	}

	$("#default-value-group").addClass("d-none");
	$("#default-value-group.userfield-type-" + value).removeClass("d-none");
});

if (GetUriParam("entity"))
{
	$("#entity").val(GetUriParam("entity"));
	$("#entity").trigger("change");
	setTimeout(function()
	{
		$('#name').focus();
	}, Universal Household.FormFocusDelay);
}
else
{
	setTimeout(function()
	{
		$('#entity').focus();
	}, Universal Household.FormFocusDelay);
}

$("#type").trigger("change");
Universal Household.FrontendHelpers.ValidateForm('userfield-form');
