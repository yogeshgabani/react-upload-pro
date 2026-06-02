/**
 * Exponentially-weighted moving average for upload speed.
 * Half-life roughly 1 second, so old samples decay quickly.
 */
export class SpeedMeter {
  private bytes = 0;
  private lastTime = 0;
  private speed = 0;
  private readonly alpha: number;
  private readonly totalBytes: number;

  constructor(totalBytes: number, alpha = 0.3) {
    this.totalBytes = totalBytes;
    this.alpha = alpha;
  }

  update(currentBytes: number): { speed: number; eta: number } {
    const now = performance.now ? performance.now() : Date.now();
    if (this.lastTime === 0) {
      this.lastTime = now;
      this.bytes = currentBytes;
      return { speed: 0, eta: Infinity };
    }
    const dt = (now - this.lastTime) / 1000;
    if (dt <= 0) return { speed: this.speed, eta: this.eta() };
    const db = currentBytes - this.bytes;
    if (db < 0) {
      // Restarted; reset baseline.
      this.bytes = currentBytes;
      this.lastTime = now;
      return { speed: this.speed, eta: this.eta() };
    }
    const sample = db / dt;
    this.speed = this.speed === 0 ? sample : this.alpha * sample + (1 - this.alpha) * this.speed;
    this.bytes = currentBytes;
    this.lastTime = now;
    return { speed: this.speed, eta: this.eta() };
  }

  private eta(): number {
    if (this.speed <= 0) return Infinity;
    const remaining = this.totalBytes - this.bytes;
    if (remaining <= 0) return 0;
    return remaining / this.speed;
  }
}
