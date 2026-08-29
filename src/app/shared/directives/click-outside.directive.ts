import { Directive, ElementRef, output } from '@angular/core';
import { HostListener } from '@angular/core';

@Directive({
  selector: '[uiClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  readonly uiClickOutside = output<void>();

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.uiClickOutside.emit();
    }
  }
}
