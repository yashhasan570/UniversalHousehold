$('.save-quantityunit-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("quantityunit-form", true))
	{
		return;
	}

	var jsonData = $('#quantityunit-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("quantityunit-form");

	if (Universal Household.QuantityUnitEditFormRedirectUri !== undefined)
	{
		redirectDestination = Universal Household.QuantityUnitEditFormRedirectUri;
	}
	else
	{
		redirectDestination = U('/quantityunits');
	}

	if ($(e.currentTarget).attr('data-location') == "continue")
	{
		redirectDestination = "reload";
	}

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/quantity_units', jsonData,
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

						if (redirectDestination == "reload")
						{
							window.location.href = U("/quantityunit/" + result.created_object_id.toString());
						}
						else if (redirectDestination == "stay")
						{
							// Do nothing
						}
						else
						{
							window.location.href = redirectDestination.replace("editobjectid", Universal Household.EditObjectId);
						}
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("quantityunit-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/quantity_units/' + Universal Household.EditObjectId, jsonData,
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

						if (redirectDestination == "reload")
						{
							window.location.reload();
						}
						else if (redirectDestination == "stay")
						{
							// Do nothing
						}
						else
						{
							window.location.href = redirectDestination.replace("editobjectid", Universal Household.EditObjectId);
						}
					}
				});
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("quantityunit-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#quantityunit-form input').keyup(function(event)
{
	if ($("#name").val())
	{
		$("#qu-conversion-headline-info").text(__t('1 %s is the same as...', $("#name").val()));
	}
	else
	{
		$("#qu-conversion-headline-info").text("");
	}

	if (!Universal Household.FrontendHelpers.ValidateForm('quantityunit-form'))
	{
		$("#qu-conversion-add-button").addClass("disabled");
	}
	else
	{
		$("#qu-conversion-add-button").removeClass("disabled");
	}

	Universal Household.FrontendHelpers.ValidateForm('quantityunit-form');
});

$('#quantityunit-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('quantityunit-form'))
		{
			return false;
		}
		else
		{
			$('#save-quantityunit-button').click();
		}
	}
});

var quConversionsTable = $('#qu-conversions-table').DataTable({
	'order': [[1, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#qu-conversions-table tbody').removeClass("d-none");
quConversionsTable.columns.adjust().draw();

Universal Household.Components.UserfieldsForm.Load();
$("#name").trigger("keyup");
Universal Household.FrontendHelpers.ValidateForm('quantityunit-form');
setTimeout(function()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);

$(document).on('click', '.qu-conversion-delete-button', function(e)
{
	var objectId = $(e.currentTarget).attr('data-qu-conversion-id');

	bootbox.confirm({
		message: __t('Are you sure you want to remove this conversion?'),
		closeButton: false,
		buttons: {
			confirm: {
				label: __t('Yes'),
				className: 'btn-success'
			},
			cancel: {
				label: __t('No'),
				className: 'btn-danger'
			}
		},
		callback: function(result)
		{
			if (result === true)
			{
				Universal Household.Api.Delete('objects/quantity_unit_conversions/' + objectId, {},
					function(result)
					{
						window.location.reload();
					},
					function(xhr)
					{
						console.error(xhr);
					}
				);
			}
		}
	});
});

$("#test-quantityunit-plural-forms-button").on("click", function(e)
{
	e.preventDefault();

	Universal Household.QuantityUnitEditFormRedirectUri = "stay";
	$("#save-quantityunit-button").click();

	bootbox.alert({
		message: '<iframe class="embed-responsive" src="' + U("/quantityunitpluraltesting?embedded&qu=") + Universal Household.EditObjectId.toString() + '"></iframe>',
		closeButton: false,
		size: "large",
		callback: function(result)
		{
			Universal Household.QuantityUnitEditFormRedirectUri = undefined;
			Universal Household.FrontendHelpers.EndUiBusy("quantityunit-form");
		}
	});
});
