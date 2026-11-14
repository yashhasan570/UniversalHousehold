<?php

namespace Universal Household\Services;

use Universal Household\Services\UsersService;
use LessQL\Database;

class DatabaseService
{
	private static $DbConnection = null;
	private static $DbConnectionRaw = null;
	private static $instance = null;

	public function ExecuteDbQuery(string $sql)
	{
		$pdo = $this->GetDbConnectionRaw();

		if ($this->ExecuteDbStatement($sql) === true)
		{
			return $pdo->query($sql);
		}

		return false;
	}

	public function ExecuteDbStatement(string $sql, ?array $params = null)
	{
		$pdo = $this->GetDbConnectionRaw();

		if (UNIVERSALHOUSEHOLD_MODE === 'dev')
		{
			$logFilePath = UNIVERSALHOUSEHOLD_DATAPATH . '/sql.log';
			if (file_exists($logFilePath))
			{
				file_put_contents($logFilePath, $sql . PHP_EOL, FILE_APPEND);
			}
		}

		if ($params === null)
		{
			if ($pdo->exec($sql) === false)
			{
				throw new \Exception(implode(' | ', $pdo->errorInfo()));
			}
		}
		else
		{
			$cmd = $pdo->prepare($sql);

			if ($cmd === false)
			{
				throw new \Exception(implode(' | ', $pdo->errorInfo()));
			}

			if ($cmd->execute($params) === false)
			{
				throw new \Exception(implode(' | ', $cmd->errorInfo()));
			}
		}

		return true;
	}

	public function GetDbChangedTime()
	{
		return date('Y-m-d H:i:s', filemtime($this->GetDbFilePath()));
	}

	public function GetDbConnection()
	{
		if (self::$DbConnection == null)
		{
			self::$DbConnection = new Database($this->GetDbConnectionRaw());
		}

		if (UNIVERSALHOUSEHOLD_MODE === 'dev')
		{
			$logFilePath = UNIVERSALHOUSEHOLD_DATAPATH . '/sql.log';
			if (file_exists($logFilePath))
			{
				self::$DbConnection->setQueryCallback(function ($query, $params) use ($logFilePath)
				{
					file_put_contents($logFilePath, $query . ' #### ' . implode(';', $params) . PHP_EOL, FILE_APPEND);
				});
			}
		}

		return self::$DbConnection;
	}

	public function GetDbConnectionRaw()
	{
		if (self::$DbConnectionRaw == null)
		{
			$pdo = new \PDO\Sqlite('sqlite:' . $this->GetDbFilePath());
			$pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
			$pdo->setAttribute(\PDO::ATTR_ORACLE_NULLS, \PDO::NULL_EMPTY_STRING);

			$pdo->createFunction('regexp', function ($pattern, $value)
			{
				mb_regex_encoding('UTF-8');
				return (false !== mb_ereg($pattern, $value)) ? 1 : 0;
			});

			$pdo->createFunction('universalhousehold_user_setting', function ($value)
			{
				$usersService = new UsersService();
				return $usersService->GetUserSetting(UNIVERSALHOUSEHOLD_USER_ID, $value);
			});


			// Unfortunately not included by default
			// https://www.sqlite.org/lang_mathfunc.html#ceil
			$pdo->createFunction('ceil', function ($value)
			{
				return ceil($value);
			});

			self::$DbConnectionRaw = $pdo;
		}

		return self::$DbConnectionRaw;
	}

	public function SetDbChangedTime($dateTime)
	{
		touch($this->GetDbFilePath(), strtotime($dateTime));
	}

	public static function GetInstance()
	{
		if (self::$instance == null)
		{
			self::$instance = new self();
		}

		return self::$instance;
	}

	private function GetDbFilePath()
	{
		if (UNIVERSALHOUSEHOLD_MODE === 'demo' || UNIVERSALHOUSEHOLD_MODE === 'prerelease')
		{
			$dbSuffix = UNIVERSALHOUSEHOLD_DEFAULT_LOCALE;
			if (defined('UNIVERSALHOUSEHOLD_DEMO_DB_SUFFIX'))
			{
				$dbSuffix = UNIVERSALHOUSEHOLD_DEMO_DB_SUFFIX;
			}

			return UNIVERSALHOUSEHOLD_DATAPATH . '/universalhousehold_' . $dbSuffix . '.db';
		}

		return UNIVERSALHOUSEHOLD_DATAPATH . '/universalhousehold.db';
	}
}
