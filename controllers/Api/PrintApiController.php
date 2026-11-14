<?php

namespace Universal Household\Controllers\Api;

use Universal Household\Controllers\Users\User;
use Universal Household\Services\PrintService;
use Universal Household\Services\StockService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class PrintApiController extends BaseApiController
{
	public function PrintShoppingListThermal(Request $request, Response $response, array $args)
	{
		try
		{
			User::CheckPermission($request, User::PERMISSION_SHOPPINGLIST);

			$params = $request->getQueryParams();

			$listId = 1;
			if (isset($params['list']))
			{
				$listId = $params['list'];
			}

			$printHeader = true;
			if (isset($params['printHeader']))
			{
				$printHeader = ($params['printHeader'] === 'true');
			}
			$items = StockService::GetInstance()->GetShoppinglistInPrintableStrings($listId);
			return $this->ApiResponse($response, PrintService::GetInstance()->printShoppingList($printHeader, $items));
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}
}
