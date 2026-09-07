import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModalContent } from '@core/models';

@Component({
  selector: 'fi-workflow-comments-modal',
  templateUrl: './workflow-comments-modal.component.html',
  styleUrls: [],
})
export class WorkflowCommentsModalComponent implements OnInit {
  constructor() {}
  @Input() content: ModalContent;
  text: string = '';
  public myForm: FormGroup = new FormGroup({
    editor: new FormControl(''),
  });

  ngOnInit(): void {}
}
