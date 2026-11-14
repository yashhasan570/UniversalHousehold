<?php

namespace Universal Household\Helpers;

class EInvalidConfig extends \Exception
{
	public function __construct(string $message)
	{
		$message .= '<br><br>----------<br>Check your "config.php" file (which is in your data directory: "' . realpath(UNIVERSALHOUSEHOLD_DATAPATH) . '").<br>Defaults can be found in "config-dist.php" (which is in your main Universal Household directory: "' . realpath(__DIR__ . '/../') . '").';

		parent::__construct($message);
	}
}

class ConfigurationValidator
{
	public function validateConfig()
	{
		self::CheckMode();
		self::CheckDefaultLocale();
		self::CheckCurrencyFormat();
		self::CheckFirstDayOfWeek();
		self::CheckEntryPage();
		self::CheckMealplanFirstDayOfWeek();
		self::CheckAutoNightModeRange();
		self::CheckAuthClass();
	}

	private function CheckMode()
	{
		$allowedModes = ['production', 'dev', 'demo', 'prerelease'];
		if (!in_array(UNIVERSALHOUSEHOLD_MODE, $allowedModes))
		{
			throw new EInvalidConfig('Invalid mode "' . UNIVERSALHOUSEHOLD_MODE . '" set, only ' . implode(', ', $allowedModes) . ' allowed');
		}
	}

	private function CheckDefaultLocale()
	{
		if (!file_exists(__DIR__ . '/../localization/' . UNIVERSALHOUSEHOLD_DEFAULT_LOCALE))
		{
			throw new EInvalidConfig('Invalid locale "' . UNIVERSALHOUSEHOLD_DEFAULT_LOCALE . '" set, locale needs to exist in folder localization');
		}
	}

	private function CheckFirstDayOfWeek()
	{
		if (!(UNIVERSALHOUSEHOLD_CALENDAR_FIRST_DAY_OF_WEEK == '' ||
			(is_numeric(UNIVERSALHOUSEHOLD_CALENDAR_FIRST_DAY_OF_WEEK) && UNIVERSALHOUSEHOLD_CALENDAR_FIRST_DAY_OF_WEEK >= 0 && UNIVERSALHOUSEHOLD_CALENDAR_FIRST_DAY_OF_WEEK <= 6)))
		{
			throw new EInvalidConfig('Invalid value for CALENDAR_FIRST_DAY_OF_WEEK');
		}
	}

	private function CheckCurrencyFormat()
	{
		if (!(preg_match('/^([A-z]){3}$/', UNIVERSALHOUSEHOLD_CURRENCY)))
		{
			throw new EInvalidConfig('CURRENCY is not in ISO 4217 format (three letter code)');
		}
	}

	private function CheckEntryPage()
	{
		$allowedPages = ['stock', 'shoppinglist', 'recipes', 'chores', 'tasks', 'batteries', 'equipment', 'calendar', 'mealplan'];
		if (!in_array(UNIVERSALHOUSEHOLD_ENTRY_PAGE, $allowedPages))
		{
			throw new EInvalidConfig('Invalid entry page "' . UNIVERSALHOUSEHOLD_ENTRY_PAGE . '" set, only ' . implode(', ', $allowedPages) . ' allowed');
		}
	}

	private function CheckMealplanFirstDayOfWeek()
	{
		if (!(UNIVERSALHOUSEHOLD_MEAL_PLAN_FIRST_DAY_OF_WEEK == '' ||
			(is_numeric(UNIVERSALHOUSEHOLD_MEAL_PLAN_FIRST_DAY_OF_WEEK) && UNIVERSALHOUSEHOLD_MEAL_PLAN_FIRST_DAY_OF_WEEK >= -1 && UNIVERSALHOUSEHOLD_MEAL_PLAN_FIRST_DAY_OF_WEEK <= 6)))
		{
			throw new EInvalidConfig('Invalid value for MEAL_PLAN_FIRST_DAY_OF_WEEK');
		}
	}

	private function CheckAutoNightModeRange()
	{
		global $UNIVERSALHOUSEHOLD_DEFAULT_USER_SETTINGS;
		if (!(preg_match('/^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/', $UNIVERSALHOUSEHOLD_DEFAULT_USER_SETTINGS['auto_night_mode_time_range_from'])))
		{
			throw new EInvalidConfig('auto_night_mode_time_range_from is not in HH:mm format (' . $UNIVERSALHOUSEHOLD_DEFAULT_USER_SETTINGS['auto_night_mode_time_range_from'] . ')');
		}
		if (!(preg_match('/^(?:2[0-3]|[01][0-9]):[0-5][0-9]$/', $UNIVERSALHOUSEHOLD_DEFAULT_USER_SETTINGS['auto_night_mode_time_range_to'])))
		{
			throw new EInvalidConfig('auto_night_mode_time_range_to is not in HH:mm format (' . $UNIVERSALHOUSEHOLD_DEFAULT_USER_SETTINGS['auto_night_mode_time_range_to'] . ')');
		}
	}

	private function CheckAuthClass()
	{
		if (!class_exists(UNIVERSALHOUSEHOLD_AUTH_CLASS))
		{
			throw new EInvalidConfig('Configured AUTH_CLASS "' . UNIVERSALHOUSEHOLD_AUTH_CLASS . '" does not exist');
		}
	}
}
