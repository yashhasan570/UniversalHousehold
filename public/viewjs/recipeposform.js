Universal Household.RecipePosFormInitialLoadDone = false;

$('#save-recipe-pos-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("recipe-pos-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#recipe-pos-form').serializeJSON();
	jsonData.recipe_id = Universal Household.EditObjectParentId;
	delete jsonData.display_amount;

	Universal Household.FrontendHelpers.BeginUiBusy("recipe-pos-form");

	if (GetUriParam("flow") === "InplaceAddBarcodeToExistingProduct")
	{
		var jsonDataBarcode = {};
		jsonDataBarcode.barcode = GetUriParam("barcode");
		jsonDataBarcode.product_id = jsonData.product_id;

		Universal Household.Api.Post('objects/product_barcodes', jsonDataBarcode,
			function(result)
			{
				$("#flow-info-InplaceAddBarcodeToExistingProduct").addClass("d-none");
				$('#barcode-lookup-disabled-hint').addClass('d-none');
				$('#barcode-lookup-hint').removeClass('d-none');
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("inventory-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/recipes_pos', jsonData,
			function(result)
			{
				window.parent.postMessage(WindowMessageBag("IngredientsChanged"), Universal Household.BaseUrl);
				window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("recipe-pos-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/recipes_pos/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				window.parent.postMessage(WindowMessageBag("IngredientsChanged"), Universal Household.BaseUrl);
				window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("recipe-pos-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

Universal Household.Components.ProductPicker.GetPicker().on('change', function(e)
{
	var productId = $(e.target).val();

	if (productId)
	{
		Universal Household.Api.Get('stock/products/' + productId,
			function(productDetails)
			{
				if (!Universal Household.RecipePosFormInitialLoadDone)
				{
					Universal Household.Components.ProductAmountPicker.Reload(productDetails.product.id, productDetails.quantity_unit_stock.id, true);
				}
				else
				{
					Universal Household.Components.ProductAmountPicker.Reload(productDetails.product.id, productDetails.quantity_unit_stock.id);
				}

				if (Universal Household.Mode == "create")
				{
					$("#not_check_stock_fulfillment").prop("checked", productDetails.product.not_check_stock_fulfillment_for_recipes == 1);
				}

				if (!$("#only_check_single_unit_in_stock").prop("checked") && Universal Household.RecipePosFormInitialLoadDone)
				{
					Universal Household.Components.ProductAmountPicker.SetQuantityUnit(productDetails.quantity_unit_stock.id);
				}

				$('#display_amount').focus();
				Universal Household.FrontendHelpers.ValidateForm('recipe-pos-form');
				Universal Household.RecipePosFormInitialLoadDone = true;
			},
			function(xhr)
			{
				console.error(xhr);
			}
		);
	}
});

Universal Household.FrontendHelpers.ValidateForm('recipe-pos-form');

if (!Universal Household.Components.ProductPicker.InAnyFlow())
{
	if (GetUriParam("product") !== undefined || Universal Household.EditMode == "edit")
	{
		Universal Household.Components.ProductPicker.GetPicker().trigger('change');

		setTimeout(function()
		{
			$("#display_amount").focus();
		}, Universal Household.FormFocusDelay);
	}
	else
	{
		setTimeout(function()
		{
			Universal Household.Components.ProductPicker.GetInputElement().focus();
		}, Universal Household.FormFocusDelay);
	}
}
else
{
	Universal Household.Components.ProductPicker.GetPicker().trigger('change');

	if (Universal Household.Components.ProductPicker.InProductModifyWorkflow())
	{
		setTimeout(function()
		{
			Universal Household.Components.ProductPicker.GetInputElement().focus();
		}, Universal Household.FormFocusDelay);
	}
}

if (Universal Household.EditMode == "create")
{
	Universal Household.RecipePosFormInitialLoadDone = true;
}

$('#display_amount').on('focus', function(e)
{
	if (Universal Household.Components.ProductPicker.GetValue().length === 0)
	{
		setTimeout(function()
		{
			Universal Household.Components.ProductPicker.GetInputElement().focus();
		}, Universal Household.FormFocusDelay);
	}
	else
	{
		$(this).select();
	}
});

$('#recipe-pos-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('recipe-pos-form');
});

$('#qu_id').change(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('recipe-pos-form');
});

$('#recipe-pos-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('recipe-pos-form'))
		{
			return false;
		}
		else
		{
			$('#save-recipe-pos-button').click();
		}
	}
});

$("#only_check_single_unit_in_stock").on("change", function()
{
	if (this.checked)
	{
		$("#display_amount").attr("min", Universal Household.DefaultMinAmount);
		Universal Household.Components.ProductAmountPicker.AllowAnyQu(true);
		Universal Household.FrontendHelpers.ValidateForm("recipe-pos-form");
	}
	else
	{
		$("#display_amount").attr("min", "0");
		Universal Household.Components.ProductPicker.GetPicker().trigger("change"); // Selects the default quantity unit of the selected product
		Universal Household.Components.ProductAmountPicker.AllowAnyQuEnabled = false;
		Universal Household.FrontendHelpers.ValidateForm("recipe-pos-form");
	}
});

if ($("#only_check_single_unit_in_stock").prop("checked"))
{
	Universal Household.Components.ProductAmountPicker.AllowAnyQu(true);
}
