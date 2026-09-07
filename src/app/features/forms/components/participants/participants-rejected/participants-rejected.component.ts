import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ParticipantsResult } from '@core/enums/participants-result.enum';

@Component({
  selector: 'fi-participants-rejected',
  templateUrl: './participants-rejected.component.html',
})
export class ParticipantsRejectedComponent implements OnInit {
  @Input() number = 4;
  @Input() form: FormGroup;
  @Input() participantFormArray: FormArray;
  @Input() showParticipantsRejected: boolean;

  ParticipantsResult = ParticipantsResult;

  format = 'n2';
  decimals = 2;

  constructor() {}

  ngOnInit(): void {}
}
