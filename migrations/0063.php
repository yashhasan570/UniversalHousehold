<?php

// This is executed inside DatabaseMigrationService class/context

use Universal Household\Services\DatabaseService;
use Universal Household\Services\LocalizationService;

$localizationService = LocalizationService::GetInstance(UNIVERSALHOUSEHOLD_DEFAULT_LOCALE);
$db = DatabaseService::GetInstance()->GetDbConnection();

$defaultShoppingList = $db->shopping_lists()->where('id = 1')->fetch();
$defaultShoppingList->update([
	'name' => $localizationService->__t('Shopping list')
]);
