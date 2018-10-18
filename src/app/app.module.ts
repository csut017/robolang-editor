import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ClarityModule, ClrFormsNextModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ScriptsComponent } from './scripts/scripts.component';
import { FormsModule } from '@angular/forms';
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
import { ScriptVersionsComponent } from './script-versions/script-versions.component';
import { ScriptVersionDetailsComponent } from './script-version-details/script-version-details.component';
import { RobotInterfaceComponent } from './robot-interface/robot-interface.component';
import { RobotSchedulesComponent } from './robot-schedules/robot-schedules.component';
import { RobotWaitStateComponent } from './robot-wait-state/robot-wait-state.component';
import { RobotDebugComponent } from './robot-debug/robot-debug.component';
import { RobotScriptsComponent } from './robot-scripts/robot-scripts.component';

@NgModule({
  declarations: [
    AppComponent,
    ScriptsComponent,
    LoginComponent,
    HeaderComponent,
    RobotsComponent,
    ScriptDetailsComponent,
    ScriptEditorComponent,
    ScriptParametersComponent,
    ScriptResourcesComponent,
    ScriptResourceDetailsComponent,
    ScriptParameterDetailsComponent,
    ScriptVersionsComponent,
    ScriptVersionDetailsComponent,
    RobotInterfaceComponent,
    RobotSchedulesComponent,
    RobotWaitStateComponent,
    RobotDebugComponent,
    RobotScriptsComponent
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
