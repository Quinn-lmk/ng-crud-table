import {Component, Input, Output, OnInit, EventEmitter, ChangeDetectionStrategy} from '@angular/core';
import {DynamicFormElement} from './dynamic-form-element';

@Component({
  selector: 'app-form-input',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent implements OnInit {

  @Input() dynElement: DynamicFormElement;
  @Input() disabled: boolean;
  @Output() valueChange: EventEmitter<any> = new EventEmitter();
  @Output() valid: EventEmitter<boolean> = new EventEmitter();

  @Input('value')
  set model(value) {
    if (this._model !== value) {
      this._model = value;
      this.valueChange.emit(this._model);
      this.validate();
    }
  }

  get model() {
    return this._model;
  }

  errors: any[] = [];
  loading: boolean;
  private _model: any;

  constructor() {
  }

  ngOnInit() {
    this.validate();
  }

  validate() {
    this.errors = this.dynElement.validate(this.model);
  }

  hasError() {
    const hasError = (this.errors && this.errors.length > 0);
    this.valid.emit(!hasError);
    return hasError;
  }

}
