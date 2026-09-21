<?php

namespace App\Providers;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    /** @var list<string> */
    protected array $modules = [
        'Authentication',
        'Users',
        'Members',
        'Offers',
        'Subscriptions',
        'Quotas',
        'Attendance',
        'Schedule',
        'Booking',
        'Payments',
        'GreenRewards',
        'Dashboard',
        'Notifications',
        'Reports',
        'HealthTracking',
    ];

    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        foreach ($this->modules as $module) {
            $this->loadModuleRoutes($module);
            $this->loadModuleMigrations($module);
        }
    }

    protected function loadModuleRoutes(string $module): void
    {
        $routesPath = app_path("Modules/{$module}/routes/api.php");

        if (! file_exists($routesPath)) {
            return;
        }

        Route::middleware('api')
            ->prefix('api/v1')
            ->group($routesPath);
    }

    protected function loadModuleMigrations(string $module): void
    {
        $migrationsPath = app_path("Modules/{$module}/Database/Migrations");

        if (is_dir($migrationsPath)) {
            $this->loadMigrationsFrom($migrationsPath);
        }
    }
}
