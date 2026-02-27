// src/utils/circuitBreaker.js
import { Logger } from "./logger.js";

export class CircuitBreaker {
  constructor(requestAction, name, options = {}) {
    this.requestAction = requestAction;
    this.name = name;
    this.state = 'CLOSED'; // CLOSED (sano), OPEN (fallando, no intentar), HALF_OPEN (probando)
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeout = options.resetTimeout || 10000; // 10s para reintentar
    this.failureCount = 0;
    this.lastFailureTime = null;
  }

  async fire(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        Logger.info(`Circuit ${this.name} entered HALF_OPEN state. Testing connection...`);
        this.state = 'HALF_OPEN';
      } else {
        throw new Error(`Circuit ${this.name} is OPEN. Request aborted to prevent system overload.`);
      }
    }

    try {
      const result = await this.requestAction(...args);
      this.reset();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  reset() {
    if (this.state !== 'CLOSED') {
      Logger.info(`Circuit ${this.name} CLOSED. Service restored to healthy state.`);
    }
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      Logger.warn(`Circuit ${this.name} OPENED. Too many failures detected.`);
    }
  }
}