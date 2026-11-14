function SaveUserPicture(result, jsonData)
{
	var userId = Universal Household.EditObjectId || result.created_object_id;
	Universal Household.Components.UserfieldsForm.Save(() =>
	{
		if (jsonData.hasOwnProperty("picture_file_name") && !Universal Household.DeleteUserPictureOnSave)
		{
			Universal Household.Api.UploadFile($("#user-picture")[0].files[0], 'userpictures', jsonData.picture_file_name,
				(result) =>
				{
					window.location.href = U('/users');
				},
				(xhr) =>
				{
					Universal Household.FrontendHelpers.EndUiBusy("user-form");
					Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
				}
			);
		}
		else
		{
			window.location.href = U('/users');
		}
	});
}

$('#save-user-button').on('click', function (e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("user-form", true))
	{
		return;
	}

	if ($(".combobox-menu-visible").length)
	{
		return;
	}

	var jsonData = $('#user-form').serializeJSON();
	Universal Household.FrontendHelpers.BeginUiBusy("user-form");

	if ($("#user-picture")[0].files.length > 0)
	{
		jsonData.picture_file_name = RandomString() + CleanFileName($("#user-picture")[0].files[0].name);
	}

	jsonData.password_base64 = btoa(String.fromCharCode(...new TextEncoder().encode(jsonData.password)));
	delete jsonData.password;
	delete jsonData.password_confirm;
	delete jsonData.change_password;

	if (Universal Household.EditMode === 'create')
	{
		Universal Household.Api.Post('users', jsonData,
			(result) => SaveUserPicture(result, jsonData),
			function (xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("user-form");
				console.error(xhr);
			}
		);
	}
	else
	{
		if (Universal Household.DeleteUserPictureOnSave)
		{
			jsonData.picture_file_name = null;

			Universal Household.Api.DeleteFile(Universal Household.UserPictureFileName, 'userpictures',
				function (result)
				{
					// Nothing to do
				},
				function (xhr)
				{
					Universal Household.FrontendHelpers.EndUiBusy("user-form");
					Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
				}
			);
		}

		Universal Household.Api.Put('users/' + Universal Household.EditObjectId, jsonData,
			(result) => SaveUserPicture(result, jsonData),
			function (xhr)
			{
				Universal Household.FrontendHelpers.EndUiBusy("user-form");
				console.error(xhr);
			}
		);
	}
});

$('#user-form input').keyup(function (event)
{
	var element = document.getElementById("password_confirm");
	if ($("#password").val() !== $("#password_confirm").val())
	{
		element.setCustomValidity("error");
	}
	else
	{
		element.setCustomValidity("");
	}

	Universal Household.FrontendHelpers.ValidateForm('user-form');
});

$('#user-form input').keydown(function (event)
{
	if (event.keyCode === 13) // Enter
	{
		event.preventDefault();

		if (!Universal Household.FrontendHelpers.ValidateForm('user-form'))
		{
			return false;
		}
		else
		{
			$('#save-user-button').click();
		}
	}
});

$("#user-picture").on("change", function (e)
{
	$("#user-picture-label").removeClass("d-none");
	$("#user-picture-label-none").addClass("d-none");
	$("#delete-current-user-picture-on-save-hint").addClass("d-none");
	$("#current-user-picture").addClass("d-none");
	Universal Household.DeleteUserePictureOnSave = false;
});

Universal Household.DeleteUserPictureOnSave = false;
$("#delete-current-user-picture-button").on("click", function (e)
{
	Universal Household.DeleteUserPictureOnSave = true;
	$("#current-user-picture").addClass("d-none");
	$("#delete-current-user-picture-on-save-hint").removeClass("d-none");
	$("#user-picture-label").addClass("d-none");
	$("#user-picture-label-none").removeClass("d-none");
});

$("#change_password").click(function ()
{
	$("#password").attr("disabled", !this.checked);
	$("#password_confirm").attr("disabled", !this.checked);

	setTimeout(function ()
	{
		$("#password").focus();
	}, Universal Household.FormFocusDelay);
});

if (GetUriParam("changepw") === "true")
{
	$("#change_password").click();
}
else
{
	setTimeout(function ()
	{
		$('#username').focus();
	}, Universal Household.FormFocusDelay);
}

Universal Household.Components.UserfieldsForm.Load();
Universal Household.FrontendHelpers.ValidateForm('user-form');
