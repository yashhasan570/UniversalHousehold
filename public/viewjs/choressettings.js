$("#chores_due_soon_days").val(Universal Household.UserSettings.chores_due_soon_days);

if (BoolVal(Universal Household.UserSettings.chores_overview_swap_tracking_buttons))
{
	$("#chores_overview_swap_tracking_buttons").prop("checked", true);
}

RefreshLocaleNumberInput();
