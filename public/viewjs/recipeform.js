function saveRecipePicture(result, location, jsonData)
{
	var recipeId = Universal Household.EditObjectId || result.created_object_id;
	Universal Household.EditObjectId = recipeId; // Universal Household.EditObjectId is not yet set when adding a recipe

	Universal Household.Components.UserfieldsForm.Save(() =>
	{
		if (jsonData.hasOwnProperty("picture_file_name") && !Universal Household.DeleteRecipePictureOnSave)
		{
			Universal Household.Api.UploadFile($("#recipe-picture")[0].files[0], 'recipepictures', jsonData.picture_file_name,
				(result) =>
				{
					window.location.href = U(location + recipeId);
				},
				(xhr) =>
				{
					Universal Household.FrontendHelpers.EndUiBusy("recipe-form");
					Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
				}
			);
		}
		else
		{
			window.location.href = U(location + recipeId);
		}
	});
}

$('.save-recipe').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("recipe-form", true))
	{
		return;
	}

	var jsonData = $('#recipe-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("recipe-form");

	if ($("#recipe-picture")[0].files.length > 0)
	{
		jsonData.picture_file_name = RandomString() + CleanFileName($("#recipe-picture")[0].files[0].name);
	}

	const location = $(e.currentTarget).attr('data-location') == 'return' ? '/recipes?recipe=' : '/recipe/';

	if (Universal Household.EditMode == 'create')
	{
		Universal Household.Api.Post('objects/recipes', jsonData,
			(result) => saveRecipePicture(result, location, jsonData));
		return;
	}

	if (Universal Household.DeleteRecipePictureOnSave)
	{
		jsonData.picture_file_name = null;

		Universal Household.Api.DeleteFile(Universal Household.RecipePictureFileName, 'recipepictures',
			function(result)
			{
				// Nothing to do
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("recipe-form");
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}

	Universal Household.Api.Put('objects/recipes/' + Universal Household.EditObjectId, jsonData,
		(result) => saveRecipePicture(result, location, jsonData),
		function(xhr)
		{
			Universal Household.FrontendHelpers.EndUiBusy("recipe-form");
			console.error(xhr);
		}
	);
});

var recipesPosTables = $('#recipes-pos-table').DataTable({
	'order': [[1, 'asc']],
	"orderFixed": [[4, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 },
		{ 'visible': false, 'targets': 4 }
	].concat($.fn.dataTable.defaults.columnDefs),
	'rowGroup': {
		enable: true,
		dataSrc: 4
	}
});
$('#recipes-pos-table tbody').removeClass("d-none");
recipesPosTables.columns.adjust().draw();

var recipesIncludesTables = $('#recipes-includes-table').DataTable({
	'order': [[1, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#recipes-includes-table tbody').removeClass("d-none");
recipesIncludesTables.columns.adjust().draw();

Universal Household.FrontendHelpers.ValidateForm('recipe-form');
setTimeout(function()
{
	$("#name").focus();
}, Universal Household.FormFocusDelay);

$('#recipe-form input').keyup(function(event)
{
	Universal Household.FrontendHelpers.ValidateForm('recipe-form');
});

$('#recipe-form input').keydown(function(event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('recipe-form'))
		{
			return false;
		}
		else
		{
			$('#save-recipe-button').click();
		}
	}
});

$(document).on('click', '.recipe-pos-delete-button', function(e)
{
	var objectName = $(e.currentTarget).attr('data-recipe-pos-name');
	var objectId = $(e.currentTarget).attr('data-recipe-pos-id');

	bootbox.confirm({
		message: __t('Are you sure you want to delete recipe ingredient "%s"?', objectName),
		closeButton: false,
		buttons: {
			confirm: {
				label: __t('Yes'),
				className: 'btn-success'
			},
			cancel: {
				label: __t('No'),
				className: 'btn-danger'
			}
		},
		callback: function(result)
		{
			if (result === true)
			{
				Universal Household.Api.Delete('objects/recipes_pos/' + objectId, {},
					function(result)
					{
						window.postMessage(WindowMessageBag("IngredientsChanged"), Universal Household.BaseUrl);
					},
					function(xhr)
					{
						console.error(xhr);
					}
				);
			}
		}
	});
});

$(document).on('click', '.recipe-include-delete-button', function(e)
{
	var objectName = $(e.currentTarget).attr('data-recipe-include-name');
	var objectId = $(e.currentTarget).attr('data-recipe-include-id');

	bootbox.confirm({
		message: __t('Are you sure you want to remove the included recipe "%s"?', objectName),
		closeButton: false,
		buttons: {
			confirm: {
				label: __t('Yes'),
				className: 'btn-success'
			},
			cancel: {
				label: __t('No'),
				className: 'btn-danger'
			}
		},
		callback: function(result)
		{
			if (result === true)
			{
				Universal Household.Api.Delete('objects/recipes_nestings/' + objectId, {},
					function(result)
					{
						window.postMessage(WindowMessageBag("IngredientsChanged"), Universal Household.BaseUrl);
					},
					function(xhr)
					{
						console.error(xhr);
					}
				);
			}
		}
	});
});

$(document).on('click', '.recipe-pos-show-note-button', function(e)
{
	var note = $(e.currentTarget).attr('data-recipe-pos-note');

	bootbox.alert(note);
});

$(document).on('click', '.recipe-pos-edit-button', function(e)
{
	e.preventDefault();

	var productId = $(e.currentTarget).attr("data-product-id");
	var recipePosId = $(e.currentTarget).attr('data-recipe-pos-id');

	bootbox.dialog({
		message: '<iframe class="embed-responsive" src="' + U("/recipe/") + Universal Household.EditObjectId.toString() + '/pos/' + recipePosId.toString() + '?embedded&product=' + productId.toString() + '"></iframe>',
		size: 'large',
		backdrop: true,
		closeButton: false,
		className: "form"
	});
});

$(document).on('click', '.recipe-include-edit-button', function(e)
{
	var id = $(e.currentTarget).attr('data-recipe-include-id');
	var recipeId = $(e.currentTarget).attr('data-recipe-included-recipe-id');
	var recipeServings = $(e.currentTarget).attr('data-recipe-included-recipe-servings');

	Universal Household.Api.Put('objects/recipes/' + Universal Household.EditObjectId, $('#recipe-form').serializeJSON(),
		function(result)
		{
			$("#recipe-include-editform-title").text(__t("Edit included recipe"));
			$("#recipe-include-form").data("edit-mode", "edit");
			$("#recipe-include-form").data("recipe-nesting-id", id);
			Universal Household.Components.RecipePicker.SetId(recipeId);
			$("#includes_servings").val(recipeServings);
			$("#recipe-include-editform-modal").modal("show");
			Universal Household.FrontendHelpers.ValidateForm("recipe-include-form");
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);
});

$("#recipe-pos-add-button").on("click", function(e)
{
	e.preventDefault();

	bootbox.dialog({
		message: '<iframe class="embed-responsive" src="' + U("/recipe/") + Universal Household.EditObjectId + '/pos/new?embedded"></iframe>',
		size: 'large',
		backdrop: true,
		closeButton: false,
		className: "form"
	});
});

$("#recipe-include-add-button").on("click", function(e)
{
	Universal Household.Api.Put('objects/recipes/' + Universal Household.EditObjectId, $('#recipe-form').serializeJSON(),
		function(result)
		{
			$("#recipe-include-editform-title").text(__t("Add included recipe"));
			$("#recipe-include-form").data("edit-mode", "create");
			Universal Household.Components.RecipePicker.Clear();
			Universal Household.Components.RecipePicker.GetInputElement().focus();
			$("#recipe-include-editform-modal").modal("show");
			Universal Household.FrontendHelpers.ValidateForm("recipe-include-form");
		},
		function(xhr)
		{
			console.error(xhr);
		}
	);
});

$('#save-recipe-include-button').on('click', function(e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("recipe-include-form", true))
	{
		return false;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var nestingId = $("#recipe-include-form").data("recipe-nesting-id");
	var editMode = $("#recipe-include-form").data("edit-mode");

	var jsonData = {};
	jsonData.includes_recipe_id = Universal Household.Components.RecipePicker.GetValue();
	jsonData.servings = $("#includes_servings").val();
	jsonData.recipe_id = Universal Household.EditObjectId;

	if (editMode === 'create')
	{
		Universal Household.Api.Post('objects/recipes_nestings', jsonData,
			function(result)
			{
				window.postMessage(WindowMessageBag("IngredientsChanged"), Universal Household.BaseUrl);
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
	else
	{
		Universal Household.Api.Put('objects/recipes_nestings/' + nestingId, jsonData,
			function(result)
			{
				window.postMessage(WindowMessageBag("IngredientsChanged"), Universal Household.BaseUrl);
			},
			function(xhr)
			{
				Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
			}
		);
	}
});

$("#recipe-picture").on("change", function(e)
{
	$("#recipe-picture-label").removeClass("d-none");
	$("#recipe-picture-label-none").addClass("d-none");
	$("#delete-current-recipe-picture-on-save-hint").addClass("d-none");
	$("#current-recipe-picture").addClass("d-none");
	Universal Household.DeleteRecipePictureOnSave = false;
});

Universal Household.DeleteRecipePictureOnSave = false;
$("#delete-current-recipe-picture-button").on("click", function(e)
{
	Universal Household.DeleteRecipePictureOnSave = true;
	$("#current-recipe-picture").addClass("d-none");
	$("#delete-current-recipe-picture-on-save-hint").removeClass("d-none");
	$("#recipe-picture-label").addClass("d-none");
	$("#recipe-picture-label-none").removeClass("d-none");
});

Universal Household.Components.UserfieldsForm.Load();

$(window).on("message", function(e)
{
	var data = e.originalEvent.data;

	if (data.Message === "IngredientsChanged")
	{
		Universal Household.Api.Put('objects/recipes/' + Universal Household.EditObjectId, $('#recipe-form').serializeJSON(),
			function(result)
			{
				window.location.href = U('/recipe/' + Universal Household.EditObjectId);
			},
			function(xhr)
			{
				console.error(xhr);
			}
		);
	}
});

$(document).on('click', '.recipe-householdcode-label-print', function(e)
{
	e.preventDefault();

	var recipeId = $(e.currentTarget).attr('data-recipe-id');
	Universal Household.Api.Get('recipes/' + recipeId + '/printlabel', function(labelData)
	{
		if (Universal Household.Webhooks.labelprinter !== undefined)
		{
			Universal Household.FrontendHelpers.RunWebhook(Universal Household.Webhooks.labelprinter, labelData);
		}
	});
});
