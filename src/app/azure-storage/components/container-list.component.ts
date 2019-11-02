import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ContainerItem } from '@azure/storage-blob';

@Component({
  selector: 'app-container-list',
  template: `
    <h2>Containers</h2>

    <div *ngFor="let container of containers">
      {{ container.name }}
      <button (click)="onClick(container.name)">View</button>
    </div>
  `,
  styles: []
})
export class ContainerListComponent {
  @Input() containers: ContainerItem[];
  @Output() onContainerClick = new EventEmitter<string>();

  onClick(containerName: string): void {
    this.onContainerClick.emit(containerName);
  }
}
