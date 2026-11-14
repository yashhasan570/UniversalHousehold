<?php

namespace Universal Household\Controllers;

use Universal Household\Services\ApplicationService;
use Universal Household\Services\DatabaseMigrationService;
use Universal Household\Services\DemoDataGeneratorService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class SystemController extends BaseController
{
	public function About(Request $request, Response $response, array $args)
	{
		return $this->RenderPage($response, 'about', [
			'systemInfo' => ApplicationService::GetInstance()->GetSystemInfo(),
			'versionInfo' => ApplicationService::GetInstance()->GetInstalledVersion(),
			'changelog' => ApplicationService::GetInstance()->GetChangelog()
		]);
	}

	public function BarcodeScannerTesting(Request $request, Response $response, array $args)
	{
		return $this->RenderPage($response, 'barcodescannertesting');
	}

	public function Root(Request $request, Response $response, array $args)
	{
		// Schema migration is done here
		$databaseMigrationService = DatabaseMigrationService::GetInstance();
		$databaseMigrationService->MigrateDatabase();

		if (UNIVERSALHOUSEHOLD_MODE === 'dev' || UNIVERSALHOUSEHOLD_MODE === 'demo' || UNIVERSALHOUSEHOLD_MODE === 'prerelease')
		{
			$demoDataGeneratorService = DemoDataGeneratorService::GetInstance();
			$demoDataGeneratorService->PopulateDemoData(isset($request->getQueryParams()['nodemodata']));
		}

		return $response->withRedirect($this->AppContainer->get('UrlManager')->ConstructUrl($this->GetEntryPageRelative()));
	}

	public function Manifest(Request $request, Response $response, array $args)
	{
		$data = explode('#', base64_decode($request->getQueryParams()['data']));

		$manifest = [
			'name' => 'Universal Household ' . $data[0],
			'short_name' => 'Universal Household ' . $data[0],
			'icons' => [[
				'src' => './img/icon-1024.png',
				'sizes'=> '1024x1024',
				'type' => 'image/png'
			]],
			'start_url' => $data[1],
			'background_color' => '#333131',
			'theme_color' => '#333131',
			'display' => 'standalone'
		];

		$response->getBody()->write(json_encode($manifest));
		return $response->withHeader('Content-Type', 'application/json');
	}

	private function GetEntryPageRelative()
	{
		if (defined('UNIVERSALHOUSEHOLD_ENTRY_PAGE'))
		{
			$entryPage = constant('UNIVERSALHOUSEHOLD_ENTRY_PAGE');
		}
		else
		{
			$entryPage = 'stock';
		}

		// Stock
		if ($entryPage === 'stock' && constant('UNIVERSALHOUSEHOLD_FEATURE_FLAG_STOCK'))
		{
			return '/stockoverview';
		}

		// Shoppinglist
		if ($entryPage === 'shoppinglist' && constant('UNIVERSALHOUSEHOLD_FEATURE_FLAG_SHOPPINGLIST'))
		{
			return '/shoppinglist';
		}

		// Recipes
		if ($entryPage === 'recipes' && constant('UNIVERSALHOUSEHOLD_FEATURE_FLAG_RECIPES'))
		{
			return '/recipes';
		}

		// Chores
		if ($entryPage === 'chores' && constant('UNIVERSALHOUSEHOLD_FEATURE_FLAG_CHORES'))
		{
			return '/choresoverview';
		}

		// Tasks
		if ($entryPage === 'tasks' && constant('UNIVERSALHOUSEHOLD_FEATURE_FLAG_TASKS'))
		{
			return '/tasks';
		}

		// Batteries
		if ($entryPage === 'batteries' && constant('UNIVERSALHOUSEHOLD_FEATURE_FLAG_BATTERIES'))
		{
			return '/batteriesoverview';
		}

		if ($entryPage === 'equipment' && constant('UNIVERSALHOUSEHOLD_FEATURE_FLAG_EQUIPMENT'))
		{
			return '/equipment';
		}

		// Calendar
		if ($entryPage === 'calendar' && constant('UNIVERSALHOUSEHOLD_FEATURE_FLAG_CALENDAR'))
		{
			return '/calendar';
		}

		// Meal Plan
		if ($entryPage === 'mealplan' && constant('UNIVERSALHOUSEHOLD_FEATURE_FLAG_RECIPES_MEALPLAN'))
		{
			return '/mealplan';
		}

		return '/about';
	}
}
