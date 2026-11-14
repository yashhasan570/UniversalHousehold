<?php

namespace Universal Household\Controllers\Api;

use Universal Household\Controllers\Users\User;
use Universal Household\Helpers\UniversalHouseholdCode;
use Universal Household\Helpers\WebhookRunner;
use Universal Household\Services\RecipesService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class RecipesApiController extends BaseApiController
{
	public function AddNotFulfilledProductsToShoppingList(Request $request, Response $response, array $args)
	{
		User::CheckPermission($request, User::PERMISSION_SHOPPINGLIST_ITEMS_ADD);

		$requestBody = $this->GetParsedAndFilteredRequestBody($request);
		$excludedProductIds = null;

		if ($requestBody !== null && array_key_exists('excludedProductIds', $requestBody))
		{
			$excludedProductIds = $requestBody['excludedProductIds'];
		}

		RecipesService::GetInstance()->AddNotFulfilledProductsToShoppingList($args['recipeId'], $excludedProductIds);
		return $this->EmptyApiResponse($response);
	}

	public function ConsumeRecipe(Request $request, Response $response, array $args)
	{
		User::CheckPermission($request, User::PERMISSION_STOCK_CONSUME);

		try
		{
			RecipesService::GetInstance()->ConsumeRecipe($args['recipeId']);
			return $this->EmptyApiResponse($response);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function GetRecipeFulfillment(Request $request, Response $response, array $args)
	{
		try
		{
			if (!isset($args['recipeId']))
			{
				return $this->FilteredApiResponse($response, RecipesService::GetInstance()->GetRecipesResolved(), $request->getQueryParams());
			}

			$recipeResolved = FindObjectInArrayByPropertyValue(RecipesService::GetInstance()->GetRecipesResolved(), 'recipe_id', $args['recipeId']);

			if (!$recipeResolved)
			{
				throw new \Exception('Recipe does not exist');
			}
			else
			{
				return $this->ApiResponse($response, $recipeResolved);
			}
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function CopyRecipe(Request $request, Response $response, array $args)
	{
		try
		{
			return $this->ApiResponse($response, [
				'created_object_id' => RecipesService::GetInstance()->CopyRecipe($args['recipeId'])
			]);
		}
		catch (\Exception $ex)
		{
			return $this->GenericErrorResponse($response, $ex->getMessage());
		}
	}

	public function RecipePrintLabel(Request $request, Response $response, array $args)
	{
		try
		{
			$recipe = $this->DB->recipes()->where('id', $args['recipeId'])->fetch();

			$webhookData = array_merge([
				'recipe' => $recipe->name,
				'householdcode' => (string)(new UniversalHouseholdCode(UniversalHouseholdCode::RECIPE, $args['recipeId'])),
				'details' => $recipe
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
