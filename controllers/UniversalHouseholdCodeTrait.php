<?php

namespace Universal Household\Controllers;

use Universal Household\Helpers\UniversalHouseholdCode;
use jucksearm\barcode\lib\BarcodeFactory;
use jucksearm\barcode\lib\DatamatrixFactory;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

trait UniversalHouseholdCodeTrait
{
	public function ServeUniversalHouseholdCodeImage(Request $request, Response $response, UniversalHouseholdCode $householdcode)
	{
		$size = $request->getQueryParam('size', null);

		if (UNIVERSALHOUSEHOLD_UNIVERSALHOUSEHOLDCODE_TYPE == '2D')
		{
			$png = (new DatamatrixFactory())->setCode((string)$householdcode)->setSize($size)->getDatamatrixPngData();
		}
		else
		{
			$png = (new BarcodeFactory())->setType('C128')->setCode((string)$householdcode)->setHeight($size)->getBarcodePngData();
		}

		$isDownload = $request->getQueryParam('download', false);
		if ($isDownload)
		{
			$response = $response->withHeader('Content-Type', 'application/octet-stream')
				->withHeader('Content-Disposition', 'attachment; filename=UniversalHouseholdCode.png')
				->withHeader('Content-Length', strlen($png))
				->withHeader('Cache-Control', 'no-cache')
				->withHeader('Last-Modified', gmdate('D, d M Y H:i:s') . ' GMT');
		}
		else
		{
			$response = $response->withHeader('Content-Type', 'image/png')
				->withHeader('Content-Length', strlen($png))
				->withHeader('Cache-Control', 'no-cache')
				->withHeader('Last-Modified', gmdate('D, d M Y H:i:s') . ' GMT');
		}
		$response->getBody()->write($png);
		return $response;
	}
}
