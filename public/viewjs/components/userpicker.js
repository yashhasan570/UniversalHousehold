Universal Household.Components.UserPicker = {};

Universal Household.Components.UserPicker.GetPicker = function ()
{
	return $('#user_id');
}

Universal Household.Components.UserPicker.GetInputElement = function ()
{
	return $('#user_id_text_input');
}

Universal Household.Components.UserPicker.GetValue = function ()
{
	return $('#user_id').val();
}

Universal Household.Components.UserPicker.SetValue = function (value)
{
	Universal Household.Components.UserPicker.GetInputElement().val(value);
	Universal Household.Components.UserPicker.GetInputElement().trigger('change');
}

Universal Household.Components.UserPicker.SetId = function (value)
{
	Universal Household.Components.UserPicker.GetPicker().val(value);
	Universal Household.Components.UserPicker.GetPicker().data('combobox').refresh();
	Universal Household.Components.UserPicker.GetInputElement().trigger('change');
}

Universal Household.Components.UserPicker.Clear = function ()
{
	Universal Household.Components.UserPicker.SetValue('');
	Universal Household.Components.UserPicker.SetId(null);
}

$(".user-combobox").combobox(BootstrapComboboxDefaults);

var prefillUser = Universal Household.Components.UserPicker.GetPicker().parent().data('prefill-by-username').toString();
if (typeof prefillUser !== "undefined")
{
	var possibleOptionElement = $("#user_id option[data-additional-searchdata*=\"" + prefillUser + "\"]").first();
	if (possibleOptionElement.length === 0)
	{
		possibleOptionElement = $("#user_id option:contains(\"" + prefillUser + "\")").first();
	}

	if (possibleOptionElement.length > 0)
	{
		$('#user_id').val(possibleOptionElement.val());
		$('#user_id').data('combobox').refresh();
		$('#user_id').trigger('change');

		var nextInputElement = $(Universal Household.Components.UserPicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}

var prefillUserId = Universal Household.Components.UserPicker.GetPicker().parent().data('prefill-by-user-id').toString();
if (typeof prefillUserId !== "undefined")
{
	var possibleOptionElement = $("#user_id option[value='" + prefillUserId + "']").first();
	if (possibleOptionElement.length > 0)
	{
		$('#user_id').val(possibleOptionElement.val());
		$('#user_id').data('combobox').refresh();
		$('#user_id').trigger('change');

		var nextInputElement = $(Universal Household.Components.UserPicker.GetPicker().parent().data('next-input-selector').toString());
		nextInputElement.focus();
	}
}
