$('#save-consume-button').on('click', function (e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("consume-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonForm = $('#consume-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("consume-form");

	var apiUrl = 'stock/products/' + jsonForm.product_id + '/consume';

	var jsonData = {};
	jsonData.amount = jsonForm.amount;
	jsonData.exact_amount = $('#consume-exact-amount').is(':checked');
	jsonData.spoiled = $('#spoiled').is(':checked');
	jsonData.allow_subproduct_substitution = true;

	if ($("#use_specific_stock_entry").is(":checked"))
	{
		jsonData.stock_entry_id = jsonForm.specific_stock_entry;
	}

	if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_LOCATION_TRACKING)
	{
		jsonData.location_id = $("#location_id").val();
	}

	if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_RECIPES && Universal Household.Components.RecipePicker.GetValue().toString().length > 0)
	{
		jsonData.recipe_id = Universal Household.Components.RecipePicker.GetValue();
	}

	var bookingResponse = null;
	Universal Household.Api.Get('stock/products/' + jsonForm.product_id,
		function (productDetails)
		{
			Universal Household.Api.Post(apiUrl, jsonData,
				function (result)
				{
					if (BoolVal(Universal Household.UserSettings.scan_mode_consume_enabled))
					{
						Universal Household.UISound.Success();
					}

					bookingResponse = result;

					if (GetUriParam("flow") === "InplaceAddBarcodeToExistingProduct")
					{
						var jsonDataBarcode = {};
						jsonDataBarcode.barcode = GetUriParam("barcode");
						jsonDataBarcode.product_id = jsonForm.product_id;

						Universal Household.Api.Post('objects/product_barcodes', jsonDataBarcode,
							function (result)
							{
								$("#flow-info-InplaceAddBarcodeToExistingProduct").addClass("d-none");
								$('#barcode-lookup-disabled-hint').addClass('d-none');
								$('#barcode-lookup-hint').removeClass('d-none');
								window.history.replaceState({}, document.title, U("/consume"));
							},
							function (xhr)
							{
								Universal Household.FrontendHelpers.EndUiBusy("consume-form");
								Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
							}
						);
					}

					$("#specific_stock_entry").find("option").remove().end().append("<option></option>");
					if ($("#use_specific_stock_entry").is(":checked"))
					{
						$("#use_specific_stock_entry").click();
					}

					if (productDetails.product.enable_tare_weight_handling == 1 && !jsonData.exact_amount)
					{
						var successMessage = __t('Removed %1$s of %2$s from stock', Math.abs(jsonForm.amount - (productDetails.product.tare_weight + productDetails.stock_amount)) + " " + __n(jsonForm.amount, productDetails.quantity_unit_stock.name, productDetails.quantity_unit_stock.name_plural, true), productDetails.product.name) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoStockTransaction(\'' + bookingResponse[0].transaction_id + '\')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>';
					}
					else
					{
						var successMessage = __t('Removed %1$s of %2$s from stock', Math.abs(jsonForm.amount) + " " + __n(jsonForm.amount, productDetails.quantity_unit_stock.name, productDetails.quantity_unit_stock.name_plural, true), productDetails.product.name) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoStockTransaction(\'' + bookingResponse[0].transaction_id + '\')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>';
					}

					if (GetUriParam("embedded") !== undefined)
					{
						Universal Household.GetTopmostWindow().postMessage(WindowMessageBag("BroadcastMessage", WindowMessageBag("ProductChanged", jsonForm.product_id)), Universal Household.BaseUrl);
						window.parent.postMessage(WindowMessageBag("ShowSuccessMessage", successMessage), Universal Household.BaseUrl);
						window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
					}
					else
					{
						Universal Household.FrontendHelpers.EndUiBusy("consume-form");
						toastr.success(successMessage);
						Universal Household.Components.ProductPicker.FinishFlow();

						Universal Household.Components.ProductAmountPicker.Reset();
						$("#display_amount").attr("min", Universal Household.DefaultMinAmount);
						$("#display_amount").removeAttr("max");
						if (BoolVal(Universal Household.UserSettings.stock_default_consume_amount_use_quick_consume_amount))
						{
							$('#display_amount').val(productDetails.product.quick_consume_amount * $("#qu_id option:selected").attr("data-qu-factor"));
						}
						else
						{
							$('#display_amount').val(Universal Household.UserSettings.stock_default_consume_amount);
						}
						RefreshLocaleNumberInput();
						$(".input-group-productamountpicker").trigger("change");
						$("#tare-weight-handling-info").addClass("d-none");
						Universal Household.Components.ProductPicker.Clear();
						if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_RECIPES)
						{
							Universal Household.Components.RecipePicker.Clear();
						}
						if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_LOCATION_TRACKING)
						{
							$("#location_id").find("option").remove().end().append("<option></option>");
						}
						Universal Household.Components.ProductPicker.GetInputElement().focus();
						Universal Household.Components.ProductCard.Refresh(jsonForm.product_id);
						Universal Household.FrontendHelpers.ValidateForm('consume-form');
						$("#consume-exact-amount-group").addClass("d-none");
					}
				},
				function (xhr)
				{
					Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
					Universal Household.FrontendHelpers.EndUiBusy("consume-form");
					console.error(xhr);
				}
			);
		},
		function (xhr)
		{
			Universal Household.FrontendHelpers.EndUiBusy("consume-form");
			console.error(xhr);
		}
	);
});

$('#save-mark-as-open-button').on('click', function (e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("consume-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonForm = $('#consume-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("consume-form");

	var apiUrl = 'stock/products/' + jsonForm.product_id + '/open';

	jsonData = {};
	jsonData.amount = jsonForm.amount;
	jsonData.allow_subproduct_substitution = true;
	jsonData.location_id = jsonForm.location_id;

	if ($("#use_specific_stock_entry").is(":checked"))
	{
		jsonData.stock_entry_id = jsonForm.specific_stock_entry;
	}

	Universal Household.Api.Get('stock/products/' + jsonForm.product_id,
		function (productDetails)
		{
			Universal Household.Api.Post(apiUrl, jsonData,
				function (result)
				{
					$("#specific_stock_entry").find("option").remove().end().append("<option></option>");
					if ($("#use_specific_stock_entry").is(":checked"))
					{
						$("#use_specific_stock_entry").click();
					}

					Universal Household.FrontendHelpers.EndUiBusy("consume-form");
					toastr.success(__t('Marked %1$s of %2$s as opened', Number.parseFloat(jsonForm.amount).toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Universal Household.UserSettings.stock_decimal_places_amounts }) + " " + __n(jsonForm.amount, productDetails.quantity_unit_stock.name, productDetails.quantity_unit_stock.name_plural, true), productDetails.product.name) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoStockTransaction(\'' + result[0].transaction_id + '\')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>');

					if (productDetails.product.move_on_open == 1 && productDetails.default_consume_location != null)
					{
						toastr.info('<span>' + __t("Moved to %1$s", productDetails.default_consume_location.name) + "</span> <i class='fa-solid fa-exchange-alt'></i>");
					}

					if (BoolVal(Universal Household.UserSettings.stock_default_consume_amount_use_quick_consume_amount))
					{
						$('#display_amount').val(productDetails.product.quick_consume_amount * $("#qu_id option:selected").attr("data-qu-factor"));
					}
					else
					{
						$('#display_amount').val(Universal Household.UserSettings.stock_default_consume_amount);
					}
					RefreshLocaleNumberInput();
					$(".input-group-productamountpicker").trigger("change");
					Universal Household.Components.ProductPicker.Clear();
					Universal Household.Components.ProductPicker.GetInputElement().focus();
					Universal Household.Components.ProductCard.Refresh(jsonForm.product_id);
					Universal Household.FrontendHelpers.ValidateForm('consume-form');
				},
				function (xhr)
				{
					Universal Household.FrontendHelpers.EndUiBusy("consume-form");
					console.error(xhr);
				}
			);
		},
		function (xhr)
		{
			Universal Household.FrontendHelpers.EndUiBusy("consume-form");
			console.error(xhr);
		}
	);
});
var sumValue = 0;
var sumValueOpened = 0;
$("#location_id").on('change', function (e)
{
	var locationId = $(e.target).val();
	$("#specific_stock_entry").find("option").remove().end().append("<option></option>");
	if ($("#use_specific_stock_entry").is(":checked"))
	{
		$("#use_specific_stock_entry").click();
	}

	if (GetUriParam("embedded") !== undefined)
	{
		OnLocationChange(locationId, GetUriParam('stockId'));
	}
	else
	{
		// try to get stock id from UniversalHouseholdCode
		if ($("#product_id").data("householdcode"))
		{
			var gc = $("#product_id").attr("barcode").split(":");
			if (gc.length == 4)
			{
				Universal Household.Api.Get("stock/products/" + Universal Household.Components.ProductPicker.GetValue() + '/entries?query[]=stock_id=' + gc[3],
					function (stockEntries)
					{
						OnLocationChange(stockEntries[0].location_id, gc[3]);
						$('#display_amount').val(stockEntries[0].amount);
					},
					function (xhr)
					{
						console.error(xhr);
					}
				);
			}
			else
			{
				OnLocationChange(locationId, null);
			}
		}
		else
		{
			OnLocationChange(locationId, null);
		}
	}
});

function OnLocationChange(locationId, stockId)
{
	sumValue = 0;
	sumValueOpened = 0;

	if (locationId)
	{
		if ($("#location_id").val() != locationId)
		{
			$("#location_id").val(locationId);
		}

		Universal Household.Api.Get("stock/products/" + Universal Household.Components.ProductPicker.GetValue() + '/entries?include_sub_products=true',
			function (stockEntries)
			{
				stockEntries.forEach(stockEntry =>
				{
					var openTxt = __t("Not opened");
					if (stockEntry.open == 1)
					{
						openTxt = __n(stockEntry.amount, "Opened", "Opened");
					}

					if (stockEntry.location_id == locationId)
					{
						var noteTxt = "";
						if (stockEntry.note)
						{
							noteTxt = " " + stockEntry.note;
						}

						$("#specific_stock_entry").append($("<option>", {
							"value": stockEntry.stock_id,
							"text": __t("Amount: %1$s; Due on %2$s; Bought on %3$s", stockEntry.amount, moment(stockEntry.best_before_date).format("YYYY-MM-DD"), moment(stockEntry.purchased_date).format("YYYY-MM-DD")) + "; " + openTxt + noteTxt,
							"data-amount": stockEntry.amount,
							"data-id": stockEntry.id
						}));

						sumValue = sumValue + (stockEntry.amount || 0);

						if (BoolVal(stockEntry.open))
						{
							sumValueOpened = sumValueOpened + (stockEntry.amount || 0);
						}

						if (stockEntry.stock_id == stockId)
						{
							$("#use_specific_stock_entry").click();
							$("#specific_stock_entry").val(stockId);
						}
					}
				});



				Universal Household.Api.Get('stock/products/' + Universal Household.Components.ProductPicker.GetValue(),
					function (productDetails)
					{
						current_productDetails = productDetails;
						RefreshForm();
					},
					function (xhr)
					{
						console.error(xhr);
					}
				);

				if (document.getElementById("product_id").getAttribute("barcode") == "null" || $("#product_id").data("householdcode"))
				{
					ScanModeSubmit();
				}
			},
			function (xhr)
			{
				console.error(xhr);
			}
		);
	}
}

Universal Household.Components.ProductPicker.GetPicker().on('change', function (e)
{
	if (BoolVal(Universal Household.UserSettings.scan_mode_consume_enabled))
	{
		Universal Household.UISound.BarcodeScannerBeep();
	}

	$("#specific_stock_entry").find("option").remove().end().append("<option></option>");
	if ($("#use_specific_stock_entry").is(":checked"))
	{
		$("#use_specific_stock_entry").click();
	}
	$("#location_id").val("");

	var productId = $(e.target).val();

	if (productId)
	{
		Universal Household.Components.ProductCard.Refresh(productId);

		Universal Household.Api.Get('stock/products/' + productId,
			function (productDetails)
			{
				current_productDetails = productDetails;

				Universal Household.Components.ProductAmountPicker.Reload(productDetails.product.id, productDetails.quantity_unit_stock.id);
				Universal Household.Components.ProductAmountPicker.SetQuantityUnit(productDetails.default_quantity_unit_consume.id);
				if (BoolVal(Universal Household.UserSettings.stock_default_consume_amount_use_quick_consume_amount))
				{
					$('#display_amount').val(productDetails.product.quick_consume_amount * $("#qu_id option:selected").attr("data-qu-factor"));
				}
				else
				{
					$('#display_amount').val(Universal Household.UserSettings.stock_default_consume_amount);
				}
				RefreshLocaleNumberInput();
				$(".input-group-productamountpicker").trigger("change");

				var defaultLocationId = productDetails.location.id;
				if (productDetails.product.default_consume_location_id)
				{
					defaultLocationId = productDetails.product.default_consume_location_id;
				}

				$("#location_id").find("option").remove().end().append("<option></option>");
				Universal Household.Api.Get("stock/products/" + productId + '/locations?include_sub_products=true',
					function (stockLocations)
					{
						var setDefault = 0;
						var stockAmountAtDefaultLocation = 0;
						var addedLocations = [];
						stockLocations.forEach(stockLocation =>
						{
							if (stockLocation.location_id == defaultLocationId)
							{
								if (!addedLocations.includes(stockLocation.location_id))
								{
									$("#location_id").append($("<option>", {
										value: stockLocation.location_id,
										text: stockLocation.location_name + " (" + __t("Default location") + ")"
									}));
									$("#location_id").val(defaultLocationId);
									$("#location_id").trigger('change');
									setDefault = 1;
								}
								stockAmountAtDefaultLocation += stockLocation.amount;
							}
							else
							{
								if (!addedLocations.includes(stockLocation.location_id))
								{
									$("#location_id").append($("<option>", {
										value: stockLocation.location_id,
										text: stockLocation.location_name
									}));
								}
							}

							addedLocations.push(stockLocation.location_id);

							if (setDefault == 0)
							{
								$("#location_id").val(defaultLocationId);
								$("#location_id").trigger('change');
							}
						});

						if (stockAmountAtDefaultLocation == 0)
						{
							$("#location_id option")[1].selected = true;
							$("#location_id").trigger('change');
						}

						if (document.getElementById("product_id").getAttribute("barcode") != "null")
						{
							Universal Household.Api.Get('objects/product_barcodes?query[]=barcode=' + document.getElementById("product_id").getAttribute("barcode"),
								function (barcodeResult)
								{
									if (barcodeResult != null)
									{
										var barcode = barcodeResult[0];

										if (barcode != null)
										{
											if (barcode.amount != null)
											{
												$("#display_amount").val(barcode.amount);
												$("#display_amount").select();
											}

											if (barcode.qu_id != null)
											{
												Universal Household.Components.ProductAmountPicker.SetQuantityUnit(barcode.qu_id);
											}

											$(".input-group-productamountpicker").trigger("change");
											Universal Household.FrontendHelpers.ValidateForm('consume-form');
											RefreshLocaleNumberInput();
											ScanModeSubmit(false);
										}
									}
								},
								function (xhr)
								{
									console.error(xhr);
								}
							);
						}
					},
					function (xhr)
					{
						console.error(xhr);
					}
				);

				if (productDetails.product.enable_tare_weight_handling == 1)
				{
					$("#display_amount").attr("min", productDetails.product.tare_weight);
					$('#display_amount').attr('max', (productDetails.stock_amount + productDetails.product.tare_weight).toFixed(Universal Household.UserSettings.stock_decimal_places_amounts));
					$("#tare-weight-handling-info").removeClass("d-none");
				}
				else
				{
					$("#display_amount").attr("min", Universal Household.DefaultMinAmount);
					$("#tare-weight-handling-info").addClass("d-none");
				}

				Universal Household.Components.ProductPicker.HideCustomError();
				Universal Household.FrontendHelpers.ValidateForm('consume-form');
				setTimeout(function ()
				{
					$('#display_amount').focus();
				}, Universal Household.FormFocusDelay);
			},
			function (xhr)
			{
				console.error(xhr);
			}
		);
	}
});

$('#display_amount').val(Universal Household.UserSettings.stock_default_consume_amount);
$(".input-group-productamountpicker").trigger("change");
Universal Household.FrontendHelpers.ValidateForm('consume-form');

$('#display_amount').on('focus', function (e)
{
	$(this).select();
});

$('#price').on('focus', function (e)
{
	$(this).select();
});

$('#consume-form input').keyup(function (event)
{
	Universal Household.FrontendHelpers.ValidateForm('consume-form');
});

$('#consume-form select').change(function (event)
{
	Universal Household.FrontendHelpers.ValidateForm('consume-form');
});

$("#display_amount").on("keyup", function (e)
{
	if (!current_productDetails)
	{
		return;
	}

	if ($("#display_amount").val() > sumValue - sumValueOpened || current_productDetails.product.enable_tare_weight_handling == 1 || current_productDetails.product.disable_open == 1)
	{
		$("#save-mark-as-open-button").addClass("disabled");
	}
	else
	{
		$("#save-mark-as-open-button").removeClass("disabled");
	}
});

$('#consume-form input').keydown(function (event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('consume-form'))
		{
			return false;
		}
		else
		{
			$('#save-consume-button').click();
		}
	}
});

$("#specific_stock_entry").on("change", function (e)
{
	if ($(e.target).val() == "")
	{
		sumValue = 0;
		sumValueOpened = 0;
		Universal Household.Api.Get("stock/products/" + Universal Household.Components.ProductPicker.GetValue() + '/entries?include_sub_products=true',
			function (stockEntries)
			{
				stockEntries.forEach(stockEntry =>
				{
					if (stockEntry.location_id == $("#location_id").val() || stockEntry.location_id == "")
					{
						sumValue = sumValue + (stockEntry.amount || 0);

						if (BoolVal(stockEntry.open))
						{
							sumValueOpened = sumValueOpened + (stockEntry.amount || 0);
						}
					}
				});

				$("#display_amount").attr("max", sumValue.toFixed(Universal Household.UserSettings.stock_decimal_places_amounts));

				if (sumValue == 0)
				{
					$("#display_amount").parent().find(".invalid-feedback").text(__t('There are no units available at this location'));
				}

				if (sumValue == sumValueOpened || current_productDetails.product.enable_tare_weight_handling == 1 || current_productDetails.product.disable_open == 1)
				{
					$("#save-mark-as-open-button").addClass("disabled");
				}
				else
				{
					$("#save-mark-as-open-button").removeClass("disabled");
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
		$("#display_amount").attr("max", Number.parseFloat($('option:selected', this).attr('data-amount')).toFixed(Universal Household.UserSettings.stock_decimal_places_amounts));
	}
});

$("#use_specific_stock_entry").on("change", function ()
{
	var value = $(this).is(":checked");

	if (value)
	{
		$("#specific_stock_entry").removeAttr("disabled");
		$("#specific_stock_entry").attr("required", "");
	}
	else
	{
		$("#specific_stock_entry").attr("disabled", "");
		$("#specific_stock_entry").removeAttr("required");
		$("#specific_stock_entry").val("");
	}

	Universal Household.FrontendHelpers.ValidateForm("consume-form");
});

$("#qu_id").on("change", function ()
{
	RefreshForm();
});

function UndoStockBooking(bookingId)
{
	Universal Household.Api.Post('stock/bookings/' + bookingId.toString() + '/undo', {},
		function (result)
		{
			toastr.success(__t("Booking successfully undone"));
		},
		function (xhr)
		{
			console.error(xhr);
		}
	);
};

function UndoStockTransaction(transactionId)
{
	Universal Household.Api.Post('stock/transactions/' + transactionId.toString() + '/undo', {},
		function (result)
		{
			toastr.success(__t("Transaction successfully undone"));
		},
		function (xhr)
		{
			console.error(xhr);
		}
	);
};

if (GetUriParam("embedded") !== undefined)
{
	var locationId = GetUriParam('locationId');

	if (typeof locationId === 'undefined')
	{
		Universal Household.Components.ProductPicker.GetPicker().trigger('change');
	}
	else
	{
		$("#location_id").val(locationId);
		$("#location_id").trigger('change');
		$("#use_specific_stock_entry").click();
		$("#use_specific_stock_entry").trigger('change');
		Universal Household.Components.ProductPicker.GetPicker().trigger('change');
	}
}

// Default input field
setTimeout(function ()
{
	Universal Household.Components.ProductPicker.GetInputElement().focus();
}, Universal Household.FormFocusDelay);

$(document).on("change", "#scan-mode", function (e)
{
	if ($(this).prop("checked"))
	{
		Universal Household.UISound.AskForPermission();
	}
});

$("#scan-mode-button").on("click", function (e)
{
	$("#scan-mode").click();
	$("#scan-mode-button").toggleClass("btn-success").toggleClass("btn-danger");
	if ($("#scan-mode").prop("checked"))
	{
		$("#scan-mode-status").text(__t("on"));
	}
	else
	{
		$("#scan-mode-status").text(__t("off"));
	}
});

$('#consume-exact-amount').on('change', RefreshForm);
var current_productDetails;
function RefreshForm()
{
	var productDetails = current_productDetails;
	if (!productDetails)
	{
		return;
	}

	if (productDetails.product.enable_tare_weight_handling == 1)
	{
		$("#consume-exact-amount-group").removeClass("d-none");
	}
	else
	{
		$("#consume-exact-amount-group").addClass("d-none");
	}

	if (productDetails.product.enable_tare_weight_handling == 1 && !$('#consume-exact-amount').is(':checked'))
	{
		$("#display_amount").attr("min", productDetails.product.tare_weight);
		$('#display_amount').attr('max', (sumValue + productDetails.product.tare_weight).toFixed(Universal Household.UserSettings.stock_decimal_places_amounts));
		$("#tare-weight-handling-info").removeClass("d-none");
	}
	else
	{
		$("#tare-weight-handling-info").addClass("d-none");

		$("#display_amount").attr("min", Universal Household.DefaultMinAmount);
		$('#display_amount').attr('max', (sumValue * $("#qu_id option:selected").attr("data-qu-factor")).toFixed(Universal Household.UserSettings.stock_decimal_places_amounts));

		if (sumValue == 0)
		{
			$("#display_amount").parent().find(".invalid-feedback").text(__t('There are no units available at this location'));
		}
	}

	if (productDetails.has_childs)
	{
		$("#display_amount").removeAttr("max");
	}

	if (sumValue == sumValueOpened || productDetails.product.enable_tare_weight_handling == 1 || productDetails.product.disable_open == 1)
	{
		$("#save-mark-as-open-button").addClass("disabled");
	}
	else
	{
		$("#save-mark-as-open-button").removeClass("disabled");
	}

	Universal Household.FrontendHelpers.ValidateForm("consume-form");
}

function ScanModeSubmit(singleUnit = true)
{
	if (BoolVal(Universal Household.UserSettings.scan_mode_consume_enabled))
	{
		if (singleUnit)
		{
			$("#display_amount").val(1);
			$(".input-group-productamountpicker").trigger("change");
		}

		if (Universal Household.FrontendHelpers.ValidateForm('consume-form'))
		{
			$('#save-consume-button').click();
		}
		else
		{
			toastr.warning(__t("Scan mode is on but not all required fields could be populated automatically"));
			Universal Household.UISound.Error();
		}
	}
}
