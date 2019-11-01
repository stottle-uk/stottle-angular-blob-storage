import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-selected-container',
  template: `
    <div *ngIf="containerName">
      <h2>Container: {{ containerName }} Files</h2>

      <ng-content></ng-content>
    </div>
  `,
  styles: []
})
export class SelectedContainerComponent {
  @Input() containerName: string;
}
