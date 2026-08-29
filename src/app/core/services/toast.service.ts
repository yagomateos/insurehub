import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  variant: ToastVariant;
  title: string;
  description?: string;
}

let nextId = 1;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  show(variant: ToastVariant, title: string, description?: string, durationMs = 4500): void {
    const toast: Toast = { id: nextId++, variant, title, description };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), durationMs);
  }

  success(title: string, description?: string): void {
    this.show('success', title, description);
  }

  error(title: string, description?: string): void {
    this.show('error', title, description);
  }

  info(title: string, description?: string): void {
    this.show('info', title, description);
  }

  warning(title: string, description?: string): void {
    this.show('warning', title, description);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
