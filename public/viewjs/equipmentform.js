$('#save-equipment-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("equipment-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#equipment-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("equipment-form");

	if ($("#instruction-manual")[0].files.length > 0)
	{
		jsonData.instruction_manual_file_name = RandomString() + CleanFileName($("#instruction-manual")[0].files[0].name);
	}

	if (Universal Household.DeleteInstructionManualOnSave)
	{
		jsonData.instruction_manual_file_name = null;
	}

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/equipment', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					if (jsonData.hasOwnProperty("instruction_manual_file_name") && !Universal Household.DeleteInstructionManualOnSave)
					{
						Universal Household.Api.UploadFile($("#instruction-manual")[0].files[0], 'equipmentmanuals', jsonData.instruction_manual_file_name,
							function(result)
							{
								window.location.href = U('/equipment');
							},
							function(xhr)
							{
								Universal Household.FrontendHelpers.EndUiBusy("equipment-form");
								Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
							}
						);
					}
					else
					{
						window.location.href = U('/equipment');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("equipment-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		if (Universal Household.DeleteInstructionManualOnSave)
		{
			Universal Household.Api.DeleteFile(Universal Household.InstructionManualFileNameName, 'equipmentmanuals',
				function(result)
				{
					// Nothing to do
				},
				function(xhr)
				{
					Universal Household.FrontendHelpers.EndUiBusy("equipment-form");
					Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
				}
			);
		};

		Universal Household.Api.Put('objects/equipment/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				Universal Household.Components.UserfieldsForm.Save(function()
				{
					if (jsonData.hasOwnProperty("instruction_manual_file_name") && !Universal Household.DeleteInstructionManualOnSave)
					{
						Universal Household.Api.UploadFile($("#instruction-manual")[0].files[0], 'equipmentmanuals', jsonData.instruction_manual_file_name,
							function(result)
							{
								window.location.href = U('/equipment');
							},
							function(xhr)
							{
								Universal Household.FrontendHelpers.EndUiBusy("equipment-form");
								Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
							}
						);
					}
					else
					{
						window.location.href = U('/equipment');
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("equipment-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#equipment-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('equipment-form');
});

$('#equipment-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('equipment-form'))
		{
			return false;
		}
		else
		{
			$('#save-equipment-button').click();
		}
	}
});

Universal Household.DeleteInstructionManualOnSave = false;
$('#delete-current-instruction-manual-button').on('click', function(e)
{
	Universal Household.DeleteInstructionManualOnSave = true;
	$("#current-equipment-instruction-manual").addClass("d-none");
	$("#delete-current-instruction-manual-on-save-hint").removeClass("d-none");
	$("#delete-current-instruction-manual-button").addClass("disabled");
	$("#instruction-manual-label").addClass("d-none");
	$("#instruction-manual-label-none").removeClass("d-none");
});
ResizeResponsiveEmbeds();

Universal Household.Components.UserfieldsForm.Load();
Universal Household.FrontendHelpers.ValidateForm('equipment-form');
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);

$("#instruction-manual").on("change", function(e)
{
	$("#instruction-manual-label").removeClass("d-none");
	$("#instruction-manual-label-none").addClass("d-none");
	$("#delete-current-instruction-manual-on-save-hint").addClass("d-none");
	$("#current-instruction-manuale").addClass("d-none");
	Universal Household.DeleteProductPictureOnSave = false;
});
