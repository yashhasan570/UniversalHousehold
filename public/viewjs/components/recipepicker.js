Universal Household.Components.RecipePicker = {};

Universal Household.Components.RecipePicker.GetPicker = function ()
{
	return $('#recipe_id');
}

Universal Household.Components.RecipePicker.GetInputElement = function ()
{
	return $('#recipe_id_text_input');
}

Universal Household.Components.RecipePicker.GetValue = function ()
{
	return $('#recipe_id').val();
}

Universal Household.Components.RecipePicker.SetValue = function (value)
{
	Universal Household.Components.RecipePicker.GetInputElement().val(value);
	Universal Household.Components.RecipePicker.GetInputElement().trigger('change');
}

Universal Household.Components.RecipePicker.SetId = function (value)
{
	Universal Household.Components.RecipePicker.GetPicker().val(value);
	Universal Household.Components.RecipePicker.GetPicker().data('combobox').refresh();
	Universal Household.Components.RecipePicker.GetInputElement().trigger('change');
}

Universal Household.Components.RecipePicker.Clear = function ()
{
	Universal Household.Components.RecipePicker.SetValue('');
	Universal Household.Components.RecipePicker.SetId(null);
}

$(".recipe-combobox").combobox(BootstrapComboboxDefaults);

var prefillByName = Universal Household.Components.RecipePicker.GetPicker().parent().data('prefill-by-name').toString();
if (typeof prefillByName !== "undefined")
{
	possibleOptionElement = $("#recipe_id option:contains(\"" + prefillByName + "\")").first();

	if (possibleOptionElement.length > 0)
	{
		$('#recipe_id').val(possibleOptionElement.val());
		$('#recipe_id').data('combobox').refresh();
		$('#recipe_id').trigger('change');

		var nextInputElement = $(Universal Household.Components.RecipePicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}

var prefillById = Universal Household.Components.RecipePicker.GetPicker().parent().data('prefill-by-id').toString();
if (typeof prefillById !== "undefined")
{
	$('#recipe_id').val(prefillById);
	$('#recipe_id').data('combobox').refresh();
	$('#recipe_id').trigger('change');

	var nextInputElement = $(Universal Household.Components.RecipePicker.GetPicker().parent().data('next-input-selector').toString());
	nextInputElement.focus();
}

$('#recipe_id_text_input').on('blur', function (e)
{
	if ($('#recipe_id').hasClass("combobox-menu-visible"))
	{
		return;
	}

	var input = $('#recipe_id_text_input').val().toString();
	var possibleOptionElement = [];

	// UniversalHouseholdCode handling
	if (input.startsWith("grcy"))
	{
		var gc = input.split(":");
		if (gc[1] == "r")
		{
			possibleOptionElement = $("#recipe_id option[value=\"" + gc[2] + "\"]").first();
		}

		if (possibleOptionElement.length > 0)
		{
			$('#recipe_id').val(possibleOptionElement.val());
			$('#recipe_id').data('combobox').refresh();
			$('#recipe_id').trigger('change');
		}
		else
		{
			$('#recipe_id').val(null);
			$('#recipe_id_text_input').val("");
			$('#recipe_id').data('combobox').refresh();
			$('#recipe_id').trigger('change');
		}
	}
});

$(document).on("Universal Household.BarcodeScanned", function (e, barcode, target)
{
	if (!(target == "@recipepicker" || target == "undefined" || target == undefined)) // Default target
	{
		return;
	}

	// Don't know why the blur event does not fire immediately ... this works...
	Universal Household.Components.RecipePicker.GetInputElement().focusout();
	Universal Household.Components.RecipePicker.GetInputElement().focus();
	Universal Household.Components.RecipePicker.GetInputElement().blur();

	Universal Household.Components.RecipePicker.GetInputElement().val(barcode);

	setTimeout(function ()
	{
		Universal Household.Components.RecipePicker.GetInputElement().focusout();
		Universal Household.Components.RecipePicker.GetInputElement().focus();
		Universal Household.Components.RecipePicker.GetInputElement().blur();
	}, Universal Household.FormFocusDelay);
});
