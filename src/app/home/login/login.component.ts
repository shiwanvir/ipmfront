import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder , FormGroup , Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { AuthService } from '../../core/service/auth.service';
import { AppConfig } from '../../core/app-config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginFormGroup : FormGroup
  loginError : string = ''
  loginStatus : number = 0
  serverUrl = AppConfig.apiServerUrl()

  constructor(private router:Router , private fb:FormBuilder , private http:HttpClient,
    private authService : AuthService) {
  }

  ngOnInit() {

    this.loginFormGroup = this.fb.group({
      'user_name' : [null , [Validators.required]],
      'password' : [null , [Validators.required]]
    })

    /*this.loginFormGroup.valueChanges.subscribe(data => { //validate form when form value changes
      this.appValidator.validate();
    })*/

  }


  login(){
    //this.router.navigate(['/home']);
    console.log(this.loginFormGroup.value);
    this.http.post(this.serverUrl + 'api/auth/login' , this.loginFormGroup.value)
    .subscribe(
      data => {
        this.authService.storeUserData(data['user'])
        this.authService.storeToken(data['access_token'])
        this.router.navigate(['/home/dashboard']);
      },
      error => {
        console.log(error)
        this.loginError = error.error.message
        this.loginStatus = 401
      }
    )
  }

}
