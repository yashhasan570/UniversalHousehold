Universal Household.UISound = {};

Universal Household.UISound.Play = function(url)
{
	new Audio(url).play();
}

Universal Household.UISound.AskForPermission = function()
{
	Universal Household.UISound.Play(U("/uisounds/silence.mp3"));
}

Universal Household.UISound.Success = function()
{
	Universal Household.UISound.Play(U("/uisounds/success.mp3"));
}

Universal Household.UISound.Error = function()
{
	Universal Household.UISound.Play(U("/uisounds/error.mp3"));
}

Universal Household.UISound.BarcodeScannerBeep = function()
{
	Universal Household.UISound.Play(U("/uisounds/barcodescannerbeep.mp3"));
}
