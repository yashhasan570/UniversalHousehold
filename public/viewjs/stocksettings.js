$("#product_presets_location_id").val(Universal Household.UserSettings.product_presets_location_id);
$("#product_presets_product_group_id").val(Universal Household.UserSettings.product_presets_product_group_id);
$("#product_presets_qu_id").val(Universal Household.UserSettings.product_presets_qu_id);
$("#product_presets_default_due_days").val(Universal Household.UserSettings.product_presets_default_due_days);

if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK_PRODUCT_OPENED_TRACKING && BoolVal(Universal Household.UserSettings.product_presets_treat_opened_as_out_of_stock))
{
	$("#product_presets_treat_opened_as_out_of_stock").prop("checked", true);
}

if (Universal Household.FeatureFlags.UNIVERSALHOUSEHOLD_FEATURE_FLAG_LABEL_PRINTER)
{
	$("#product_presets_default_stock_label_type").val(Universal Household.UserSettings.product_presets_default_stock_label_type);
}

$("#stock_due_soon_days").val(Universal Household.UserSettings.stock_due_soon_days);
$("#stock_default_purchase_amount").val(Universal Household.UserSettings.stock_default_purchase_amount);
$("#stock_default_consume_amount").val(Universal Household.UserSettings.stock_default_consume_amount);
$("#stock_decimal_places_amounts").val(Universal Household.UserSettings.stock_decimal_places_amounts);
$("#stock_decimal_places_prices_input").val(Universal Household.UserSettings.stock_decimal_places_prices_input);
$("#stock_decimal_places_prices_display").val(Universal Household.UserSettings.stock_decimal_places_prices_display);

if (BoolVal(Universal Household.UserSettings.show_icon_on_stock_overview_page_when_product_is_on_shopping_list))
{
	$("#show_icon_on_stock_overview_page_when_product_is_on_shopping_list").prop("checked", true);
}

if (BoolVal(Universal Household.UserSettings.stock_overview_show_all_out_of_stock_products))
{
	$("#stock_overview_show_all_out_of_stock_products").prop("checked", true);
}

if (BoolVal(Universal Household.UserSettings.show_purchased_date_on_purchase))
{
	$("#show_purchased_date_on_purchase").prop("checked", true);
}

if (BoolVal(Universal Household.UserSettings.show_warning_on_purchase_when_due_date_is_earlier_than_next))
{
	$("#show_warning_on_purchase_when_due_date_is_earlier_than_next").prop("checked", true);
}

if (BoolVal(Universal Household.UserSettings.stock_default_consume_amount_use_quick_consume_amount))
{
	$("#stock_default_consume_amount_use_quick_consume_amount").prop("checked", true);
	$("#stock_default_consume_amount").attr("disabled", "");
}

if (BoolVal(Universal Household.UserSettings.stock_auto_decimal_separator_prices))
{
	$("#stock_auto_decimal_separator_prices").prop("checked", true);
}

RefreshLocaleNumberInput();

$("#stock_default_consume_amount_use_quick_consume_amount").on("click", function()
{
	if (this.checked)
	{
		$("#stock_default_consume_amount").attr("disabled", "");
	}
	else
	{
		$("#stock_default_consume_amount").removeAttr("disabled");
	}
});
