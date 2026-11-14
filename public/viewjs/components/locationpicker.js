Universal Household.Components.LocationPicker = {};

Universal Household.Components.LocationPicker.GetPicker = function ()
{
	return $('#location_id');
}

Universal Household.Components.LocationPicker.GetInputElement = function ()
{
	return $('#location_id_text_input');
}

Universal Household.Components.LocationPicker.GetValue = function ()
{
	return $('#location_id').val();
}

Universal Household.Components.LocationPicker.SetValue = function (value)
{
	Universal Household.Components.LocationPicker.GetInputElement().val(value);
	Universal Household.Components.LocationPicker.GetInputElement().trigger('change');
}

Universal Household.Components.LocationPicker.SetId = function (value)
{
	Universal Household.Components.LocationPicker.GetPicker().val(value);
	Universal Household.Components.LocationPicker.GetPicker().data('combobox').refresh();
	Universal Household.Components.LocationPicker.GetInputElement().trigger('change');
}

Universal Household.Components.LocationPicker.Clear = function ()
{
	Universal Household.Components.LocationPicker.SetValue('');
	Universal Household.Components.LocationPicker.SetId(null);
}

$(".location-combobox").combobox(BootstrapComboboxDefaults);

var prefillByName = Universal Household.Components.LocationPicker.GetPicker().parent().data('prefill-by-name').toString();
if (typeof prefillByName !== "undefined")
{
	possibleOptionElement = $("#location_id option:contains(\"" + prefillByName + "\")").first();

	if (possibleOptionElement.length > 0)
	{
		$('#location_id').val(possibleOptionElement.val());
		$('#location_id').data('combobox').refresh();
		$('#location_id').trigger('change');

		var nextInputElement = $(Universal Household.Components.LocationPicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}

var prefillById = Universal Household.Components.LocationPicker.GetPicker().parent().data('prefill-by-id').toString();
if (typeof prefillById !== "undefined")
{
	$('#location_id').val(prefillById);
	$('#location_id').data('combobox').refresh();
	$('#location_id').trigger('change');

	var nextInputElement = $(Universal Household.Components.LocationPicker.GetPicker().parent().data('next-input-selector').toString());
	nextInputElement.focus();
}
