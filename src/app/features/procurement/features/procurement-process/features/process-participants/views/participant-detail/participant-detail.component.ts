import { Component } from '@angular/core';

@Component({
  selector: 'fi-participant-detail',
  templateUrl: './participant-detail.component.html'
})
export class ParticipantDetailComponent {

  constructor() { }

  public listItems: Array<string> = [
    'X-Small',
    'Small',
    'Medium',
    'Large',
    'X-Large',
    '2X-Large',
  ];
  public editing = false;

  toogleEditing():void{
    this.editing = !this.editing;
  }
}
