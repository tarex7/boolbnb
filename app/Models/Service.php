<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    public function flats() {
        return $this->belongsToMany('App\Models\Flat');
    }
}
