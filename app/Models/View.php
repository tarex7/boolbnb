<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class View extends Model
{
    public function flat() {
        return $this->belongsTo('App\Models\Flat');
    }
}
