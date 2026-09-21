<?php

namespace App\Modules\GreenRewards\Models;

use Illuminate\Database\Eloquent\Model;

class EcoLevel extends Model
{
    protected $fillable = ['name', 'slug', 'min_points', 'rank', 'badge_icon'];

    protected function casts(): array
    {
        return [
            'min_points' => 'integer',
            'rank' => 'integer',
        ];
    }
}
