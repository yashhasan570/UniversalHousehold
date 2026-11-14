var choresOverviewTable = $('#chores-overview-table').DataTable({
	'order': [[2, 'asc']],
	'columnDefs': [
		{ 'orderable': false, 'targets': 0 },
		{ 'searchable': false, "targets": 0 },
		{ "type": "html", "targets": 5 },
		{ "type": "html", "targets": 2 },
		{ "type": "html", "targets": 3 }
	].concat($.fn.dataTable.defaults.columnDefs)
});
$('#chores-overview-table tbody').removeClass("d-none");
choresOverviewTable.columns.adjust().draw();

$("#search").on("keyup", Delay(function ()
{
	var value = $(this).val();
	if (value === "all")
	{
		value = "";
	}

	choresOverviewTable.search(value.accentNeutralise()).draw();
}, Universal Household.FormFocusDelay));

$("#status-filter").on("change", function ()
{
	var value = $(this).val();
	if (value === "all")
	{
		value = "";
	}

	// Transfer CSS classes of selected element to dropdown element (for background)
	$(this).attr("class", $("#" + $(this).attr("id") + " option[value='" + value + "']").attr("class") + " form-control");

	choresOverviewTable.column(choresOverviewTable.colReorder.transpose(5)).search(value.accentNeutralise()).draw();
});

$("#user-filter").on("change", function ()
{
	var value = $(this).val();
	if (value === "all")
	{
		value = "";
	}

	// Transfer CSS classes of selected element to dropdown element (for background)
	$(this).attr("class", $("#" + $(this).attr("id") + " option[value='" + value + "']").attr("class") + " form-control");

	choresOverviewTable.column(choresOverviewTable.colReorder.transpose(6)).search(value.accentNeutralise()).draw();

	if (value)
	{
		UpdateUriParam("user", $("#user-filter option:selected").data("user-id"));
	}
});

$("#clear-filter-button").on("click", function ()
{
	$("#search").val("");
	$("#status-filter").val("all");
	$("#user-filter").val("all");
	choresOverviewTable.column(choresOverviewTable.colReorder.transpose(5)).search("").draw();
	choresOverviewTable.column(choresOverviewTable.colReorder.transpose(6)).search("").draw();
	choresOverviewTable.search("").draw();
	RemoveUriParam("user");
});

$(".status-filter-message").on("click", function ()
{
	var value = $(this).data("status-filter");
	$("#status-filter").val(value);
	$("#status-filter").trigger("change");
});

$(".user-filter-message").on("click", function ()
{
	var value = $(this).data("user-filter");
	$("#user-filter").val(value);
	$("#user-filter").trigger("change");
});

$(document).on('click', '.track-chore-button', function (e)
{
	e.preventDefault();

	Universal Household.FrontendHelpers.BeginUiBusy();

	var choreId = $(e.currentTarget).attr('data-chore-id');
	var choreName = $(e.currentTarget).attr('data-chore-name');
	var skipped = $(e.currentTarget).hasClass("skip");
	var now = $(e.currentTarget).hasClass("now");

	Universal Household.Api.Get('chores/' + choreId,
		function (choreDetails)
		{
			var trackedTime = moment().format('YYYY-MM-DD HH:mm:ss');
			if ((skipped || !now) && choreDetails.next_estimated_execution_time != null)
			{
				trackedTime = moment(choreDetails.next_estimated_execution_time).format('YYYY-MM-DD HH:mm:ss');
			}

			if (choreDetails.chore.track_date_only == 1)
			{
				if ((skipped || !now) && choreDetails.next_estimated_execution_time != null)
				{
					trackedTime = moment(choreDetails.next_estimated_execution_time).format('YYYY-MM-DD');
				}
				else
				{
					trackedTime = moment().format('YYYY-MM-DD');
				}
			}

			Universal Household.Api.Post('chores/' + choreId + '/execute', { 'tracked_time': trackedTime, 'skipped': skipped },
				function ()
				{
					Universal Household.Api.Get('chores/' + choreId,
						function (result)
						{
							var choreRow = $('#chore-' + choreId + '-row');
							var nextXDaysThreshold = moment().add($("#info-due-soon-chores").data("next-x-days"), "days");
							var todayThreshold = moment().endOf("day");
							var now = moment();
							var nextExecutionTime = moment(result.next_estimated_execution_time);

							choreRow.removeClass("table-warning");
							choreRow.removeClass("table-danger");
							choreRow.removeClass("table-info");
							$('#chore-' + choreId + '-due-filter-column').html("");
							if (nextExecutionTime.isBefore(now))
							{
								choreRow.addClass("table-danger");
								$('#chore-' + choreId + '-due-filter-column').html("overdue");
							}
							else if (nextExecutionTime.isSameOrBefore(todayThreshold))
							{
								choreRow.addClass("table-info");
								$('#chore-' + choreId + '-due-filter-column').html("duetoday");
							}
							else if (nextExecutionTime.isBefore(nextXDaysThreshold))
							{
								choreRow.addClass("table-warning");
								$('#chore-' + choreId + '-due-filter-column').html("duesoon");
							}

							animateCSS("#chore-" + choreId + "-row td:not(:first)", "flash");

							$('#chore-' + choreId + '-last-tracked-time').text(trackedTime);
							$('#chore-' + choreId + '-last-tracked-time-timeago').attr('datetime', trackedTime);

							if (result.next_estimated_execution_time)
							{
								$('#chore-' + choreId + '-next-execution-time').text(result.next_estimated_execution_time);
								$('#chore-' + choreId + '-next-execution-time-timeago').attr('datetime', result.next_estimated_execution_time);
							}
							else
							{
								$('#chore-' + choreId + '-next-execution-time').text("-");
								$('#chore-' + choreId + '-next-execution-time-timeago').removeAttr('datetime');
							}

							if (result.chore.next_execution_assigned_to_user_id != null)
							{
								$('#chore-' + choreId + '-next-execution-assigned-user').text(result.next_execution_assigned_user.display_name);
							}
							else
							{
								$('#chore-' + choreId + '-next-execution-assigned-user').text("-");
							}

							$('#chore-' + choreId + '-rescheduled-icon').remove();
							$('#chore-' + choreId + '-reassigned-icon').remove();

							Universal Household.FrontendHelpers.EndUiBusy();
							toastr.success(__t('Tracked execution of chore %1$s on %2$s', choreName, trackedTime));
							RefreshStatistics();

							// Delay due to delayed/animated set of new timestamps above
							setTimeout(function ()
							{
								RefreshContextualTimeago("#chore-" + choreId + "-row");

								// Refresh the DataTable to re-apply filters
								choresOverviewTable.rows().invalidate().draw(false);
								$(".input-group-filter").trigger("change");
							}, Universal Household.FormFocusDelay);
						},
						function (xhr)
						{
							Universal Household.FrontendHelpers.EndUiBusy();
							console.error(xhr);
						}
					);
				},
				function (xhr)
				{
					Universal Household.FrontendHelpers.EndUiBusy();
					console.error(xhr);
				}
			);
		},
		function (xhr)
		{
			Universal Household.FrontendHelpers.EndUiBusy("choretracking-form");
			console.error(xhr);
		}
	);
});

$(document).on('click', '.chore-householdcode-label-print', function (e)
{
	e.preventDefault();

	var choreId = $(e.currentTarget).attr('data-chore-id');
	Universal Household.Api.Get('chores/' + choreId + '/printlabel', function (labelData)
	{
		if (Universal Household.Webhooks.labelprinter !== undefined)
		{
			Universal Household.FrontendHelpers.RunWebhook(Universal Household.Webhooks.labelprinter, labelData);
		}
	});
});

function RefreshStatistics()
{
	var nextXDays = $("#info-due-soon-chores").data("next-x-days");
	Universal Household.Api.Get('chores',
		function (result)
		{
			var dueTodayCount = 0;
			var dueSoonCount = 0;
			var overdueCount = 0;
			var assignedToMeCount = 0;
			var overdueThreshold = moment();
			var nextXDaysThreshold = moment().add(nextXDays, "days");
			var todayThreshold = moment().endOf("day");

			result.forEach(element =>
			{
				var date = moment(element.next_estimated_execution_time);

				if (date.isBefore(overdueThreshold))
				{
					overdueCount++;
				}
				else if (date.isSameOrBefore(todayThreshold))
				{
					dueTodayCount++;
					dueSoonCount++;
				}
				else if (date.isSameOrBefore(nextXDaysThreshold))
				{
					dueSoonCount++;
				}

				if (element.next_execution_assigned_to_user_id == Universal Household.UserId)
				{
					assignedToMeCount++;
				}
			});

			$("#info-due-today-chores").html('<span class="d-block d-md-none">' + dueTodayCount + ' <i class="fa-solid fa-clock"></i></span><span class="d-none d-md-block">' + __n(dueTodayCount, '%s chore is due to be done today', '%s chores are due to be done today'));
			$("#info-due-soon-chores").html('<span class="d-block d-md-none">' + dueSoonCount + ' <i class="fa-solid fa-clock"></i></span><span class="d-none d-md-block">' + __n(dueSoonCount, '%s chore is due to be done', '%s chores are due to be done') + ' ' + __n(nextXDays, 'within the next day', 'within the next %s days'));
			$("#info-overdue-chores").html('<span class="d-block d-md-none">' + overdueCount + ' <i class="fa-solid fa-times-circle"></i></span><span class="d-none d-md-block">' + __n(overdueCount, '%s chore is overdue to be done', '%s chores are overdue to be done'));
			$("#info-assigned-to-me-chores").html('<span class="d-block d-md-none">' + assignedToMeCount + ' <i class="fa-solid fa-exclamation-circle"></i></span><span class="d-none d-md-block">' + __n(assignedToMeCount, '%s chore is assigned to me', '%s chores are assigned to me'));
		},
		function (xhr)
		{
			console.error(xhr);
		}
	);
}

$(document).on("click", ".reschedule-chore-button", function (e)
{
	e.preventDefault();

	var choreId = $(e.currentTarget).attr("data-chore-id");
	Universal Household.EditObjectId = choreId;
	Universal Household.Api.Get("chores/" + choreId, function (choreDetails)
	{
		var prefillDate = choreDetails.next_estimated_execution_time || moment().format("YYYY-MM-DD HH:mm:ss");
		if (choreDetails.chore.rescheduled_date)
		{
			prefillDate = choreDetails.chore.rescheduled_date;
		}

		if (choreDetails.chore.track_date_only == 1)
		{
			Universal Household.Components.DateTimePicker.ChangeFormat("YYYY-MM-DD");
			Universal Household.Components.DateTimePicker.SetValue(moment(prefillDate).format("YYYY-MM-DD"));
		}
		else
		{
			Universal Household.Components.DateTimePicker.ChangeFormat("YYYY-MM-DD HH:mm:ss");
			Universal Household.Components.DateTimePicker.SetValue(moment(prefillDate).format("YYYY-MM-DD HH:mm:ss"));
		}

		if (typeof choreDetails.chore.next_execution_assigned_to_user_id != "string")
		{
			choreDetails.chore.next_execution_assigned_to_user_id = "";
		}
		if (choreDetails.chore.next_execution_assigned_to_user_id)
		{
			Universal Household.Components.UserPicker.SetId(choreDetails.chore.next_execution_assigned_to_user_id)
		}
		else
		{
			Universal Household.Components.UserPicker.SetValue("");
			Universal Household.Components.UserPicker.SetId(null);
		}

		$("#reschedule-chore-modal-title").text(choreDetails.chore.name);
		$("#reschedule-chore-modal").modal("show");
	});
});

$("#reschedule-chore-save-button").on("click", function (e)
{
	e.preventDefault();

	if (!Universal Household.FrontendHelpers.ValidateForm("reschedule-chore-form", true))
	{
		return;
	}

	Universal Household.Api.Put('objects/chores/' + Universal Household.EditObjectId, { "rescheduled_date": Universal Household.Components.DateTimePicker.GetValue(), "rescheduled_next_execution_assigned_to_user_id": Universal Household.Components.UserPicker.GetValue() },
		function (result)
		{
			Universal Household.Api.Post('chores/executions/calculate-next-assignments', { "chore_id": Universal Household.EditObjectId },
				function (result)
				{
					window.location.reload();
				},
				function (xhr)
				{
					console.error(xhr);
				}
			);
		},
		function (xhr)
		{
			Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
		}
	);
});

$("#reschedule-chore-clear-button").on("click", function (e)
{
	e.preventDefault();

	Universal Household.Api.Put('objects/chores/' + Universal Household.EditObjectId, { "rescheduled_date": null, "rescheduled_next_execution_assigned_to_user_id": null },
		function (result)
		{
			Universal Household.Api.Post('chores/executions/calculate-next-assignments', { "chore_id": Universal Household.EditObjectId },
				function (result)
				{
					window.location.reload();
				},
				function (xhr)
				{
					console.error(xhr);
				}
			);
		},
		function (xhr)
		{
			Universal Household.FrontendHelpers.ShowGenericError('Error while saving, probably this item already exists', xhr.response);
		}
	);
});

if (GetUriParam("user") !== undefined)
{
	$("#user-filter").val("xx" + GetUriParam("user") + "xx");
	$("#user-filter").trigger("change");
}

RefreshStatistics();
