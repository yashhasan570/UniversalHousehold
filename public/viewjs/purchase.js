var CurrentProductDetails;

$('#save-purchase-button').on('click', function (e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("purchase-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonForm = $('#purchase-form').serializeJSON();

	Universal Household.FrontendHelpers.BeginUiBusy("purchase-form");

	Universal Household.Api.Get('stock/products/' + jsonForm.product_id,
		function (productDetails)
		{
			var jsonData = {};
			jsonData.amount = jsonForm.amount;
			jsonData.note = jsonForm.note;
			jsonData.stock_label_type = jsonForm.stock_label_type;

			if (!Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRICE_TRACKING)
			{
				jsonData.price = 0;
			}
			else
			{
				var amount = Number.parseFloat(jsonForm.display_amount);
				if (BoolVal(productDetails.product.enable_tare_weight_handling))
				{
					amount -= productDetails.product.tare_weight;
				}

				var price = Number.parseFloat(jsonForm.price * $("#qu_id option:selected").attr("data-qu-factor")).toFixed(Universal Household.UserSettings.stock_decimal_places_prices_input);
				if ($("input[name='price-type']:checked").val() == "total-price")
				{
					price = (price / amount).toFixed(Universal Household.UserSettings.stock_decimal_places_prices_input);
				}

				jsonData.price = price;
			}

			if (BoolVal(Universal Household.UserSettings.show_purchased_date_on_purchase))
			{
				jsonData.purchased_date = Universal Household.Components.DateTimePicker2.GetValue();
			}

			if (Universal Household.Components.DateTimePicker)
			{
				jsonData.best_before_date = Universal Household.Components.DateTimePicker.GetValue();
			}
			else
			{
				jsonData.best_before_date = null;
			}

			if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRICE_TRACKING)
			{
				jsonData.shopping_location_id = Universal Household.Components.ShoppingLocationPicker.GetValue();
			}
			if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_LOCATION_TRACKING)
			{
				jsonData.location_id = Universal Household.Components.LocationPicker.GetValue();
			}

			Universal Household.Api.Post('stock/products/' + jsonForm.product_id + '/add', jsonData,
				function (result)
				{
					if ($("#purchase-form").hasAttr("data-used-barcode"))
					{
						Universal Household.Api.Put('objects/product_barcodes/' + $("#purchase-form").attr("data-used-barcode"), { last_price: $("#price").val() },
							function (result)
							{ },
							function (xhr)
							{ }
						);
					}

					if (BoolVal(Universal Household.UserSettings.scan_mode_purchase_enabled))
					{
						Universal Household.UISound.Success();
					}

					if (GetUriParam("flow") == "InplaceAddBarcodeToExistingProduct")
					{
						var jsonDataBarcode = {};
						jsonDataBarcode.barcode = GetUriParam("barcode");
						jsonDataBarcode.product_id = jsonForm.product_id;
						jsonDataBarcode.shopping_location_id = jsonForm.shopping_location_id;
						jsonDataBarcode.qu_id = jsonForm.qu_id;
						jsonDataBarcode.amount = jsonForm.display_amount;
						jsonDataBarcode.note = jsonForm.note;

						Universal Household.Api.Post('objects/product_barcodes', jsonDataBarcode,
							function (result)
							{
								$("#flow-info-InplaceAddBarcodeToExistingProduct").addClass("d-none");
								$('#barcode-lookup-disabled-hint').addClass('d-none');
								$('#barcode-lookup-hint').removeClass('d-none');
								window.history.replaceState({}, document.title, U("/purchase"));
							},
							function (xhr)
							{
								Universal Household.FrontendHelpers.EndUiBusy("purchase-form");
								Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
							}
						);
					}

					var amountMessage = Number.parseFloat(jsonForm.amount).toLocaleString({ minimumFractionDigits: 0, maximumFractionDigits: Universal Household.UserSettings.stock_decimal_places_amounts });
					if (BoolVal(productDetails.product.enable_tare_weight_handling))
					{
						amountMessage = Number.parseFloat(jsonForm.amount) - productDetails.stock_amount - productDetails.product.tare_weight;
					}
					var successMessage = __t('Added %1$s of %2$s to stock', amountMessage + " " + __n(amountMessage, productDetails.quantity_unit_stock.name, productDetails.quantity_unit_stock.name_plural, true), productDetails.product.name) + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoStockTransaction(\'' + result[0].transaction_id + '\')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>';

					if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_LABEL_PRINTER)
					{
						if (Universal Household.Webhooks.labelprinter !== undefined)
						{
							if (jsonForm.stock_label_type == 1) // Single label
							{
								var webhookData = {};
								webhookData.product = productDetails.product.name;
								webhookData.householdcode = 'grcy:p:' + jsonForm.product_id + ":" + result[0].stock_id;
								if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING)
								{
									webhookData.due_date = __t('DD') + ': ' + result[0].best_before_date;
								}

								Universal Household.FrontendHelpers.RunWebhook(Universal Household.Webhooks.labelprinter, webhookData);
							}
							else if (jsonForm.stock_label_type == 2) // Label per unit
							{
								Universal Household.Api.Get('stock/transactions/' + result[0].transaction_id,
									function (stockEntries)
									{
										stockEntries.forEach(stockEntry =>
										{
											var webhookData = {};
											webhookData.product = productDetails.product.name;
											webhookData.householdcode = 'grcy:p:' + jsonForm.product_id + ":" + stockEntry.stock_id;
											if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING)
											{
												webhookData.due_date = __t('DD') + ': ' + result[0].best_before_date;
											}

											Universal Household.FrontendHelpers.RunWebhook(Universal Household.Webhooks.labelprinter, webhookData);
										});
									},
									function (xhr)
									{
										console.error(xhr);
									}
								);
							}
						}
					}

					Universal Household.EditObjectId = result[0].transaction_id;
					if (GetUriParam("embedded") !== undefined)
					{
						Universal Household.Components.UserfieldsForm.Save(function ()
						{
							Universal Household.GetTopmostWindow().postMessage(WindowMessageBag("BroadcastMessage", WindowMessageBag("ProductChanged", jsonForm.product_id)), Universal Household.BaseUrl);
							window.parent.postMessage(WindowMessageBag("AfterItemAdded", GetUriParam("listitemid")), Universal Household.BaseUrl);
							window.parent.postMessage(WindowMessageBag("ShowSuccessMessage", successMessage), Universal Household.BaseUrl);
							window.parent.postMessage(WindowMessageBag("Ready"), Universal Household.BaseUrl);

							if (GetUriParam("flow") != "shoppinglistitemtostock")
							{
								window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
							}
						});
					}
					else
					{
						Universal Household.Components.UserfieldsForm.Save(function ()
						{
							Universal Household.FrontendHelpers.EndUiBusy("purchase-form");
							toastr.success(successMessage);
							Universal Household.Components.ProductPicker.FinishFlow();

							if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING && BoolVal(Universal Household.UserSettings.show_warning_on_purchase_when_due_date_is_earlier_than_next))
							{
								if (moment(jsonData.best_before_date).isBefore(CurrentProductDetails.next_due_date))
								{
									toastr.warning(__t("This is due earlier than already in stock items"));
								}
							}

							Universal Household.Components.ProductAmountPicker.Reset();
							Universal Household.Components.ProductPicker.Clear();
							$("#purchase-form").removeAttr("data-used-barcode");
							$("#display_amount").attr("min", Universal Household.DefaultMinAmount);
							$('#display_amount').val(Universal Household.UserSettings.stock_default_purchase_amount);
							$(".input-group-productamountpicker").trigger("change");
							$('#price').val('');
							$("#tare-weight-handling-info").addClass("d-none");
							if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_LOCATION_TRACKING)
							{
								Universal Household.Components.LocationPicker.Clear();
							}
							if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING)
							{
								Universal Household.Components.DateTimePicker.Clear();
							}
							if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRICE_TRACKING)
							{
								Universal Household.Components.ShoppingLocationPicker.SetValue('');
							}
							Universal Household.Components.ProductPicker.GetInputElement().focus();
							Universal Household.Components.ProductCard.Refresh(jsonForm.product_id);
							if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_LABEL_PRINTER)
							{
								$("#stock_label_type").val(0);
							}

							$('#price-hint').text("");
							$('#note').val("");
							var priceTypeUnitPrice = $("#price-type-unit-price");
							var priceTypeUnitPriceLabel = $("[for=" + priceTypeUnitPrice.attr("id") + "]");
							priceTypeUnitPriceLabel.text(__t("Unit price"));
							Universal Household.Components.UserfieldsForm.Clear();

							Universal Household.FrontendHelpers.ValidateForm('purchase-form');
						});
					}
				},
				function (xhr)
				{
					Universal Household.FrontendHelpers.EndUiBusy("purchase-form");
					console.error(xhr);
				}
			);
		},
		function (xhr)
		{
			Universal Household.FrontendHelpers.EndUiBusy("purchase-form");
			console.error(xhr);
		}
	);
});

if (Universal Household.Components.ProductPicker !== undefined)
{
	Universal Household.Components.ProductPicker.GetPicker().on('change', function (e)
	{
		if (BoolVal(Universal Household.UserSettings.scan_mode_purchase_enabled))
		{
			Universal Household.UISound.BarcodeScannerBeep();
		}

		var productId = $(e.target).val();

		if (productId)
		{
			Universal Household.Components.ProductCard.Refresh(productId);

			Universal Household.Api.Get('stock/products/' + productId,
				function (productDetails)
				{
					CurrentProductDetails = productDetails;

					Universal Household.Components.ProductAmountPicker.Reload(productDetails.product.id, productDetails.quantity_unit_stock.id);
					if (productDetails.product.enable_tare_weight_handling == 1)
					{
						Universal Household.Components.ProductAmountPicker.SetQuantityUnit(productDetails.quantity_unit_stock.id);
						$("#qu_id").attr("disabled", "");
					}
					else
					{
						Universal Household.Components.ProductAmountPicker.SetQuantityUnit(productDetails.default_quantity_unit_purchase.id);
					}
					$('#display_amount').val(Universal Household.UserSettings.stock_default_purchase_amount);
					$(".input-group-productamountpicker").trigger("change");

					if (GetUriParam("flow") === "shoppinglistitemtostock")
					{
						Universal Household.Components.ProductAmountPicker.SetQuantityUnit(GetUriParam("quId"));
						$('#display_amount').val(Number.parseFloat(GetUriParam("amount") * $("#qu_id option:selected").attr("data-qu-factor")));
					}

					$(".input-group-productamountpicker").trigger("change");

					if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRICE_TRACKING)
					{
						if (productDetails.last_shopping_location_id != null)
						{
							Universal Household.Components.ShoppingLocationPicker.SetId(productDetails.last_shopping_location_id);
						}
						else
						{
							Universal Household.Components.ShoppingLocationPicker.SetId(productDetails.default_shopping_location_id);
						}
					}

					if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_LOCATION_TRACKING)
					{
						Universal Household.Components.LocationPicker.SetId(productDetails.location.id);
					}

					if (productDetails.last_price == null || productDetails.last_price == 0)
					{
						$("#price").val("")
					}
					else
					{
						$('#price').val((productDetails.last_price / Number.parseFloat($("#qu_id option:selected").attr("data-qu-factor"))).toFixed(Universal Household.UserSettings.stock_decimal_places_prices_display));
					}

					var priceTypeUnitPrice = $("#price-type-unit-price");
					var priceTypeUnitPriceLabel = $("[for=" + priceTypeUnitPrice.attr("id") + "]");
					priceTypeUnitPriceLabel.text($("#qu_id option:selected").text() + " " + __t("price"));

					RefreshPriceHint();

					if (productDetails.product.enable_tare_weight_handling == 1)
					{
						var minAmount = productDetails.product.tare_weight / $("#qu_id option:selected").attr("data-qu-factor") + productDetails.stock_amount;
						$("#display_amount").attr("min", minAmount);
						$("#tare-weight-handling-info").removeClass("d-none");
					}
					else
					{
						$("#display_amount").attr("min", Universal Household.DefaultMinAmount);
						$("#tare-weight-handling-info").addClass("d-none");
					}

					PrefillBestBeforeDate(productDetails.product, productDetails.location);

					if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_LABEL_PRINTER)
					{
						$("#stock_label_type").val(productDetails.product.default_stock_label_type);
						$("#stock_label_type").trigger("change");
					}

					if (productDetails.product.default_purchase_price_type == 2)
					{
						$("#price-type-unit-price").click();
					}
					else if (productDetails.product.default_purchase_price_type == 3)
					{
						$("#price-type-total-price").click();
					}

					setTimeout(function ()
					{
						$('#display_amount').focus();
					}, Universal Household.FormFocusDelay);

					Universal Household.FrontendHelpers.ValidateForm('purchase-form');
					if (GetUriParam("flow") === "shoppinglistitemtostock" && BoolVal(Universal Household.UserSettings.shopping_list_to_stock_workflow_auto_submit_when_prefilled) && Universal Household.FrontendHelpers.ValidateForm("purchase-form"))
					{
						$("#save-purchase-button").click();
					}

					RefreshLocaleNumberInput();

					if (document.getElementById("product_id").getAttribute("barcode") != "null")
					{
						Universal Household.Api.Get('objects/product_barcodes_view?query[]=barcode=' + document.getElementById("product_id").getAttribute("barcode"),
							function (barcodeResult)
							{
								if (barcodeResult && barcodeResult.length > 0)
								{
									var barcode = barcodeResult[0];
									$("#purchase-form").attr("data-used-barcode", barcode.id);

									if (barcode)
									{
										if (barcode.amount)
										{
											$("#display_amount").val(barcode.amount);
											$("#display_amount").select();
										}

										if (barcode.qu_id)
										{
											Universal Household.Components.ProductAmountPicker.SetQuantityUnit(barcode.qu_id);
										}

										if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRICE_TRACKING && barcode.shopping_location_id != null)
										{
											Universal Household.Components.ShoppingLocationPicker.SetId(barcode.shopping_location_id);
										}

										if (barcode.last_price)
										{
											$("#price").val(barcode.last_price);
											$("#price-type-total-price").click();
										}

										if (barcode.note)
										{
											$("#note").val(barcode.note);
										}

										$(".input-group-productamountpicker").trigger("change");
										Universal Household.FrontendHelpers.ValidateForm('purchase-form');
										RefreshLocaleNumberInput();
									}
								}

								ScanModeSubmit(false);
							},
							function (xhr)
							{
								console.error(xhr);
							}
						);
					}
					else
					{
						$("#purchase-form").removeAttr("data-used-barcode");
						ScanModeSubmit();
					}

					$('#display_amount').trigger("keyup");
				},
				function (xhr)
				{
					console.error(xhr);
				}
			);
		}
	});
}

function PrefillBestBeforeDate(product, location)
{
	if (!Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_BEST_BEFORE_DATE_TRACKING)
	{
		return;
	}

	if (location == null)
	{
		location = {}
	}

	var shortcutValue = $("#datetimepicker-shortcut").attr("data-datetimepicker-shortcut-value");
	var dueDateCurrent = Universal Household.Components.DateTimePicker.GetValue();
	var dueDateDefault = null;
	var dueDateFreezer = null;

	if (product.default_best_before_days != 0)
	{
		dueDateDefault = moment().add(product.default_best_before_days, 'days').format('YYYY-MM-DD');

		if (product.default_best_before_days == -1)
		{
			dueDateDefault = shortcutValue;
		}
	}

	if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRODUCT_FREEZING && BoolVal(location.is_freezer) && product.default_best_before_days_after_freezing != 0)
	{
		dueDateFreezer = moment().add(product.default_best_before_days_after_freezing, 'days').format('YYYY-MM-DD');

		if (product.default_best_before_days_after_freezing == -1)
		{
			dueDateFreezer = shortcutValue;
		}
	}

	// Set the default due date when currently no one is set
	if (dueDateDefault && !dueDateCurrent)
	{
		if (!$("#datetimepicker-shortcut").is(":checked") && dueDateDefault == shortcutValue)
		{
			$("#datetimepicker-shortcut").click();
		}
		else
		{
			Universal Household.Components.DateTimePicker.SetValue(dueDateDefault);
		}
	}

	// Set the default due date after freezing when currently no one is set or when it was previously set to the default due date
	// (so essentially don't overwrite a by the user different entered due date)
	if (dueDateFreezer && (!dueDateCurrent || dueDateCurrent == dueDateDefault))
	{
		if (!$("#datetimepicker-shortcut").is(":checked") && dueDateFreezer == shortcutValue)
		{
			$("#datetimepicker-shortcut").click();
		}
		else
		{
			Universal Household.Components.DateTimePicker.SetValue(dueDateFreezer);
		}
	}
}

if (Universal Household.Components.LocationPicker !== undefined)
{
	Universal Household.Components.LocationPicker.GetPicker().on('change', function (e)
	{
		if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRODUCT_FREEZING)
		{
			Universal Household.Api.Get('objects/locations/' + Universal Household.Components.LocationPicker.GetValue(),
				function (location)
				{
					PrefillBestBeforeDate(CurrentProductDetails.product, location);
				},
				function (xhr)
				{ }
			);
		}
	});
}

$('#display_amount').val(Universal Household.UserSettings.stock_default_purchase_amount);
RefreshLocaleNumberInput();
$(".input-group-productamountpicker").trigger("change");
Universal Household.FrontendHelpers.ValidateForm('purchase-form');

if (Universal Household.Components.ProductPicker)
{
	if (Universal Household.Components.ProductPicker.InAnyFlow() === false && GetUriParam("embedded") === undefined)
	{
		setTimeout(function ()
		{
			Universal Household.Components.ProductPicker.GetInputElement().focus();
		}, Universal Household.FormFocusDelay);
	}
	else
	{
		Universal Household.Components.ProductPicker.GetPicker().trigger('change');

		if (Universal Household.Components.ProductPicker.InProductModifyWorkflow())
		{
			setTimeout(function ()
			{
				Universal Household.Components.ProductPicker.GetInputElement().focus();
			}, Universal Household.FormFocusDelay);
		}
	}
}

$('#display_amount').on('focus', function (e)
{
	if (Universal Household.Components.ProductPicker.GetValue().length === 0)
	{
		setTimeout(function ()
		{
			Universal Household.Components.ProductPicker.GetInputElement().focus();
		}, Universal Household.FormFocusDelay);
	}
	else
	{
		$(this).select();
	}
});

$('#price').on('focus', function (e)
{
	$(this).select();
});

$('#purchase-form input').keyup(function (event)
{
	Universal Household.FrontendHelpers.ValidateForm('purchase-form');
});

$('#purchase-form input').keydown(function (event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('purchase-form'))
		{
			return false;
		}
		else
		{
			$('#save-purchase-button').click();
		}
	}
});

if (Universal Household.Components.DateTimePicker)
{
	Universal Household.Components.DateTimePicker.GetInputElement().on('change', function (e)
	{
		Universal Household.FrontendHelpers.ValidateForm('purchase-form');
	});

	Universal Household.Components.DateTimePicker.GetInputElement().on('keypress', function (e)
	{
		Universal Household.FrontendHelpers.ValidateForm('purchase-form');
	});
}

if (Universal Household.Components.DateTimePicker2)
{
	Universal Household.Components.DateTimePicker2.GetInputElement().on('change', function (e)
	{
		Universal Household.FrontendHelpers.ValidateForm('purchase-form');
	});

	Universal Household.Components.DateTimePicker2.GetInputElement().on('keypress', function (e)
	{
		Universal Household.FrontendHelpers.ValidateForm('purchase-form');
	});

	Universal Household.Components.DateTimePicker2.GetInputElement().trigger("input");
}

$('#price').on('keyup', function (e)
{
	RefreshPriceHint();
});

$('#price-type-unit-price').on('change', function (e)
{
	RefreshPriceHint();
});

$('#price-type-total-price').on('change', function (e)
{
	RefreshPriceHint();
});

$('#display_amount').on('change', function (e)
{
	RefreshPriceHint();
	Universal Household.FrontendHelpers.ValidateForm('purchase-form');
});

function RefreshPriceHint()
{
	if ($('#amount').val() == 0 || $('#price').val() == 0)
	{
		$('#price-hint').text("");
		return;
	}

	if ($("input[name='price-type']:checked").val() == "total-price" || $("#qu_id").attr("data-destination-qu-name") != $("#qu_id option:selected").text())
	{
		var amount = Number.parseFloat($('#display_amount').val());
		if (BoolVal(CurrentProductDetails.product.enable_tare_weight_handling))
		{
			amount -= CurrentProductDetails.product.tare_weight;
		}

		var price = Number.parseFloat($('#price').val() * $("#qu_id option:selected").attr("data-qu-factor")).toFixed(Universal Household.UserSettings.stock_decimal_places_prices_display);
		if ($("input[name='price-type']:checked").val() == "total-price")
		{
			price = (price / amount).toFixed(Universal Household.UserSettings.stock_decimal_places_prices_display);
		}

		$('#price-hint').text(__t('means %1$s per %2$s', price.toLocaleString(undefined, { style: "currency", currency: Universal Household.Currency, minimumFractionDigits: Universal Household.UserSettings.stock_decimal_places_prices_display, maximumFractionDigits: Universal Household.UserSettings.stock_decimal_places_prices_display }), $("#qu_id").attr("data-destination-qu-name")));
	}
	else
	{
		$('#price-hint').text("");
	}
};

function UndoStockBooking(bookingId)
{
	Universal Household.Api.Post('stock/bookings/' + bookingId.toString() + '/undo', {},
		function (result)
		{
			toastr.success(__t("Booking successfully undone"));

			Universal Household.Api.Get('stock/bookings/' + bookingId.toString(),
				function (result)
				{
					Universal Household.GetTopmostWindow().postMessage(WindowMessageBag("BroadcastMessage", WindowMessageBag("ProductChanged", result.product_id)), Universal Household.BaseUrl);
				},
				function (xhr)
				{
					console.error(xhr);
				}
			);
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

			Universal Household.Api.Get('stock/transactions/' + transactionId.toString(),
				function (result)
				{
					Universal Household.GetTopmostWindow().postMessage(WindowMessageBag("BroadcastMessage", WindowMessageBag("ProductChanged", result[0].product_id)), Universal Household.BaseUrl);
				},
				function (xhr)
				{
					console.error(xhr);
				}
			);
		},
		function (xhr)
		{
			console.error(xhr);
		}
	);
};

$("#scan-mode").on("change", function (e)
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

$('#qu_id').on('change', function (e)
{
	var priceTypeUnitPrice = $("#price-type-unit-price");
	var priceTypeUnitPriceLabel = $("[for=" + priceTypeUnitPrice.attr("id") + "]");
	priceTypeUnitPriceLabel.text($("#qu_id option:selected").text() + " " + __t("price"));
	RefreshPriceHint();
});

function ScanModeSubmit(singleUnit = true)
{
	if (BoolVal(Universal Household.UserSettings.scan_mode_purchase_enabled))
	{
		if (singleUnit)
		{
			$("#display_amount").val(1);
			$(".input-group-productamountpicker").trigger("change");
		}

		Universal Household.FrontendHelpers.ValidateForm("purchase-form");
		if (Universal Household.FrontendHelpers.ValidateForm('purchase-form'))
		{
			$('#save-purchase-button').click();
		}
		else
		{
			toastr.warning(__t("Scan mode is on but not all required fields could be populated automatically"));
			Universal Household.UISound.Error();
		}
	}
}

if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_LABEL_PRINTER)
{
	$("#stock_label_type, #amount").on("change", function (e)
	{
		if ($("#stock_label_type").val() == 2)
		{
			$("#stock-entry-label-info").text(__n(Number.parseFloat($("#amount").val()), "This means 1 label will be printed", "This means %1$s labels will be printed"));
		}
		else
		{
			$("#stock-entry-label-info").text("");
		}
	});
}

if (Universal Household.Components.UserfieldsForm)
{
	Universal Household.Components.UserfieldsForm.Load();
}
