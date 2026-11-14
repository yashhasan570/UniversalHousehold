$('#save-barcode-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("barcode-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#barcode-form').serializeJSON();
	jsonData.amount = jsonData.display_amount;
	delete jsonData.display_amount;
	jsonData.qu_id = $("#qu_id").val();

	Universal Household.FrontendHelpers.BeginUiBusy("barcode-form");

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/product_barcodes', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save()

				window.parent.postMessage(WindowMessageBag("ProductBarcodesChanged"), Universal Household.BaseUrl);
				window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("barcode-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Components.UserfieldsForm.Save();
		Universal Household.Api.Put('objects/product_barcodes/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				window.parent.postMessage(WindowMessageBag("ProductBarcodesChanged"), Universal Household.BaseUrl);
				window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("barcode-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$('#barcode').on('keyup', function(e)
{
	Universal Household.FrontendHelpers.ValidateForm('barcode-form');
});

$('#qu_id').on('change', function(e)
{
	Universal Household.FrontendHelpers.ValidateForm('barcode-form');
});

$('#display_amount').on('keyup', function(e)
{
	Universal Household.FrontendHelpers.ValidateForm('barcode-form');
});

$('#barcode-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('barcode-form'))
		{
			return false;
		}
		else
		{
			$('#save-barcode-button').click();
		}
	}
});

Universal Household.Components.ProductAmountPicker.Reload(Universal Household.EditObjectProduct.id, Universal Household.EditObjectProduct.qu_id_purchase);
if (Universal Household.EditMode == "edit")
{
	$("#display_amount").val(Universal Household.EditObject.amount);
	$(".input-group-productamountpicker").trigger("change");

	if (Universal Household.EditObject.qu_id)
	{
		Universal Household.Components.ProductAmountPicker.SetQuantityUnit(Universal Household.EditObject.qu_id);
	}
}

Universal Household.FrontendHelpers.ValidateForm('barcode-form');
setTimeout(function()
{
	$('#barcode').focus();
}, Universal Household.FormFocusDelay);
RefreshLocaleNumberInput();
Universal Household.Components.UserfieldsForm.Load()

$(document).on("Universal Household.BarcodeScanned", function(e, barcode, target)
{
	if (target !== "#barcode")
	{
		return;
	}

	$("#barcode").val(barcode);
});
