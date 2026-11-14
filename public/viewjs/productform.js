function saveProductPicture(result, location, jsonData)
{
	var productId = Universal Household.EditObjectId || result.created_object_id;
	Universal Household.EditObjectId = productId; // Universal Household.EditObjectId is not yet set when adding a product

	Universal Household.Components.UserfieldsForm.Save(() =>
	{
		if (jsonData.hasOwnProperty("picture_file_name") && !Universal Household.DeleteProductPictureOnSave)
		{
			Universal Household.Api.UploadFile($("#product-picture")[0].files[0], 'productpictures', jsonData.picture_file_name,
				(result) =>
				{
					if (Universal Household.ProductEditFormRedirectUri == "reload")
					{
						window.location.reload();
						return;
					}

					var returnTo = GetUriParam('returnto');
					if (GetUriParam("closeAfterCreation") !== undefined)
					{
						window.close();
					}
					else if (returnTo !== undefined)
					{
						if (GetUriParam("flow") !== undefined)
						{
							window.location.href = U(returnTo) + '&product-name=' + encodeURIComponent($('#name').val());
						}
						else
						{
							window.location.href = U(returnTo);
						}

					}
					else
					{
						window.location.href = U(location + productId);
					}

				},
				(xhr) =>
				{
					Universal Household.FrontendHelpers.EndUiBusy("product-form");
					Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
				}
			);
		}
		else
		{
			if (Universal Household.ProductEditFormRedirectUri == "reload")
			{
				window.location.reload();
				return
			}

			var returnTo = GetUriParam('returnto');
			if (GetUriParam("closeAfterCreation") !== undefined)
			{
				window.close();
			}
			else if (returnTo !== undefined)
			{
				if (GetUriParam("flow") !== undefined)
				{
					window.location.href = U(returnTo) + '&product-name=' + encodeURIComponent($('#name').val());
				}
				else
				{
					window.location.href = U(returnTo);
				}
			}
			else
			{
				window.location.href = U(location + productId);
			}
		}
	});
}

$('.save-product-button').on('click', function (e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("product-form", true))
	{
		return;
	}

	var jsonData = $('#product-form').serializeJSON();
	var parentProductId = jsonData.product_id;
	delete jsonData.product_id;
	jsonData.parent_product_id = parentProductId;
	Universal Household.FrontendHelpers.BeginUiBusy("product-form");

	if ($("#product-picture")[0].files.length > 0)
	{
		jsonData.picture_file_name = RandomString() + CleanFileName($("#product-picture")[0].files[0].name);
	}

	const location = $(e.currentTarget).attr('data-location') == 'return' ? '/products?product=' : '/product/';

	if (Universal Household.EditMode == 'create')
	{
		Universal Household.Api.Post('objects/products', jsonData,
			(result) => saveProductPicture(result, location, jsonData),
			(xhr) =>
			{
				Universal Household.FrontendHelpers.EndUiBusy("product-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			});
		return;
	}

	if (Universal Household.DeleteProductPictureOnSave)
	{
		jsonData.picture_file_name = null;

		Universal Household.Api.DeleteFile(Universal Household.ProductPictureFileName, 'productpictures',
			function (result)
			{
				// Nothing to do
			},
			function (xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("product-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}

	Universal Household.Api.Put('objects/products/' + Universal Household.EditObjectId, jsonData,
		(result) => saveProductPicture(result, location, jsonData),
		function (xhr)
		{
			Universal Household.FrontendHelpers.EndUiBusy("product-form");
			Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
		}
	);
});

if (GetUriParam("flow") == "InplaceNewProductWithName")
{
	$('#name').val(GetUriParam("name"));
}

if (GetUriParam("flow") !== undefined || GetUriParam("returnto") !== undefined)
{
	$("#save-hint").addClass("d-none");
	$(".save-product-button[data-location='return']").addClass("d-none");
}

$('.input-group-qu').on('change', function (e)
{
	$("#tare_weight_qu_info").text($("#qu_id_stock option:selected").text());
	$("#quick_consume_qu_info").text($("#qu_id_stock option:selected").text());
	$("#quick_open_qu_info").text($("#qu_id_stock option:selected").text());
	$("#energy_qu_info").text(Universal Household.EnergyUnit + " / " + $("#qu_id_stock option:selected").text());

	Universal Household.FrontendHelpers.ValidateForm('product-form');
});

$('#product-form input').keyup(function (event)
{
	Universal Household.FrontendHelpers.ValidateForm('product-form');
	$(".input-group-qu").trigger("change");
	$("#product-form select").trigger("select");

	if (!Universal Household.FrontendHelpers.ValidateForm('product-form'))
	{
		$("#qu-conversion-add-button").addClass("disabled");
		$("#barcode-add-button").addClass("disabled");
	}
	else
	{
		$("#qu-conversion-add-button").removeClass("disabled");
	}
});

$('#location_id').change(function (event)
{
	Universal Household.FrontendHelpers.ValidateForm('product-form');
});

$('#product-form input').keydown(function (event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('product-form'))
		{
			return false;
		}
		else
		{
			$('.default-submit-button').click();
		}
	}
});

$("#enable_tare_weight_handling").on("click", function ()
{
	if (this.checked)
	{
		$("#tare_weight").removeAttr("disabled");
	}
	else
	{
		$("#tare_weight").attr("disabled", "");
	}

	Universal Household.FrontendHelpers.ValidateForm("product-form");
});

$("#product-picture").on("change", function (e)
{
	$("#product-picture-label").removeClass("d-none");
	$("#product-picture-label-none").addClass("d-none");
	$("#delete-current-product-picture-on-save-hint").addClass("d-none");
	$("#current-product-picture").addClass("d-none");
	Universal Household.DeleteProductPictureOnSave = false;
});

Universal Household.DeleteProductPictureOnSave = false;
$("#delete-current-product-picture-button").on("click", function (e)
{
	Universal Household.DeleteProductPictureOnSave = true;
	$("#current-product-picture").addClass("d-none");
	$("#delete-current-product-picture-on-save-hint").removeClass("d-none");
	$("#product-picture-label").addClass("d-none");
	$("#product-picture-label-none").removeClass("d-none");
});

var quConversionsTable = $('#qu-conversions-table-products').DataTable({
	'order': [[1, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#qu-conversions-table-products tbody').removeClass("d-none");
quConversionsTable.columns.adjust().draw();

var barcodeTable = $('#barcode-table').DataTable({
	'order': [[1, 'asc']],
	"orderFixed": [[1, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 },
		{ 'visible': false, 'targets': 5 },
		{ 'visible': false, 'targets': 6 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#barcode-table tbody').removeClass("d-none");
barcodeTable.columns.adjust().draw();

Universal Household.Components.UserfieldsForm.Load();
$("#name").trigger("keyup");
$('.input-group-qu').trigger('change');
Universal Household.FrontendHelpers.ValidateForm('product-form');
setTimeout(function ()
{
	$('#name').focus();
}, Universal Household.FormFocusDelay);

$(document).on('click', '.product-householdcode-label-print', function (e)
{
	e.preventDefault();

	var productId = $(e.currentTarget).attr('data-product-id');
	Universal Household.Api.Get('stock/products/' + productId + '/printlabel', function (labelData)
	{
		if (Universal Household.Webhooks.labelprinter !== undefined)
		{
			Universal Household.FrontendHelpers.RunWebhook(Universal Household.Webhooks.labelprinter, labelData);
		}
	});
});

$(document).on('click', '.qu-conversion-delete-button', function (e)
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
		callback: function (result)
		{
			if (result === true)
			{
				Universal Household.Api.Delete('objects/quantity_unit_conversions/' + objectId, {},
					function (result)
					{
						Universal Household.ProductEditFormRedirectUri = "reload";
						$('#save-product-button').click();
					},
					function (xhr)
					{
						console.error(xhr);
					}
				);
			}
		}
	});
});

$(document).on('click', '.barcode-delete-button', function (e)
{
	var objectId = $(e.currentTarget).attr('data-barcode-id');

	bootbox.confirm({
		message: __t('Are you sure you want to remove this barcode?'),
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
		callback: function (result)
		{
			if (result === true)
			{
				Universal Household.Api.Delete('objects/product_barcodes/' + objectId, {},
					function (result)
					{
						Universal Household.ProductEditFormRedirectUri = "reload";
						$('#save-product-button').click();
					},
					function (xhr)
					{
						console.error(xhr);
					}
				);
			}
		}
	});
});

var quIdStockBefore = $("#qu_id_stock").val();
$('#qu_id_stock').change(function (e)
{
	// Preset qu_id_purchase / qu_id_consume / qu_id_price by qu_id_stock if unset or identical

	var quIdStock = $('#qu_id_stock');
	var quIdPurchase = $('#qu_id_purchase');
	var quIdConsume = $('#qu_id_consume');
	var quIdPrice = $('#qu_id_price');

	if (quIdPurchase[0].selectedIndex === 0 && quIdStock[0].selectedIndex !== 0 || quIdStockBefore == quIdPurchase.val())
	{
		quIdPurchase[0].selectedIndex = quIdStock[0].selectedIndex;
	}

	if (quIdConsume[0].selectedIndex === 0 && quIdStock[0].selectedIndex !== 0 || quIdStockBefore == quIdConsume.val())
	{
		quIdConsume[0].selectedIndex = quIdStock[0].selectedIndex;
	}

	if (quIdPrice[0].selectedIndex === 0 && quIdStock[0].selectedIndex !== 0 || quIdStockBefore == quIdPrice.val())
	{
		quIdPrice[0].selectedIndex = quIdStock[0].selectedIndex;
	}

	quIdStockBefore = quIdStock.val();

	Universal Household.FrontendHelpers.ValidateForm('product-form');
});

$(window).on("message", function (e)
{
	var data = e.originalEvent.data;

	if (data.Message === "ProductBarcodesChanged" || data.Message === "ProductQUConversionChanged")
	{
		window.location.reload();
	}
});

if (Universal Household.EditMode === 'create')
{
	if (Universal Household.UserSettings.product_presets_location_id.toString() !== '-1')
	{
		$("#location_id").val(Universal Household.UserSettings.product_presets_location_id);
	}

	if (Universal Household.UserSettings.product_presets_product_group_id.toString() !== '-1')
	{
		$("#product_group_id").val(Universal Household.UserSettings.product_presets_product_group_id);
	}

	if (Universal Household.UserSettings.product_presets_qu_id.toString() !== '-1')
	{
		$("select.input-group-qu").val(Universal Household.UserSettings.product_presets_qu_id);
	}

	if (Universal Household.UserSettings.product_presets_default_due_days.toString() !== '0')
	{
		$("#default_best_before_days").val(Universal Household.UserSettings.product_presets_default_due_days);
	}

	if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRODUCT_OPENED_TRACKING)
	{
		$("#treat_opened_as_out_of_stock").prop("checked", BoolVal(Universal Household.UserSettings.product_presets_treat_opened_as_out_of_stock));
	}

	if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_LABEL_PRINTER)
	{
		$("#default_stock_label_type").val(Universal Household.UserSettings.product_presets_default_stock_label_type);
	}
}

Universal Household.Components.ProductPicker.GetPicker().on('change', function (e)
{
	var parentProductId = $(e.target).val();

	if (parentProductId)
	{
		Universal Household.Api.Get('objects/products/' + parentProductId,
			function (parentProduct)
			{
				if (BoolVal(parentProduct.cumulate_min_stock_amount_of_sub_products))
				{

					$("#min_stock_amount").attr("disabled", "");
				}
				else
				{
					$('#min_stock_amount').removeAttr("disabled");
				}
			},
			function (xhr)
			{
				console.error(xhr);
			}
		);
	}
	else
	{
		$('#min_stock_amount').removeAttr("disabled");
	}
});

Universal Household.FrontendHelpers.ValidateForm("product-form");
Universal Household.Components.ProductPicker.GetPicker().trigger("change");

if (Universal Household.EditMode == "edit")
{
	$(".save-product-button").toggleClass("default-submit-button");
}
