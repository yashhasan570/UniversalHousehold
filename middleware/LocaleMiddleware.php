<?php

namespace Universal Household\Middleware;

use Universal Household\Services\UsersService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class LocaleMiddleware extends BaseMiddleware
{
	public function __invoke(Request $request, RequestHandler $handler): Response
	{
		define('UNIVERSALHOUSEHOLD_LOCALE', $this->GetLocale($request));

		return $handler->handle($request);
	}

	private function GetLocale(Request $request)
	{
		// Demo and Prerelease modes are fixed to the default locale
		if (UNIVERSALHOUSEHOLD_MODE === 'demo' || UNIVERSALHOUSEHOLD_MODE === 'prerelease')
		{
			return UNIVERSALHOUSEHOLD_DEFAULT_LOCALE;
		}

		// Prefer user setting
		if (defined('UNIVERSALHOUSEHOLD_AUTHENTICATED') && UNIVERSALHOUSEHOLD_AUTHENTICATED)
		{
			$locale = UsersService::GetInstance()->GetUserSetting(UNIVERSALHOUSEHOLD_USER_ID, 'locale');
			if (isset($locale) && !empty($locale))
			{
				if (in_array($locale, scandir(__DIR__ . '/../localization')))
				{
					return $locale;
				}
			}
		}

		// Otherwise use Browser prefered locale
		$browserPreferedLocales = array_reduce(
			explode(',', implode(',', $request->getHeader('Accept-Language'))),
			function ($res, $el)
			{
				list($l, $q) = array_merge(explode(';q=', $el), [1]);
				$res[$l] = (float)$q;
				return $res;
			},
			[]
		);
		arsort($browserPreferedLocales);

		$availableLocales = scandir(__DIR__ . '/../localization');
		foreach ($browserPreferedLocales as $locale => $q)
		{
			if (in_array($locale, $availableLocales))
			{
				return $locale;
			}

			// e.g. en_GB
			if (in_array(substr($locale, 0, 5), $availableLocales))
			{
				return substr($locale, 0, 5);
			}

			// e.g. cs
			if (in_array(substr($locale, 0, 2), $availableLocales))
			{
				return substr($locale, 0, 2);
			}
		}

		// Falback to default locale
		return UNIVERSALHOUSEHOLD_DEFAULT_LOCALE;
	}
}
