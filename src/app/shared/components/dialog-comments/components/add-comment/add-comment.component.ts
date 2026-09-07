import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
@Component({
  selector: 'fi-add-comment',
  templateUrl: './add-comment.component.html',
})
export class AddCommentComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
  @Input() formGroup: UntypedFormGroup;
  @Input() displayVisibility = true;
}
