import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { TranslateStore } from '@ngx-translate/core';
import { SidebarEffects } from './sidebar.effects';
import * as sidebarActions from '../actions/sidebar.actions';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { StoreModule, Store } from '@ngrx/store';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { MenuItem } from '@progress/kendo-angular-menu';
import { SidebarApiService } from '@core/services/apis';
describe('ProcurementContractsEffects', () => {
  let actions$: Observable<any>;
  let effects: SidebarEffects;
  let configService: SidebarApiService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({}),
        TranslateTestingModule.withTranslations(
          'en',
          require('../../../../../../assets/i18n/en.json')
        ).withDefaultLanguage('en'),
      ],
      providers: [
        SidebarEffects,
        TranslateStore,
        provideMockActions(() => actions$),
        provideMockStore(),
        Store,
      ],
    });
    effects = TestBed.inject(SidebarEffects);
    configService = TestBed.inject(SidebarApiService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSidebar$', () => {
    it('should dispatch getSidebarSuccess action on success', () => {
      const sidebar: MenuItem[] = [];
      const action = sidebarActions.getSidebar();
      const completion = sidebarActions.getSidebarSucces({ sidebar: sidebar });

      jest.spyOn(configService, 'getSidebar').mockReturnValue(of(sidebar));

      actions$ = of(action);

      return effects.getSidebar$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(configService.getSidebar).toHaveBeenCalled();
      });
    });

    it('should dispatch getSidebarError action on error', () => {
      const error = new Error('Error fetching sidebar');
      const action = sidebarActions.getSidebar();
      const completion = sidebarActions.getSidebarError({ payload: error });

      jest
        .spyOn(configService, 'getSidebar')
        .mockReturnValue(throwError(error));

      actions$ = of(action);

      return effects.getSidebar$.toPromise().then((resultAction) => {
        expect(resultAction).toEqual(completion);
        expect(configService.getSidebar).toHaveBeenCalled();
      });
    });
  });
});
