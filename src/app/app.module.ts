import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScriptsComponent } from './scripts/scripts.component';
import { FormsModule } from '@angular/forms';
import { MessagesComponent } from './messages/messages.component';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthenticationInterceptor } from './authentication-interceptor';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';
import { RobotsComponent } from './robots/robots.component';
import { ScriptDetailsComponent } from './script-details/script-details.component';
import { ScriptEditorComponent } from './script-editor/script-editor.component';
import { ScriptParametersComponent } from './script-parameters/script-parameters.component';
import { ScriptResourcesComponent } from './script-resources/script-resources.component';
import { ScriptResourceDetailsComponent } from './script-resource-details/script-resource-details.component';
import { ScriptParameterDetailsComponent } from './script-parameter-details/script-parameter-details.component';
import { AceEditorModule } from 'ng2-ace-editor';

@NgModule({
  declarations: [
    AppComponent,
    ScriptsComponent,
    MessagesComponent,
    LoginComponent,
    HeaderComponent,
    RobotsComponent,
    ScriptDetailsComponent,
    ScriptEditorComponent,
    ScriptParametersComponent,
    ScriptResourcesComponent,
    ScriptResourceDetailsComponent,
    ScriptParameterDetailsComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    ClarityModule,
    ClrFormsNextModule,
    BrowserAnimationsModule,
    FormsModule,
    AceEditorModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
