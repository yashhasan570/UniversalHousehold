<?php

namespace Universal Household\Middleware\Auth;

use Universal Household\Middleware\BaseMiddleware;
use Universal Household\Services\SessionService;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Routing\RouteContext;

abstract class BaseAuthMiddleware extends BaseMiddleware
{
	public function __invoke(Request $request, RequestHandler $handler): Response
	{
		$routeName = $this->GetRouteName($request);
		if ($routeName === 'root' || $routeName === 'login')
		{
			// Root and Login routes are public/unauthenticated

			define('UNIVERSALHOUSEHOLD_AUTHENTICATED', false);
			return $handler->handle($request);
		}

		if (UNIVERSALHOUSEHOLD_MODE === 'dev' || UNIVERSALHOUSEHOLD_MODE === 'demo' || UNIVERSALHOUSEHOLD_MODE === 'prerelease' || UNIVERSALHOUSEHOLD_IS_EMBEDDED_INSTALL || UNIVERSALHOUSEHOLD_DISABLE_AUTH)
		{
			// These modes use default user context (without authentication) only

			$sessionService = SessionService::GetInstance();
			$user = $sessionService->GetDefaultUser();

			define('UNIVERSALHOUSEHOLD_AUTHENTICATED', true);
			define('UNIVERSALHOUSEHOLD_USER_USERNAME', $user->username);
			define('UNIVERSALHOUSEHOLD_USER_PICTURE_FILE_NAME', $user->picture_file_name);

			return $handler->handle($request);
		}
		else
		{
			// Normal authentication flow (up to specific middleware implementation)

			$user = $this->AuthenticateRequest($request);

			if ($user === null)
			{
				define('UNIVERSALHOUSEHOLD_AUTHENTICATED', false);
				$response = $this->ResponseFactory->createResponse();

				if ($this->IsApiRoute($request))
				{
					return $response->withStatus(401);
				}
				else
				{
					return $response->withStatus(302)->withHeader('Location', $this->AppContainer->get('UrlManager')->ConstructUrl('/login'));
				}
			}
			else
			{
				define('UNIVERSALHOUSEHOLD_AUTHENTICATED', true);
				define('UNIVERSALHOUSEHOLD_USER_ID', $user->id);
				define('UNIVERSALHOUSEHOLD_USER_USERNAME', $user->username);
				define('UNIVERSALHOUSEHOLD_USER_PICTURE_FILE_NAME', $user->picture_file_name);

				return $handler->handle($request);
			}
		}
	}

	protected static function SetSessionCookie(int $tokenType, string $token)
	{
		switch ($tokenType)
		{
			case SessionService::SESSION_TOKEN_TYPE_ACCESS:
				setcookie(SessionService::SESSION_TOKEN_COOKIE_NAME_ACCESS, $token, [
					'expires' => 0, // Browser session end
					'httponly' => true,
					'samesite' => 'Lax',
					'path' => '/'
				]);
				break;

			case SessionService::SESSION_TOKEN_TYPE_REMEMBER_ME:
				setcookie(SessionService::SESSION_TOKEN_COOKIE_NAME_REMEMBER_ME, $token, [
					'expires' => time() + SessionService::SESSION_TOKEN_EXPIRATION_SECONDS_REMEMBER_ME,
					'httponly' => true,
					'samesite' => 'Lax',
					'path' => '/'
				]);
				break;
		}
	}

	protected static function RemoveSessionCookie(int $tokenType)
	{
		switch ($tokenType)
		{
			case SessionService::SESSION_TOKEN_TYPE_ACCESS:
				setcookie(SessionService::SESSION_TOKEN_COOKIE_NAME_ACCESS, '', [
					'expires' => time() - 3600,
					'httponly' => true,
					'samesite' => 'Lax',
					'path' => '/'
				]);
				break;

			case SessionService::SESSION_TOKEN_TYPE_REMEMBER_ME:
				setcookie(SessionService::SESSION_TOKEN_COOKIE_NAME_REMEMBER_ME, '', [
					'expires' => time() - 3600,
					'httponly' => true,
					'samesite' => 'Lax',
					'path' => '/'
				]);
				break;
		}
	}

	protected function GetRouteName(Request $request): ?string
	{
		return RouteContext::fromRequest($request)->getRoute()?->getName();
	}

	protected function IsApiRoute(Request $request): bool
	{
		return string_starts_with(RouteContext::fromRequest($request)->getRoute()->getPattern(), '/api/');
	}

	/**
	 * @param array $postParams
	 * @return bool True/False if the provided credentials were valid
	 * @throws \Exception Throws an \Exception if an error happened during credentials processing or if this authentication middlware doesn't provide credentials processing (e.g. handles this externally)
	 */
	abstract public static function ProcessLogin(array $postParams);

	/**
	 * @param Request $request
	 * @return mixed|null the user row or null if the request is not authenticated
	 * @throws \Exception Throws an \Exception if authentaction config is invalid
	 */
	abstract protected function AuthenticateRequest(Request $request);
}
