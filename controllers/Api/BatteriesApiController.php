<?php

namespace Universal Household\Controllers\Api;

use Universal Household\Controllers\Users\User;
use Universal Household\Helpers\UniversalHouseholdCode;
use Universal Household\Helpers\WebhookRunner;
use Universal Household\Services\BatteriesService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class BatteriesApiController extends BaseApiController
{
	public function BatteryDetails(Request $request, Response $response, array $args)
	{
		try
		{
			return $this->ApiResponse($response, BatteriesService::GetInstance()->GetBatteryDetails($args['batteryId']));
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function Current(Request $request, Response $response, array $args)
	{
		return $this->FilteredApiResponse($response, BatteriesService::GetInstance()->GetCurrent(), $request->getQueryParams());
	}

	public function TrackChargeCycle(Request $request, Response $response, array $args)
	{
		User::CheckPermission($request, User::PERMISSION_BATTERIES_TRACK_CHARGE_CYCLE);

		$requestBody = $this->GetParsedAndFilteredRequestBody($request);

		try
		{
			$trackedTime = date('Y-m-d H:i:s');
			if (array_key_exists('tracked_time', $requestBody) && IsIsoDateTime($requestBody['tracked_time']))
			{
				$trackedTime = $requestBody['tracked_time'];
			}

			$chargeCycleId = BatteriesService::GetInstance()->TrackChargeCycle($args['batteryId'], $trackedTime);
			return $this->ApiResponse($response, $this->DB->battery_charge_cycles($chargeCycleId));
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function UndoChargeCycle(Request $request, Response $response, array $args)
	{
		User::CheckPermission($request, User::PERMISSION_BATTERIES_UNDO_CHARGE_CYCLE);

		try
		{
			$this->ApiResponse($response, BatteriesService::GetInstance()->UndoChargeCycle($args['chargeCycleId']));
			return $this->EmptyApiResponse($response);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function BatteryPrintLabel(Request $request, Response $response, array $args)
	{
		try
		{
			$batteryDetails = (object)BatteriesService::GetInstance()->GetBatteryDetails($args['batteryId']);

			$webhookData = array_merge([
				'battery' => $batteryDetails->battery->name,
				'householdcode' => (string)(new UniversalHouseholdCode(UniversalHouseholdCode::BATTERY, $args['batteryId'])),
				'details' => $batteryDetails,
			], UNIVERSALHOUSEHOLD_LABEL_PRINTER_PARAMS);

			if (UNIVERSALHOUSEHOLD_LABEL_PRINTER_RUN_SERVER)
			{
				(new WebhookRunner())->run(UNIVERSALHOUSEHOLD_LABEL_PRINTER_WEBHOOK, $webhookData, UNIVERSALHOUSEHOLD_LABEL_PRINTER_HOOK_JSON);
			}

			return $this->ApiResponse($response, $webhookData);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}
}
