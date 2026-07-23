import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-side-panel',
  imports: [MatSidenavModule, MatIconModule, MatButtonModule],
  templateUrl: './side-panel.html',
  styleUrl: './side-panel.scss',
})
export class SidePanel {
  @Input() opened = false;
  @Input() title = '';

  @Output() openedChange = new EventEmitter<boolean>();

  close(): void {
    this.openedChange.emit(false);
  }

  onOpenedChange(opened: boolean): void {
    this.openedChange.emit(opened);
  }
}
