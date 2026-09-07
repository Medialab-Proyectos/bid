import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { ParticipantsResult } from '@core/enums/participants-result.enum';

@Component({
  selector: 'fi-participants-awarded',
  templateUrl: './participants-awarded.component.html',
})
export class ParticipantsAwardedComponent implements OnInit {
  @Input() number = 5;
  @Input() form: FormGroup;
  @Input() participantFormArray: FormArray;
  @Input() showParticipantsAwarded: boolean;

  ParticipantsResult = ParticipantsResult;

  format = 'n2';
  decimals = 2;

  constructor() {}

  ngOnInit(): void {}
}
