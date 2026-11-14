Universal Household.ShoppingListItemFormInitialLoadDone = false;

$('#save-shoppinglist-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("shoppinglist-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#shoppinglist-form').serializeJSON();
	var displayAmount = Number.parseFloat(jsonData.display_amount);
	if (!jsonData.product_id)
	{
		jsonData.amount = jsonData.display_amount;
	}
	delete jsonData.display_amount;

	Universal Household.FrontendHelpers.BeginUiBusy("shoppinglist-form");

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
				Universal Household.FrontendHelpers.EndUiBusy("shoppinglist-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}

	if (GetUriParam("updateexistingproduct") !== undefined)
	{
		jsonData.product_amount = jsonData.amount;
		delete jsonData.amount;

		jsonData.list_id = jsonData.shopping_list_id;
		delete jsonData.shopping_list_id;

		Universal Household.Api.Post('stock/shoppinglist/add-product', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save();

				if (GetUriParam("embedded") !== undefined)
				{
					Universal Household.Api.Get('stock/products/' + jsonData.product_id,
						function(productDetails)
						{
							if (GetUriParam("product") !== undefined)
							{
								window.parent.postMessage(WindowMessageBag("ShowSuccessMessage", __t("Added %1$s of %2$s to the shopping list \"%3$s\"", displayAmount.toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Universal Household.UserSettings.stock_decimal_places_amounts }) + " " + __n(displayAmount, $("#qu_id option:selected").text(), $("#qu_id option:selected").attr("data-qu-name-plural"), true), productDetails.product.name, $("#shopping_list_id option:selected").text())), Universal Household.BaseUrl);
							}

							window.parent.postMessage(WindowMessageBag("ShoppingListChanged", $("#shopping_list_id").val().toString()), Universal Household.BaseUrl);
							window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
						},
						function(xhr)
						{
							console.error(xhr);
						}
					);
				}
				else
				{
					window.location.href = U('/shoppinglist?list=' + $("#shopping_list_id").val().toString());
				}
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("shoppinglist-form");
				console.error(xhr);
			}
		);
	}
	else if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('objects/shopping_list', jsonData,
			function(result)
			{
				Universal Household.EditObjectId = result.created_object_id;
				Universal Household.Components.UserfieldsForm.Save();

				if (GetUriParam("embedded") !== undefined)
				{
					if (jsonData.product_id)
					{
						Universal Household.Api.Get('stock/products/' + jsonData.product_id,
							function(productDetails)
							{
								if (GetUriParam("product") !== undefined)
								{
									window.parent.postMessage(WindowMessageBag("ShowSuccessMessage", __t("Added %1$s of %2$s to the shopping list \"%3$s\"", displayAmount.toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Universal Household.UserSettings.stock_decimal_places_amounts }) + " " + __n(displayAmount, $("#qu_id option:selected").text(), $("#qu_id option:selected").attr("data-qu-name-plural"), true), productDetails.product.name, $("#shopping_list_id option:selected").text())), Universal Household.BaseUrl);
								}

								window.parent.postMessage(WindowMessageBag("ShoppingListChanged", $("#shopping_list_id").val().toString()), Universal Household.BaseUrl);
								window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
							},
							function(xhr)
							{
								console.error(xhr);
							}
						);
					}
					else
					{
						window.parent.postMessage(WindowMessageBag("ShoppingListChanged", $("#shopping_list_id").val().toString()), Universal Household.BaseUrl);
						window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
					}
				}
				else
				{
					window.location.href = U('/shoppinglist?list=' + $("#shopping_list_id").val().toString());
				}
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("shoppinglist-form");
				console.error(xhr);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/shopping_list/' + Universal Household.EditObjectId, jsonData,
			function(result)
			{
				Universal Household.Components.UserfieldsForm.Save();

				if (GetUriParam("embedded") !== undefined)
				{
					if (jsonData.product_id)
					{
						Universal Household.Api.Get('stock/products/' + jsonData.product_id,
							function(productDetails)
							{
								if (GetUriParam("product") !== undefined)
								{
									window.parent.postMessage(WindowMessageBag("ShowSuccessMessage", __t("Added %1$s of %2$s to the shopping list \"%3$s\"", displayAmount.toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Universal Household.UserSettings.stock_decimal_places_amounts }) + " " + __n(displayAmount, $("#qu_id option:selected").text(), $("#qu_id option:selected").attr("data-qu-name-plural"), true), productDetails.product.name, $("#shopping_list_id option:selected").text())), Universal Household.BaseUrl);
								}

								window.parent.postMessage(WindowMessageBag("ShoppingListChanged", $("#shopping_list_id").val().toString()), Universal Household.BaseUrl);
								window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
							},
							function(xhr)
							{
								console.error(xhr);
							}
						);
					}
					else
					{
						window.parent.postMessage(WindowMessageBag("ShoppingListChanged", $("#shopping_list_id").val().toString()), Universal Household.BaseUrl);
						window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
					}
				}
				else
				{
					window.location.href = U('/shoppinglist?list=' + $("#shopping_list_id").val().toString());
				}
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("shoppinglist-form");
				console.error(xhr);
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
				if (!Universal Household.ShoppingListItemFormInitialLoadDone)
				{
					Universal Household.Components.ProductAmountPicker.Reload(productDetails.product.id, productDetails.quantity_unit_stock.id, true);
				}
				else
				{
					Universal Household.Components.ProductAmountPicker.Reload(productDetails.product.id, productDetails.quantity_unit_stock.id);
					Universal Household.Components.ProductAmountPicker.SetQuantityUnit(productDetails.default_quantity_unit_purchase.id);
				}

				if (!$("#display_amount").val())
				{
					$("#display_amount").val(1);
					$("#display_amount").trigger("change");
				}

				setTimeout(function()
				{
					$('#display_amount').focus();
				}, Universal Household.FormFocusDelay);
				Universal Household.FrontendHelpers.ValidateForm('shoppinglist-form');
				Universal Household.ShoppingListItemFormInitialLoadDone = true;
			},
			function(xhr)
			{
				console.error(xhr);
			}
		);
	}

	$("#note").trigger("input");
	$("#product_id").trigger("input");
});

Universal Household.FrontendHelpers.ValidateForm('shoppinglist-form');

if (Universal Household.EditMode === "edit")
{
	Universal Household.Components.ProductPicker.GetPicker().trigger('change');
}

if (Universal Household.EditMode == "create")
{
	Universal Household.ShoppingListItemFormInitialLoadDone = true;
}

$('#display_amount').on('focus', function(e)
{
	$(this).select();
});

$('#shoppinglist-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('shoppinglist-form');
});

$('#shoppinglist-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('shoppinglist-form'))
		{
			return false;
		}
		else
		{
			$('#save-shoppinglist-button').click();
		}
	}
});

if (GetUriParam("list") !== undefined)
{
	$("#shopping_list_id").val(GetUriParam("list"));
}

if (GetUriParam("amount") !== undefined)
{
	$("#display_amount").val(Number.parseFloat(GetUriParam("amount")));
	RefreshLocaleNumberInput();
	$(".input-group-productamountpicker").trigger("change");
	Universal Household.FrontendHelpers.ValidateForm('shoppinglist-form');
}

if (!Universal Household.Components.ProductPicker.InAnyFlow())
{
	if (GetUriParam("product") !== undefined || Universal Household.EditMode == "edit")
	{
		if (GetUriParam("updateexistingproduct") != null)
		{
			Universal Household.Components.ProductPicker.GetPicker().trigger('change');
		}

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

var eitherRequiredFields = $("#product_id,#product_id_text_input,#note");
eitherRequiredFields.prop('required', "");
eitherRequiredFields.on('input', function()
{
	eitherRequiredFields.not(this).prop('required', !$(this).val().length);
	Universal Household.FrontendHelpers.ValidateForm('shoppinglist-form');
});
eitherRequiredFields.trigger("input");

if (GetUriParam("product-name") != null)
{
	Universal Household.Components.ProductPicker.GetPicker().trigger('change');
}

Universal Household.Components.UserfieldsForm.Load();
