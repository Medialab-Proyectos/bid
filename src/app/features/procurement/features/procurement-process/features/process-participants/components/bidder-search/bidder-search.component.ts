import { Component, Input, Output, EventEmitter } from '@angular/core';

import {
  ComboBoxComponent,
  DropDownFilterSettings,
} from '@progress/kendo-angular-dropdowns';

import { Bidder, MasterDataCountry } from '@core/models';
import { BidderApiService } from '@core/services/apis';

import { PermissionEnum } from '@core/enums';

@Component({
  selector: 'fi-bidder-search',
  templateUrl: './bidder-search.component.html',
})
export class BidderSearchComponent {
  @Input() searchPermission: PermissionEnum[] = [PermissionEnum.SPECIAL];
  @Output() bidder: EventEmitter<Bidder> = new EventEmitter();
  @Output() newBidder: EventEmitter<any> = new EventEmitter();
  @Input() id: number;
  @Input() allUnfilterCountries: MasterDataCountry[];
  public searchText = 0;
  isloading: boolean;
  public bidderSuggestionList: Array<Bidder> = [];
  public filterSettings: DropDownFilterSettings = {
    caseSensitive: false,
    operator: 'startsWith',
  };

  constructor(readonly bidderApi: BidderApiService) {}

  filterChangeSearchBidder(filter: string): void {
    this.searchText = filter.length;
    if (filter.length >= 3) {
      this.isloading = true;
      this.bidderApi
        .searchFirmOrSmeByName(filter)
        .subscribe((bidders) => {
          let filteredBidder: Bidder[] = [];
          filteredBidder = bidders.biddingProcessBidders;
          filteredBidder.forEach((v) => {
            const nationality = this.allUnfilterCountries.find(
              (c) => c.id === v.nationality
            )?.name;

            v.searchName = v.name ? `${v.name} / ${nationality}` : '';
          });
          this.bidderSuggestionList = filteredBidder;
        })
        .add(() => (this.isloading = false));
    }
  }

  selectionChange(selection: Bidder): void {
    if (selection) {
      this.bidderApi
        .searchBidderLocationsById(selection.id)
        .subscribe((data) => {
          if (data?.locations.length > 0) {
            selection.address = data.locations[0].address;
            selection.zipCode = data.locations[0].zipCode;
            selection.country = data.locations[0].country;
          }
          this.bidder.emit(selection);
        });
    } else {
      this.bidder.emit(selection);
    }
  }

  onNewBidder(combobox: ComboBoxComponent): void {
    combobox.reset();
    combobox.blur();
    this.newBidder.emit();
  }

  blur(): void {
    this.isloading = true;
    this.searchText = 0;
  }
}
