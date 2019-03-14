import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor ,HttpResponse ,HttpErrorResponse,HttpClient,HttpSentEvent,HttpHeaderResponse,HttpProgressEvent,HttpUserEvent } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable,BehaviorSubject } from 'rxjs';
import { tap,delay,switchMap,catchError,finalize,filter,take } from 'rxjs/operators';
import { Router } from '@angular/router';

import { AppConfig } from '../app-config';
import { AppAlert } from '../class/app-alert';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  readonly apiUrl = AppConfig.apiUrl()

  isRefreshingToken: boolean = false;
  tokenSubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  constructor(public auth: AuthService , private router:Router,private http:HttpClient) {}


  addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
        return req.clone({ setHeaders: { Authorization: 'Bearer ' + token }})
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
        //console.log(this.auth.getTokenExpirationDate())
        return next.handle(this.addToken(request, this.auth.getToken()))
        .pipe(tap(
          (event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
          }
        } ,
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401 && !request.url.includes('auth/login')) {
                return this.handle401Error(request, next);
            /*  if(confirm('Your session was expired or provide invalid token. Do you need to login?')){
                this.auth.deleteToken();
                this.router.navigate(['/login']);
              }
            }*/
          }
        }
      }
        ))
}


//  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {



    /*request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.auth.getToken()}`
      }
    });
    return next.handle(request)
    .pipe(tap(
      (event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        //console.log(event)
        // do stuff with response if you want
      }
    } ,
    (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401 && !request.url.includes('auth/login')) {
            return this.handle401Error(request,next)
          if(confirm('Your session was expired or provide invalid token. Do you need to login?')){
            this.auth.deleteToken();
            this.router.navigate(['/login']);
          }
        }
      }
    }
    ));
*/

  //}






    handle401Error(req: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshingToken) {
            this.isRefreshingToken = true;

            // Reset here so that the following requests wait until the token
            // comes back from the refreshToken call.
            this.tokenSubject.next(null);

            this.http.post(this.apiUrl + 'auth/refresh',{})
            .pipe(
              switchMap((newToken: string) => {
                  if (newToken) {
                    console.log(newToken)
                    this.auth.storeUserData(newToken['user'])
                    this.auth.storeToken(newToken['access_token'])
                      this.tokenSubject.next(newToken);
                      this.isRefreshingToken = false;
                      return next.handle(this.addToken(this.getNewRequest(req), newToken));

                  }

                  // If we don't get a new token, we are in trouble so logout.
                  return this.logoutUser();
              })
            ).subscribe(data => {})



        } else {
            return this.tokenSubject
            .pipe(filter(token => token != null),
            take(1),
            switchMap(token => {
                return next.handle(this.addToken(this.getNewRequest(req), token));
            }))

        }
    }




    getNewRequest(req: HttpRequest<any>): HttpRequest<any> {
            if (req.url.indexOf('getData') > 0) {
                return new HttpRequest('GET', 'http://private-4002d-testerrorresponses.apiary-mock.com/getData');
            }

            return new HttpRequest('GET', 'http://private-4002d-testerrorresponses.apiary-mock.com/getLookup');
        }

        logoutUser() {
            // Route to the login page (implementation up to you)

            return Observable.throw("");
        }





/*  async refershToken(){

    if(!this.isRefreshing){
      this.isRefreshing = true
      AppAlert.showMessage('Authenticating!','Please wait authenticating....')
      await this.http.post(this.apiUrl + 'auth/refresh',{})
      .pipe(tap(data => {
        console.log(data)

      }))
      .toPromise()
      .then(data => {
        this.auth.storeUserData(data['user'])
        this.auth.storeToken(data['access_token'])
        this.isRefreshing = false
          setTimeout(() => {
            AppAlert.closeAlert()
          },4000)
      } );
    }

  }*/

}
