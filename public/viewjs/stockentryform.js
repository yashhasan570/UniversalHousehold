$('#save-stockentry-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("stockentry-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonForm = $('#stockentry-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("stockentry-form");

	if (jsonForm.price)
	{
		price = Number.parseFloat(jsonForm.price).toFixed(Universal Household.UserSettings.stock_decimal_places_prices_input);
	}

	var jsonData = {};
	jsonData.amount = jsonForm.amount;
	jsonData.best_before_date = Universal Household.Components.DateTimePicker.GetValue();
	jsonData.purchased_date = Universal Household.Components.DateTimePicker2.GetValue();
	jsonData.note = jsonForm.note;
	jsonData.price = price;
	jsonData.open = $("#open").is(":checked");

	if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRICE_TRACKING)
	{
		jsonData.shopping_location_id = Universal Household.Components.ShoppingLocationPicker.GetValue();
	}

	if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_LOCATION_TRACKING)
	{
		jsonData.location_id = Universal Household.Components.LocationPicker.GetValue();
	}
	else
	{
		jsonData.location_id = 1;
	}

	Universal Household.Api.Put("stock/entry/" + Universal Household.EditObjectRowId, jsonData,
		function(result)
		{
			Universal Household.EditObjectId = result[0].transaction_id;

			if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_LABEL_PRINTER && $("#print-label").is(":checked"))
			{
				Universal Household.Api.Get('stock/entry/' + Universal Household.EditObjectRowId + '/printlabel', function(labelData)
				{
					if (Universal Household.Webhooks.labelprinter !== undefined)
					{
						Universal Household.FrontendHelpers.RunWebhook(Universal Household.Webhooks.labelprinter, labelData);
					}
				});
			}

			Universal Household.Components.UserfieldsForm.Save(function()
			{
				var successMessage = __t('Stock entry successfully updated') + '<br><a class="btn btn-secondary btn-sm mt-2" href="#" onclick="UndoStockBookingEntry(\'' + result.id + '\',\'' + Universal Household.EditObjectRowId + '\')"><i class="fa-solid fa-undo"></i> ' + __t("Undo") + '</a>';

				Universal Household.GetTopmostWindow().postMessage(WindowMessageBag("BroadcastMessage", WindowMessageBag("ProductChanged", Universal Household.EditObjectProductId)), Universal Household.BaseUrl);
				window.parent.postMessage(WindowMessageBag("ShowSuccessMessage", successMessage), Universal Household.BaseUrl);
				window.parent.postMessage(WindowMessageBag("Ready"), Universal Household.BaseUrl);
				window.parent.postMessage(WindowMessageBag("CloseLastModal"), Universal Household.BaseUrl);
			});
		},
		function(xhr)
		{
			Universal Household.FrontendHelpers.EndUiBusy("stockentry-form");
			console.error(xhr);
		}
	);
});

Universal Household.FrontendHelpers.ValidateForm('stockentry-form');

$('#stockentry-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('stockentry-form');
});

$('#stockentry-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('stockentry-form'))
		{
			return false;
		}
		else
		{
			$('#save-stockentry-button').click();
		}
	}
});

Universal Household.Components.DateTimePicker.GetInputElement().on('change', function(e)
{
	Universal Household.FrontendHelpers.ValidateForm('stockentry-form');
});

Universal Household.Components.DateTimePicker.GetInputElement().on('keypress', function(e)
{
	Universal Household.FrontendHelpers.ValidateForm('stockentry-form');
});

Universal Household.Components.DateTimePicker2.GetInputElement().on('change', function(e)
{
	Universal Household.FrontendHelpers.ValidateForm('stockentry-form');
});

Universal Household.Components.DateTimePicker2.GetInputElement().on('keypress', function(e)
{
	Universal Household.FrontendHelpers.ValidateForm('stockentry-form');
});

Universal Household.Api.Get('stock/products/' + Universal Household.EditObjectProductId,
	function(productDetails)
	{
		$('#amount_qu_unit').text(productDetails.quantity_unit_stock.name);
	},
	function(xhr)
	{
		console.error(xhr);
	}
);

$("#amount").on("focus", function(e)
{
	$(this).select();
});

Universal Household.Components.DateTimePicker.GetInputElement().on('change', function(e)
{
	if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_LABEL_PRINTER)
	{
		$("#print-label").prop("checked", true);
	}
});

Universal Household.Components.UserfieldsForm.Load();
setTimeout(function()
{
	$('#amount').focus();
}, Universal Household.FormFocusDelay);
Universal Household.FrontendHelpers.ValidateForm("stockentry-form");
