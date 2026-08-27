<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // nanti isi validasi sesuai kebutuhan
            // contoh:
            // 'name' => ['required','string','max:255'],
        ];
    }
}
