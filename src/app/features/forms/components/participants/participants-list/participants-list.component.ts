import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ParticipantsResult } from '@core/enums/participants-result.enum';

@Component({
  selector: 'fi-participants-list',
  templateUrl: './participants-list.component.html',
})
export class ParticipantsListComponent implements OnInit {
  @Input() number = 3;
  @Input() form: FormGroup;
  @Input() participantFormArray: FormArray;
  @Input() showParticipantsList: boolean;

  ParticipantsResult = ParticipantsResult;

  format = 'n2';
  decimals = 2;

  constructor() {}

  ngOnInit(): void {}
}
