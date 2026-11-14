Universal Household.Components.ShoppingLocationPicker = {};

Universal Household.Components.ShoppingLocationPicker.GetPicker = function ()
{
	return $('#shopping_location_id');
}

Universal Household.Components.ShoppingLocationPicker.GetInputElement = function ()
{
	return $('#shopping_location_id_text_input');
}

Universal Household.Components.ShoppingLocationPicker.GetValue = function ()
{
	return $('#shopping_location_id').val();
}

Universal Household.Components.ShoppingLocationPicker.SetValue = function (value)
{
	Universal Household.Components.ShoppingLocationPicker.GetInputElement().val(value);
	Universal Household.Components.ShoppingLocationPicker.GetInputElement().trigger('change');
}

Universal Household.Components.ShoppingLocationPicker.SetId = function (value)
{
	Universal Household.Components.ShoppingLocationPicker.GetPicker().val(value);
	Universal Household.Components.ShoppingLocationPicker.GetPicker().data('combobox').refresh();
	Universal Household.Components.ShoppingLocationPicker.GetInputElement().trigger('change');
}

Universal Household.Components.ShoppingLocationPicker.Clear = function ()
{
	Universal Household.Components.ShoppingLocationPicker.SetValue('');
	Universal Household.Components.ShoppingLocationPicker.SetId(null);
}

$(".shopping-location-combobox").combobox(BootstrapComboboxDefaults);

var prefillByName = Universal Household.Components.ShoppingLocationPicker.GetPicker().parent().data('prefill-by-name').toString();
if (typeof prefillByName !== "undefined")
{
	possibleOptionElement = $("#shopping_location_id option:contains(\"" + prefillByName + "\")").first();

	if (possibleOptionElement.length > 0)
	{
		$('#shopping_location_id').val(possibleOptionElement.val());
		$('#shopping_location_id').data('combobox').refresh();
		$('#shopping_location_id').trigger('change');

		var nextInputElement = $(Universal Household.Components.ShoppingLocationPicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}

var prefillById = Universal Household.Components.ShoppingLocationPicker.GetPicker().parent().data('prefill-by-id').toString();
if (typeof prefillById !== "undefined")
{
	$('#shopping_location_id').val(prefillById);
	$('#shopping_location_id').data('combobox').refresh();
	$('#shopping_location_id').trigger('change');

	var nextInputElement = $(Universal Household.Components.ShoppingLocationPicker.GetPicker().parent().data('next-input-selector').toString());
	nextInputElement.focus();
}
