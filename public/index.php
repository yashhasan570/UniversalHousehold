<?php

// Definitions for embedded mode

if (file_exists(__DIR__ . '/../embedded.txt'))
{
	define('UNIVERSALHOUSEHOLD_IS_EMBEDDED_INSTALL', true);
	define('UNIVERSALHOUSEHOLD_DATAPATH', file_get_contents(__DIR__ . '/../embedded.txt'));
	define('UNIVERSALHOUSEHOLD_USER_ID', 1);
}
else
{
	define('UNIVERSALHOUSEHOLD_IS_EMBEDDED_INSTALL', false);

	$datapath = 'data';

	if (getenv('UNIVERSALHOUSEHOLD_DATAPATH') !== false)
	{
		$datapath = getenv('UNIVERSALHOUSEHOLD_DATAPATH');
	}
	elseif (array_key_exists('UNIVERSALHOUSEHOLD_DATAPATH', $_SERVER))
	{
		$datapath = $_SERVER['UNIVERSALHOUSEHOLD_DATAPATH'];
	}

	if ($datapath[0] != '/')
	{
		$datapath = __DIR__ . '/../' . $datapath;
	}

	define('UNIVERSALHOUSEHOLD_DATAPATH', $datapath);
}

require_once __DIR__ . '/../helpers/PrerequisiteChecker.php';

try
{
	(new Universal Household\Helpers\PrerequisiteChecker())->checkRequirements();
}
catch (Universal Household\Helpers\ERequirementNotMet $ex)
{
	http_response_code(500);
	exit('Unable to run Universal Household: ' . $ex->getMessage());
}

require_once __DIR__ . '/../app.php';
