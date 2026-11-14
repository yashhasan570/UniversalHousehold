<?php

// This is executed inside DatabaseMigrationService class/context

use Universal Household\Services\StockService;

StockService::GetInstance()->CompactStockEntries();
