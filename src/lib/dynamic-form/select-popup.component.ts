import {Component, Output, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {InputOptionComponent} from './input-option.component';

@Component({
  selector: 'app-form-select-popup',
  template: `
    <div class="dt-group" [ngClass]="{'dt-has-error':hasError()}">
      <label [attr.for]="dynElement.name">{{dynElement.title}}</label>
      <i class="icon-collapsing" *ngIf="loading"></i>
      <app-modal-select [(value)]="model"
                    [options]="getOptions()"
                    [disabled]="disabled"
                    [modalTitle]="dynElement.title"
                    (valueChange)="onValueChange()"
                    (nameChanged)="nameChanged.emit($event)">
      </app-modal-select>
      <div class="dt-help-block">
        <span *ngFor="let err of errors">{{err}}<br></span>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPopupComponent extends InputOptionComponent {

  @Output() nameChanged: EventEmitter<any> = new EventEmitter();

}
