/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import { ipcRenderer } from "electron";
import { AuthFlow, AuthStateEmitter, AuthTenantInfo } from "./flow";
import { log } from "./logger";

const SIGN_IN = "Sign-In";
const SIGN_OUT = "Sign-Out";

interface SnackBarOptions {
  message: string;
  timeout?: number;
  actionHandler?: (event: any) => void;
  actionText?: string;
}

interface UserInfo {
  FullName: string;
  Associate: string;
  EMailAddress: string;
  AssociateId: number;
  PersonId: number;
  ContactId: number;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

export class App {
  private authFlow: AuthFlow = new AuthFlow();
  private userInfo: UserInfo | null = null;

  private handleSignIn = document.querySelector(
    "#handle-sign-in"
  ) as HTMLElement;

  private fetchUserInfo = document.querySelector(
    "#handle-user-info"
  ) as HTMLElement;

  private userCard = document.querySelector("#user-info") as HTMLElement;

  private userProfileImage = document.querySelector(
    "#user-profile-image"
  ) as HTMLImageElement;

  private userName = document.querySelector("#user-name") as HTMLElement;

  private snackbarContainer: any = document.querySelector(
    "#appauth-snackbar"
  ) as HTMLElement;

  constructor() {
    this.initializeUi();
    this.handleSignIn.addEventListener("click", event => {
      if (this.handleSignIn.textContent === SIGN_IN) {
        this.signIn();
      } else if (this.handleSignIn.textContent === SIGN_OUT) {
        this.signOut();
      }
      event.preventDefault();
    });

    this.fetchUserInfo.addEventListener("click", () => {
      this.authFlow
        .performWithFreshTokens()
        .then(authTenantInfo => {
          const webApi = this.getWebApiUrl(authTenantInfo);

          let request = new Request(`${webApi}v1/User/currentPrincipal`, {
            headers: new Headers({
              Authorization: `Bearer ${authTenantInfo.accessToken}`,
              Accept: "application/json; charset=utf-8"
            }),
            method: "GET",
            cache: "no-cache"
          });

          fetch(request)
            .then(result => result.json())
            .then(user => {
              log("User Info ", user);
              this.userInfo = user;
              this.updateUi();
              // get user/person image...
              let imgRequest = new Request(
                `${webApi}v1/Person/${user.PersonId}/Image?ifBlank=ClearPixel`,
                {
                  headers: new Headers({
                    Authorization: `Bearer ${authTenantInfo.accessToken}`,
                    Accept: "image/png, image/jpeg, image/gif"
                  }),
                  method: "GET",
                  cache: "no-cache"
                }
              );
              log("Fetching user image...");
              fetch(imgRequest)
                .then(resp => {
                  resp.arrayBuffer().then(buffer => {
                    const prefix =
                      "data:" + resp.headers.get("content-type") + ";base64,";
                    let binary = "";
                    var bytes: Array<number> = [].slice.call(
                      new Uint8Array(buffer)
                    );
                    bytes.forEach(b => (binary += String.fromCharCode(b)));
                    const image = window.btoa(binary);
                    this.userInfo!.picture = prefix + image;
                    this.updateImgUi();
                  });
                })
                .catch(err => log("Error getting image: ", err));
            });
        })
        .catch(error => {
          log("Something bad happened ", error);
        });
    });

    this.authFlow.authStateEmitter.on(
      AuthStateEmitter.ON_TOKEN_RESPONSE,
      () => {
        this.updateUi();
        //  request app focus
        ipcRenderer.send("app-focus");
      }
    );
  }

  signIn(username?: string): Promise<void> {
    console.log("Signing in...");
    if (!this.authFlow.loggedIn()) {
      return this.authFlow
        .fetchServiceConfiguration()
        .then(() => this.authFlow.makeAuthorizationRequest(username));
    } else {
      return Promise.resolve();
    }
  }

  getWebApiUrl(authTenantInfo: AuthTenantInfo): string {
    if (authTenantInfo.claims == undefined) {
      log("Claims are empty!");
      return "";
    }

    log("Claims: ", authTenantInfo.claims);

    return authTenantInfo.claims[
      "http://schemes.superoffice.net/identity/webapi_url"
    ];
  }

  private initializeUi() {
    this.handleSignIn.textContent = SIGN_IN;
    this.fetchUserInfo.style.display = "none";
    this.userCard.style.display = "none";
  }

  // update ui post logging in.
  private updateUi() {
    this.handleSignIn.textContent = SIGN_OUT;
    this.fetchUserInfo.style.display = "";
    if (this.userInfo) {
      this.userName.textContent = this.userInfo.FullName;
      this.showSnackBar({
        message: `Welcome ${this.userInfo.FullName}`,
        timeout: 4000
      });
      this.userCard.style.display = "";
    }
  }

  private updateImgUi() {
    if (this.userInfo && this.userInfo.picture) {
      this.userProfileImage.src = `${this.userInfo.picture}`;
    }
  }

  private showSnackBar(data: SnackBarOptions) {
    this.snackbarContainer.MaterialSnackbar.showSnackbar(data);
  }

  signOut() {
    this.authFlow.signOut();
    this.userInfo = null;
    this.initializeUi();
  }
}

log("Init complete");
const app = new App();
