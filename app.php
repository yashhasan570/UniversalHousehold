<?php

use Universal Household\Controllers\ExceptionController;
use Universal Household\Helpers\SlimBladeView;
use Universal Household\Helpers\UrlManager;
use Universal Household\Middleware\LocaleMiddleware;
use Psr\Container\ContainerInterface as Container;
use Slim\Factory\AppFactory;

// Load composer dependencies
require_once __DIR__ . '/packages/autoload.php';

// Load config files
require_once UNIVERSALHOUSEHOLD_DATAPATH . '/config.php';
require_once __DIR__ . '/config-dist.php'; // For not in own config defined values we use the default ones

// Error reporting definitions
if (UNIVERSALHOUSEHOLD_MODE === 'dev')
{
	error_reporting(E_ALL);
}
else
{
	error_reporting(E_ALL ^ (E_NOTICE | E_WARNING | E_DEPRECATED));
}

// Definitions for dev/demo/prerelease mode
if ((UNIVERSALHOUSEHOLD_MODE === 'dev' || UNIVERSALHOUSEHOLD_MODE === 'demo' || UNIVERSALHOUSEHOLD_MODE === 'prerelease') && !defined('UNIVERSALHOUSEHOLD_USER_ID'))
{
	define('UNIVERSALHOUSEHOLD_USER_ID', 1);
}

// Definitions for disabled authentication mode
if (UNIVERSALHOUSEHOLD_DISABLE_AUTH === true)
{
	if (!defined('UNIVERSALHOUSEHOLD_USER_ID'))
	{
		define('UNIVERSALHOUSEHOLD_USER_ID', 1);
	}
}

// Check if any invalid entries in config.php have been made
try
{
	(new Universal Household\Helpers\ConfigurationValidator())->validateConfig();
}
catch (\Universal Household\Helpers\EInvalidConfig $ex)
{
	http_response_code(500);
	exit('Invalid setting in config.php: ' . $ex->getMessage());
}

// Create data/viewcache folder if it doesn't exist
$viewcachePath = UNIVERSALHOUSEHOLD_DATAPATH . '/viewcache';
if (!file_exists($viewcachePath))
{
	mkdir($viewcachePath);
}

// Empty data/viewcache when and trigger database migrations when:
// The version changed (so when an update was done)
// UNIVERSALHOUSEHOLD_BASE_URL OR UNIVERSALHOUSEHOLD_BASE_PATH changed
$hash = hash('sha256', file_get_contents(__DIR__ . '/version.json') . UNIVERSALHOUSEHOLD_BASE_URL . UNIVERSALHOUSEHOLD_BASE_PATH);
if (UNIVERSALHOUSEHOLD_MODE === 'dev')
{
	// For dev mode use routes.php to track changes
	$hash = hash('sha256', file_get_contents(__DIR__ . '/routes.php'));
}
$hashCacheFile = $viewcachePath . "/$hash.txt";
if (!file_exists($hashCacheFile))
{
	EmptyFolder($viewcachePath);
	touch($hashCacheFile);

	if (function_exists('opcache_reset'))
	{
		opcache_reset();
	}

	// Schema migration happens on the root route, so redirect to there
	header('Location: ' . (new UrlManager(UNIVERSALHOUSEHOLD_BASE_URL))->ConstructUrl('/'));
	exit();
}

// Setup base application
AppFactory::setContainer(new DI\Container());
$app = AppFactory::create();

$container = $app->getContainer();
$container->set('view', function (Container $container)
{
	return new SlimBladeView(__DIR__ . '/views', UNIVERSALHOUSEHOLD_DATAPATH . '/viewcache');
});

$container->set('UrlManager', function (Container $container)
{
	return new UrlManager(UNIVERSALHOUSEHOLD_BASE_URL);
});

$container->set('ApiKeyHeaderName', function (Container $container)
{
	return 'UNIVERSALHOUSEHOLD-API-KEY';
});

// Load routes from separate file
require_once __DIR__ . '/routes.php';

// Set base path if defined
if (!empty(UNIVERSALHOUSEHOLD_BASE_PATH))
{
	$app->setBasePath(UNIVERSALHOUSEHOLD_BASE_PATH);
}

$app->add(new LocaleMiddleware($container, $app->getResponseFactory()));
$authMiddlewareClass = UNIVERSALHOUSEHOLD_AUTH_CLASS;
$app->add(new $authMiddlewareClass($container, $app->getResponseFactory()));

// Add default middleware
$app->addBodyParsingMiddleware();
$app->addRoutingMiddleware();
$errorMiddleware = $app->addErrorMiddleware(true, false, false);
$errorMiddleware->setDefaultErrorHandler(new ExceptionController($container, $app->getResponseFactory()));

$app->getRouteCollector()->setCacheFile(UNIVERSALHOUSEHOLD_DATAPATH . '/viewcache/route_cache.php');

ob_clean(); // No response output before here
$app->run();
