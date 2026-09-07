import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import { EffectsCollection, storeReducer } from '@core/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { environment } from '@fiduciary-interface/environments/environment';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { NotificationGlobalService } from './shared/services/notification-global.service';
import {
  HttpClientModule,
  HTTP_INTERCEPTORS,
  HttpClient,
} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { APP_BASE_HREF, DatePipe } from '@angular/common';
import {
  DirectivesModule,
  HeadersModule,
  KendoModule,
  LoaderModule,
} from './shared';
import { DialogModule } from '@progress/kendo-angular-dialog';

import { PermissionService } from '@core/services/app/permission/permission.service';
import { HasPermissionGuard } from '@core/guards/hasPermission.guard';
import { InitialQueriesModule } from './features/initial-queries/initial-queries.module';
import { CldrIntlService, IntlService } from '@progress/kendo-angular-intl';
import '@progress/kendo-angular-intl/locales/en/all';
import '@progress/kendo-angular-intl/locales/fr/all';
import '@progress/kendo-angular-intl/locales/es/all';
import '@progress/kendo-angular-intl/locales/pt/all';
import { MessageService } from '@progress/kendo-angular-l10n';
import { KendoKeysMessageService } from './shared/services/kendo-keys-message.service';
import { EncodeInterceptor } from '@core/Interceptors/encode-interceptor';
import { BussinessRulesFormService } from './features/forms/services/bussiness-rules/bussiness-rules.service';
import { SharingService } from '@core/services/app/scopes/sharing.service';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MsalModule } from './msal/msal.module';
import { ICON_SETTINGS } from '@progress/kendo-angular-icons';
import { WorkflowCommentsModalComponent } from './shared/components/workflow-comments-modal/workflow-comments-modal.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MAT_ICON_DEFAULT_OPTIONS } from '@angular/material/icon';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { CacheInterceptor } from '@core/Interceptors/cache.interceptor';
import { uiReducer } from './core/store/loader/loader.reducer';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoaderSpinnerComponent } from './shared/components/loader-spinner/loader-spinner.component';
import { DemoBackendInterceptor } from './demo/demo-backend.interceptor';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(
    http,
    './assets/i18n/',
    '.json?cb=' + Math.round(+new Date() / 1000)
  );
}

@NgModule({
  declarations: [
    AppComponent,
    WorkflowCommentsModalComponent,
    LoaderSpinnerComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LayoutModule,
    ButtonsModule,
    DirectivesModule,
    DialogModule,
    InputsModule,
    KendoModule,
    HeadersModule,
    MsalModule,
    StoreModule.forRoot(
      { ...storeReducer, ui: uiReducer },
      {
        runtimeChecks: {
          strictActionImmutability: true,
          strictStateImmutability: true,
        },
      }
    ),
    EffectsModule.forRoot(EffectsCollection),
    StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),
    !environment.production ? StoreDevtoolsModule.instrument() : [],
    NotificationModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    LoaderModule,
    InitialQueriesModule,
    MatProgressSpinnerModule,
  ],
  providers: [
    { provide: ICON_SETTINGS, useValue: { type: 'font' } },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: EncodeInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true,
    },
    // Last interceptor of the chain: in demo mode it answers every API call
    // locally, so the request never reaches the network. It is a no-op in
    // every other environment.
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DemoBackendInterceptor,
      multi: true,
    },
    DatePipe,
    HasPermissionGuard,
    { provide: 'windowObject', useValue: window },

    CldrIntlService,
    {
      provide: IntlService,
      useExisting: CldrIntlService,
    },
    {
      provide: LOCALE_ID,
      useValue: 'en-US',
    },
    {
      provide: APP_BASE_HREF,
      useValue: window.location.pathname,
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', floatLabel: 'always' },
    },

    NotificationGlobalService,
    PermissionService,
    BussinessRulesFormService,
    { provide: MessageService, useClass: KendoKeysMessageService },
    SharingService,
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' },
    },
    {
      provide: MAT_ICON_DEFAULT_OPTIONS,
      useValue: { fontSet: 'material-icons-outlined' },
    },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { autoFocus: false } },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor() {
    library.add(faFilm);
  }
}
