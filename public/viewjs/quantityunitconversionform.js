$('#save-quconversion-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("quconversion-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#quconversion-form').serializeJSON();
	jsonData.from_qu_id = $("#from_qu_id").val();
	Universal Household.FrontendHelpers.BeginUiBusy("quconversion-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/quantity_unit_conversions', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					if (typeof GetUriParam("qu-unit") !== "undefined")
					{
						if (GetUriParam("embedded") !== undefined)
						{
							window.parent.postMessage(WindowMessageBag("Reload"), Universal Household.BaseUrl);
						}
						else
						{
							window.location.href = U("/quantityunit/" + GetUriParam("qu-unit"));
						}
					}
					else
					{
						window.parent.postMessage(WindowMessageBag("ProductQUConversionChanged"), Universal Household.BaseUrl);
						window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("quconversion-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/quantity_unit_conversions/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					if (typeof GetUriParam("qu-unit") !== "undefined")
					{
						if (GetUriParam("embedded") !== undefined)
						{
							window.parent.postMessage(WindowMessageBag("Reload"), Universal Household.BaseUrl);
						}
						else
						{
							window.location.href = U("/quantityunit/" + GetUriParam("qu-unit"));
						}
					}
					else
					{
						window.parent.postMessage(WindowMessageBag("ProductQUConversionChanged"), Universal Household.BaseUrl);
						window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("quconversion-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#quconversion-form input').keyup(function(event)
{
	$('.input-group-qu').trigger('change');
	Universal Household.FrontendHelpers.ValidateForm('quconversion-form');
});

$('#quconversion-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('quconversion-form'))
		{
			return false;
		}
		else
		{
			$('#save-quconversion-button').click();
		}
	}
});

$('.input-group-qu').on('change', function(e)
{
	var fromQuId = $("#from_qu_id").val();
	var toQuId = $("#to_qu_id").val();
	var factor = Number.parseFloat($('#factor').val());

	if (fromQuId == toQuId)
	{
		var validationMessage = __t('This cannot be equal to %s', $("#from_qu_id option:selected").text());
		$("#to_qu_id").parent().find(".invalid-feedback").text(validationMessage);
		$("#to_qu_id")[0].setCustomValidity(validationMessage);
	}
	else
	{
		$("#to_qu_id")[0].setCustomValidity("");
	}

	if (fromQuId && toQuId)
	{
		$('#qu-conversion-info').text(__t('This means 1 %1$s is the same as %2$s %3$s', $("#from_qu_id option:selected").text(), (1.0 * factor).toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Universal Household.UserSettings.stock_decimal_places_amounts }), __n((1.0 * factor).toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Universal Household.UserSettings.stock_decimal_places_amounts }), $("#to_qu_id option:selected").text(), $("#to_qu_id option:selected").data("plural-form"), true)));
		$('#qu-conversion-info').removeClass('d-none');
		$('#qu-conversion-inverse-info').removeClass('d-none');
		$('#qu-conversion-inverse-info').text(__t('This means 1 %1$s is the same as %2$s %3$s', $("#to_qu_id option:selected").text(), (1.0 / factor).toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Universal Household.UserSettings.stock_decimal_places_amounts }), __n((1.0 / factor), $("#from_qu_id option:selected").text(), $("#from_qu_id option:selected").data("plural-form"), true)));
	}
	else
	{
		$('#qu-conversion-info').addClass('d-none');
		$('#qu-conversion-inverse-info').addClass('d-none');
	}

	Universal Household.FrontendHelpers.ValidateForm('quconversion-form');
});

Universal Household.Components.UserfieldsForm.Load();
$('.input-group-qu').trigger('change');
Universal Household.FrontendHelpers.ValidateForm('quconversion-form');
setTimeout(function()
{
	$('#from_qu_id').focus();
}, Universal Household.FormFocusDelay);

if (GetUriParam("qu-unit") !== undefined)
{
	$("#from_qu_id").attr("disabled", "");
}
