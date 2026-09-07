import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { DialogContentBase } from '@progress/kendo-angular-dialog';
import { createBidder, generateUBOForm } from './ubo.form';
import { UBOBiddersResponse } from '@core/models/responses/ubo-response.model';
import { BidderForm, UBOForm } from '@core/models/ubo.model';

@Component({
  selector: 'fi-ubo-modal',
  templateUrl: './ubo-modal.component.html',
  styleUrls: [],
})
export class UboModalComponent extends DialogContentBase implements OnInit {
  @Input() uboBidders: UBOBiddersResponse;

  UBOForm: FormGroup<UBOForm> = generateUBOForm();
  isJointVenture = false;
  ngOnInit(): void {
    this.isJointVenture = this.uboBidders?.bidders.length > 1;
    this.uboBidders?.bidders.forEach((b) => {
      this.bidders.push(createBidder(b.name, b.bidderId)); 
    });
  }

  get bidders(): FormArray<FormGroup<BidderForm>> {
    return this.UBOForm.controls.bidders;
  }
}
