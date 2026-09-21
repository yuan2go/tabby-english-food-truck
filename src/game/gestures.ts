/** No delayed single click: the first tap selects immediately. */
export class DoubleTap {
  private last: { id: string; at: number } | null = null;
  tap(id: string, at: number): boolean {
    const double = this.last?.id === id && at - this.last.at >= 40 && at - this.last.at <= 500;
    this.last = double ? null : { id, at };
    return double;
  }
  cancel(): void {
    this.last = null;
  }
}
