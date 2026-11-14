$('#save-chore-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("chore-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#chore-form').serializeJSON();
	jsonData.start_date = Universal Household.Components.DateTimePicker.GetValue();

	if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_CHORES_ASSIGNMENTS)
	{
		jsonData.assignment_config = $("#assignment_config").val().join(",");
	}

	Universal Household.FrontendHelpers.BeginUiBusy("chore-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/chores', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					Universal Household.Api.Post('chores/executions/calculate-next-assignments', { "chore_id": Universal Household.EditObjectId },
						function(result)
						{
							window.location.href = U('/chores');
						},
						function(xhr)
						{
							Universal Household.FrontendHelpers.EndUiBusy();
							console.error(xhr);
						}
					);
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("chore-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/chores/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					Universal Household.Api.Post('chores/executions/calculate-next-assignments', { "chore_id": Universal Household.EditObjectId },
						function(result)
						{
							window.location.href = U('/chores');
						},
						function(xhr)
						{
							Universal Household.FrontendHelpers.EndUiBusy();
							console.error(xhr);
						}
					);
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("chore-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#chore-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('chore-form');
});

$('#chore-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('chore-form'))
		{
			return false;
		}
		else
		{
			$('#save-chore-button').click();
		}
	}
});

var checkboxValues = $("#period_config").val().split(",");
for (var i = 0; i < checkboxValues.length; i++)
{
	if (checkboxValues[i])
	{
		$("#" + checkboxValues[i]).prop('checked', true);
	}
}

Universal Household.Components.UserfieldsForm.Load();
Universal Household.FrontendHelpers.ValidateForm('chore-form');
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);

if (Universal Household.EditMode == "edit")
{
	Universal Household.Api.Get('objects/chores_log?limit=1&query[]=chore_id=' + Universal Household.EditObjectId,
		function(journalEntries)
		{
			if (journalEntries.length > 0)
			{
				$(".datetimepicker-input").attr("disabled", "");
			}
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);
}

setTimeout(function()
{
	$(".input-group-chore-period-type").trigger("change");
	$(".input-group-chore-assignment-type").trigger("change");

	// Click twice to trigger on-click but not change the actual checked state
	$("#consume_product_on_execution").click();
	$("#consume_product_on_execution").click();

	Universal Household.Components.ProductPicker.GetPicker().trigger('change');
}, Universal Household.FormFocusDelay);

$('.input-group-chore-period-type').on('change keyup', function(e)
{
	var periodType = $('#period_type').val();
	var periodDays = $('#period_days').val();
	var periodInterval = $('#period_interval').val();

	$(".period-type-input").addClass("d-none");
	$(".period-type-" + periodType).removeClass("d-none");
	$("#period_config").val("");

	if (periodType === 'manually')
	{
		$('#chore-schedule-info').text(__t('This means the next execution of this chore is not scheduled'));
		$("#period_days").val(1);
		$("#period_interval").val(1);
	}
	else if (periodType === 'hourly')
	{
		$('#chore-schedule-info').text(__n(periodInterval, "This means the next execution of this chore is scheduled %s hour after the last execution", "This means the next execution of this chore is scheduled %s hours after the last execution"));
	}
	else if (periodType === 'daily')
	{
		$('#chore-schedule-info').text(__n(periodInterval, "This means the next execution of this chore is scheduled at the same time (based on the start date) every day", "This means the next execution of this chore is scheduled at the same time (based on the start date) every %s days"));
		$("#period_days").val(1);
	}
	else if (periodType === 'weekly')
	{
		$('#chore-schedule-info').text(__n(periodInterval, "This means the next execution of this chore is scheduled every week on the selected weekdays", "This means the next execution of this chore is scheduled every %s weeks on the selected weekdays"));
		$("#period_config").val($(".period-type-weekly input:checkbox:checked").map(function() { return this.value; }).get().join(","));
		$("#period_days").val(1);
	}
	else if (periodType === 'monthly')
	{
		$('#chore-schedule-info').text(__n(periodInterval, "This means the next execution of this chore is scheduled on the selected day every month", "This means the next execution of this chore is scheduled on the selected day every %s months"));
		$("label[for='period_days']").text(__t("Day of month"));
		$("#period_days").attr("min", "1");
		$("#period_days").attr("max", "31");
	}
	else if (periodType === 'yearly')
	{
		$('#chore-schedule-info').text(__n(periodInterval, 'This means the next execution of this chore is scheduled every year on the same day (based on the start date)', 'This means the next execution of this chore is scheduled every %s years on the same day (based on the start date)'));
		$("#period_days").val(1);
	}
	else if (periodType === 'adaptive')
	{
		$('#chore-schedule-info').text(__t('This means the next execution of this chore is scheduled dynamically based on the past average execution frequency'));
		$("#period_days").val(1);
		$("#period_interval").val(1);
	}

	Universal Household.FrontendHelpers.ValidateForm('chore-form');
});

$('.input-group-chore-assignment-type').on('change', function(e)
{
	var assignmentType = $('#assignment_type').val();

	$('#chore-period-assignment-info').text("");
	$("#assignment_config").removeAttr("required");
	$("#assignment_config").attr("disabled", "");

	if (assignmentType === 'no-assignment')
	{
		$('#chore-assignment-type-info').text(__t('This means the next execution of this chore will not be assigned to anyone'));
	}
	else if (assignmentType === 'who-least-did-first')
	{
		$('#chore-assignment-type-info').text(__t('This means the next execution of this chore will be assigned to the one who executed it least'));
		$("#assignment_config").attr("required", "");
		$("#assignment_config").removeAttr("disabled");
	}
	else if (assignmentType === 'random')
	{
		$('#chore-assignment-type-info').text(__t('This means the next execution of this chore will be assigned randomly'));
		$("#assignment_config").attr("required", "");
		$("#assignment_config").removeAttr("disabled");
	}
	else if (assignmentType === 'in-alphabetical-order')
	{
		$('#chore-assignment-type-info').text(__t('This means the next execution of this chore will be assigned to the next one in alphabetical order'));
		$("#assignment_config").attr("required", "");
		$("#assignment_config").removeAttr("disabled");
	}

	Universal Household.FrontendHelpers.ValidateForm('chore-form');
});

$("#consume_product_on_execution").on("click", function()
{
	if (this.checked)
	{
		Universal Household.Components.ProductPicker.Enable();
		$("#product_amount").removeAttr("disabled");
	}
	else
	{
		Universal Household.Components.ProductPicker.Disable();
		$("#product_amount").attr("disabled", "");
	}

	Universal Household.FrontendHelpers.ValidateForm("chore-form");
});

Universal Household.Components.ProductPicker.GetPicker().on('change', function(e)
{
	var productId = $(e.target).val();

	if (productId)
	{
		Universal Household.Api.Get('stock/products/' + productId,
			function(productDetails)
			{
				$('#amount_qu_unit').text(productDetails.quantity_unit_stock.name);
			},
			function(xhr)
			{
				console.error(xhr);
			}
		);
	}
});

$(document).on('click', '.chore-householdcode-label-print', function(e)
{
	e.preventDefault();

	var choreId = $(e.currentTarget).attr('data-chore-id');
	Universal Household.Api.Get('chores/' + choreId + '/printlabel', function(labelData)
	{
		if (Universal Household.Webhooks.labelprinter !== undefined)
		{
			Universal Household.FrontendHelpers.RunWebhook(Universal Household.Webhooks.labelprinter, labelData);
		}
	});
});
