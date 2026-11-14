$('.save-choretracking-button').on('click', function (e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("choretracking-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var skipped = $(e.currentTarget).hasClass("skip");

	var jsonForm = $('#choretracking-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("choretracking-form");

	Universal Household.Api.Get('chores/' + jsonForm.chore_id,
		function (choreDetails)
		{
			Universal Household.Api.Post('chores/' + jsonForm.chore_id + '/execute', { 'tracked_time': Universal Household.Components.DateTimePicker.GetValue(), 'done_by': $("#user_id").val(), 'skipped': skipped },
				function (result)
				{
					Universal Household.EditObjectId = result.id;
					Universal Household.Components.UserfieldsForm.Save(function ()
					{
						Universal Household.FrontendHelpers.EndUiBusy("choretracking-form");
						toastr.success(__t('Tracked execution of chore %1$s on %2$s', choreDetails.chore.name, Universal Household.Components.DateTimePicker.GetValue()) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoChoreExecution(' + result.id + ')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>');
						Universal Household.Components.ChoreCard.Refresh($('#chore_id').val());

						$('#chore_id').val('');
						$('#chore_id_text_input').focus();
						$('#chore_id_text_input').val('');
						Universal Household.Components.DateTimePicker.SetValue(moment().format('YYYY-MM-DD HH:mm:ss'));
						$('#chore_id_text_input').trigger('change');
						Universal Household.FrontendHelpers.ValidateForm('choretracking-form');
					});
				},
				function (xhr)
				{
					Universal Household.FrontendHelpers.EndUiBusy("choretracking-form");
					console.error(xhr);
				}
			);
		},
		function (xhr)
		{
			Universal Household.FrontendHelpers.EndUiBusy("choretracking-form");
			console.error(xhr);
		}
	);
});

$('#chore_id').on('change', function (e)
{
	var input = $('#chore_id_text_input').val().toString();
	$('#chore_id_text_input').val(input);
	$('#chore_id').data('combobox').refresh();

	var choreId = $(e.target).val();
	if (choreId)
	{
		Universal Household.Api.Get('objects/chores/' + choreId,
			function (chore)
			{

				if (chore.track_date_only == 1)
				{
					Universal Household.Components.DateTimePicker.ChangeFormat("YYYY-MM-DD");
					Universal Household.Components.DateTimePicker.SetValue(moment().format("YYYY-MM-DD"));
				}
				else
				{
					Universal Household.Components.DateTimePicker.ChangeFormat("YYYY-MM-DD HH:mm:ss");
					Universal Household.Components.DateTimePicker.SetValue(moment().format("YYYY-MM-DD HH:mm:ss"));
				}

				if (chore.period_type == "manually")
				{
					$(".save-choretracking-button.skip").addClass("disabled");
				}
				else
				{
					$(".save-choretracking-button.skip").removeClass("disabled");
				}

				Universal Household.FrontendHelpers.ValidateForm('choretracking-form');
			},
			function (xhr)
			{
				console.error(xhr);
			}
		);

		Universal Household.Components.ChoreCard.Refresh(choreId);

		setTimeout(function ()
		{
			Universal Household.Components.DateTimePicker.GetInputElement().focus();
		}, Universal Household.FormFocusDelay);

		Universal Household.FrontendHelpers.ValidateForm('choretracking-form');
	}
});

$(".combobox").combobox(BootstrapComboboxDefaults);

$('#chore_id_text_input').trigger('change');
Universal Household.Components.DateTimePicker.GetInputElement().trigger('input');
Universal Household.FrontendHelpers.ValidateForm('choretracking-form');
setTimeout(function ()
{
	$('#chore_id_text_input').focus();
}, Universal Household.FormFocusDelay);

$('#choretracking-form input').keyup(function (event)
{
	Universal Household.FrontendHelpers.ValidateForm('choretracking-form');
});

$('#choretracking-form input').keydown(function (event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('choretracking-form'))
		{
			return false;
		}
		else
		{
			$('.save-choretracking-button').first().click();
		}
	}
});

$(document).on("Universal Household.BarcodeScanned", function (e, barcode, target)
{
	if (!(target == "@chorepicker" || target == "undefined" || target == undefined)) // Default target
	{
		return;
	}

	// Don't know why the blur event does not fire immediately ... this works...
	$("#chore_id_text_input").focusout();
	$("#chore_id_text_input").focus();
	$("#chore_id_text_input").blur();

	$("#chore_id_text_input").val(barcode);

	setTimeout(function ()
	{
		$("#chore_id_text_input").focusout();
		$("#chore_id_text_input").focus();
		$("#chore_id_text_input").blur();
		$('#tracked_time').find('input').focus();
	}, Universal Household.FormFocusDelay);
});

Universal Household.Components.DateTimePicker.GetInputElement().on('keypress', function (e)
{
	Universal Household.FrontendHelpers.ValidateForm('choretracking-form');
});

function UndoChoreExecution(executionId)
{
	Universal Household.Api.Post('chores/executions/' + executionId.toString() + '/undo', {},
		function (result)
		{
			toastr.success(__t("Chore execution successfully undone"));
		},
		function (xhr)
		{
			console.error(xhr);
		}
	);
};

$('#chore_id_text_input').on('blur', function (e)
{
	if ($('#chore_id').hasClass("combobox-menu-visible"))
	{
		return;
	}

	var input = $('#chore_id_text_input').val().toString();
	var possibleOptionElement = [];

	// UniversalHouseholdCode handling
	if (input.startsWith("grcy"))
	{
		var gc = input.split(":");
		if (gc[1] == "c")
		{
			possibleOptionElement = $("#chore_id option[value=\"" + gc[2] + "\"]").first();
		}

		if (possibleOptionElement.length > 0)
		{
			$('#chore_id').val(possibleOptionElement.val());
			$('#chore_id').data('combobox').refresh();
			$('#chore_id').trigger('change');
		}
		else
		{
			$('#chore_id').val(null);
			$('#chore_id_text_input').val("");
			$('#chore_id').data('combobox').refresh();
			$('#chore_id').trigger('change');
		}
	}
});

$("#tracked_time").find("input").on("focus", function (e)
{
	$(this).select();
});
