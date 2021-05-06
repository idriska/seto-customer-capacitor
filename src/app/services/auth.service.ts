import { Injectable } from "@angular/core";
import * as identity from "@spica-devkit/identity";
import * as Bucket from "@spica-devkit/bucket";
import { SpicaClient } from "./spica.facade";
import jwt_decode from "jwt-decode";
import { User } from "../interface/user";
import { from, Observable, of } from "rxjs";
import { map, switchMap, tap } from "rxjs/operators";
import { DataService } from "./data.service";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  activeUser: User;
  activeToken: string;

  private spicaClient = new SpicaClient(
    "https://test-4061d.hq.spicaengine.com/api"
  );
  constructor(private dataService: DataService, private http: HttpClient) {
    identity.initialize({
      publicUrl: this.spicaClient.apiUrl,
      apikey: `4tv318kl7tv2vq`,
    });
  }

  // login(identifier, password) {
  //   return from(identity.login(identifier, password)).pipe(
  //     tap(async (token) => {
  //       localStorage.setItem('spica_token', token);

  //       let date = new Date();
  //       date.setDate(date.getDate() + 2); // 2 days later
  //       localStorage.setItem('spica_expire', String(date));
  //       this.activeToken = token;
  //     }),
  //     switchMap(() => this.getUser())
  //   );
  // }

  register(user_data) {
    return this.http
      .post(`${this.spicaClient.apiUrl}/fn-execute/register`, {
        user_data,
      })
      .toPromise();
  }

  forgotPassword(identity_id: string) {
    return this.http
      .get(
        `${this.spicaClient.apiUrl}/fn-execute/forgot-password?identity_id=${identity_id}`
      )
      .toPromise();
  }

  sendForgotPasswordEmail(email: string) {
    return this.http
      .post(`${this.spicaClient.apiUrl}/fn-execute/sendMailForForgotPassword`, {
        email,
      })
      .toPromise();
  }

  changePassword(identity_id: string, password: string) {
    return this.http
      .post(`${this.spicaClient.apiUrl}/fn-execute/change-password`, {
        identity_id,
        password,
      })
      .toPromise();
  }

  changeEmail(identity_id: string, email: string) {
    return this.http
      .post(`${this.spicaClient.apiUrl}/fn-execute/change-email`, {
        identity_id,
        email,
      })
      .toPromise();
  }

  isUserLoggedIn(): boolean {
    return localStorage.getItem("spica_token") ? true : false;
  }

  getActiveToken(): any {
    return this.tokenDecode(localStorage.getItem("spica_token"));
  }

  private tokenDecode(token) {
    if (token) return jwt_decode(token);
    return false;
  }

  //Gets user info after taking token stored in local storage
  getUser(clean: boolean = false): Observable<User> {
    if (this.activeUser && !clean) return of(this.activeUser);
    return of(this.getActiveToken()).pipe(
      switchMap((token) =>
        token
          ? (this.dataService.resources.users.getAll({
              queryParams: { filter: { identity_id: token._id } },
            }) as Observable<User[]>)
          : of([null])
      ),
      map((users) => users[0]),
      tap((user) => (this.activeUser = user))
      // tap(console.log)
    );
  }

  checkCurrentPassword(identifier, password) {
    return identity.login(identifier, password);
  }

  isAuthenticated(): Observable<boolean> {
    let result: boolean = true;
    if (
      localStorage.getItem("spica_expire") &&
      new Date() > new Date(localStorage.getItem("spica_expire"))
    )
      result = false;
    return of(result);
  }

  // ************ NEW CUSTOM FUNCTIONS ***************
  checkUserExists(mobile_number: string, role: string) {
    return this.http
      .get(
        `${this.spicaClient.apiUrl}/fn-execute/check_user?mobile_number=${mobile_number}&role=${role}`
      )
      .toPromise();
  }

  login(mobile_number: string, token: string) {
    return this.http
      .post(`${this.spicaClient.apiUrl}/fn-execute/login`, {
        mobile_number: mobile_number,
        role: "customer",
        fb_token: token,
      })
      .toPromise();
  }
}
