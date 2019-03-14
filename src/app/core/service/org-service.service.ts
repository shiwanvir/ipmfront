import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AppConfig } from '../../core/app-config';

@Injectable({
  providedIn: 'root'
})
export class OrgService {

  constructor(private http:HttpClient) { }

  getCountries(){
    return this.http.get(AppConfig.apiServerUrl() + 'Mainlocation.load_country')
  }

}
