# Universal Household

Web-based self-hosted groceries and household management solution: track food stock, chores, tasks, batteries, equipment, recipes with ingredient/price calculation, meal plan, shopping list, barcodes, and more.

## Features

- Stock management (purchases, consumption, transfers, inventory, stock entries with best-before tracking, price tracking)
- Shopping list
- Recipes with ingredient and price handling, meal planning
- Chores management (scheduling, assignments)
- Tasks, batteries, equipment, calendar, meal plan
- Barcode support including label printing
- User permissions, REST API

## Install

- Unpack the latest release
- Copy `config-dist.php` to `data/config.php` and edit to your needs
- Make sure the `data` directory is writable by PHP
- Create the database schema: open the `universalhousehold.openapi.json` documented REST API endpoint `/system/setup-schema` once (or import `data/universalhousehold.db`)
- Optionally run `yarn install` + `yarn build` for frontend assets if you install from source

See `config-dist.php` for every available setting (authentication, currencies, features, label printing, and more). Feature flags allow disabling entire feature areas.

## Contact

Telegram: [@johnconstantine570](https://t.me/johnconstantine570)
