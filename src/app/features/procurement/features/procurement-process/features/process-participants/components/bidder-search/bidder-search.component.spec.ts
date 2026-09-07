import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { render } from '@testing-library/angular';
import { BidderSearchComponent } from './bidder-search.component';
import { TranslateTestingModule } from 'ngx-translate-testing';
import { of } from 'rxjs';
import { BiddingProcessBidderLocationResponse } from '@core/models';
import { ComboBoxModule } from '@progress/kendo-angular-dropdowns';

describe('BidderSearchComponent', () => {
  describe('When i search a bidder', () => {
    describe('When the search criteria is not longer than 2 characters - CPO', () => {
      it('should show not update the suggested list', async () => {
        const { component } = await setup();
        component.filterChangeSearchBidder('');
        expect(component.bidderSuggestionList).toEqual([]);
      });
    });

    describe('When there is no match', () => {
      it('should return an empty arrray', async () => {
        const { component } = await setup();
        jest
          .spyOn(component.bidderApi, 'searchFirmOrSmeByName')
          .mockReturnValue(of({ biddingProcessBidders: [] }));
        component.filterChangeSearchBidder('sss');
        expect(component.bidderSuggestionList).toEqual([]);
      });
    });
  });

  describe('When i left the search box', () => {
    it('should reset isLoading and searchText', async () => {
      const { component } = await setup();

      component.blur();

      expect(component.isloading).toBe(true);
      expect(component.searchText).toBe(0);
    });
  });

  describe('selectionChange', () => {
    it('should emit bidder', async () => {
      const { component } = await setup();

      const eventSpy = jest
        .spyOn(component.bidderApi, 'searchBidderLocationsById')
        .mockReturnValue(of(locationResponse));
      component.selectionChange(mockBidder);

      expect(eventSpy).toHaveBeenCalled();
    });
  });
});

async function setup() {
  const { fixture } = await render(BidderSearchComponent, {
    declarations: [],
    imports: [
      ComboBoxModule,
      HttpClientTestingModule,
      TranslateTestingModule.withTranslations('en', {}).withDefaultLanguage(
        'en'
      ),
    ],
    schemas: [],
    providers: [],
  });
  const component = fixture.componentInstance;
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, component, httpMock };
}

const mockBidder = {
  name: 'string',
  type: 0,
  nationality: 0,
  legalRepresentative: 'string',
  economicSector: 0,
  beneficiaryOwner: 'string',
  address: 'string',
  zipCode: 'string',
  country: 'string',
};

const locationResponse: BiddingProcessBidderLocationResponse = {
  locations: [
    {
      address: 'string',
      zipCode: 'string',
      country: 'string',
      id: 'string',
    },
  ],
};
