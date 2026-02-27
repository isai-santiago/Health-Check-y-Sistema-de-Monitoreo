import os from "os";
import fs from "fs/promises";

export class SystemInfo {
  static getBasicInfo() {
    return { hostname: os.hostname(), platform: os.platform(), architecture: os.arch(), nodeVersion: process.version, processId: process.pid, uptime: process.uptime(), totalMemory: os.totalmem(), freeMemory: os.freemem() };
  }
  static getTotalMemory() { return os.totalmem(); }
  static getMemoryUsage() {
    const total = os.totalmem(), free = os.freemem(), used = total - free;
    return { total, free, used, usedPercent: (used / total) * 100 };
  }
  static getCpuInfo() {
    const cpus = os.cpus();
    return { count: cpus.length, model: cpus[0]?.model || "Unknown", speed: cpus[0]?.speed || 0 };
  }
  static async getDiskInfo() {
    try {
      await fs.stat(process.cwd());
      return { total: 100 * 1024 * 1024 * 1024, free: 50 * 1024 * 1024 * 1024 }; // Mock simplificado
    } catch (error) { return { total: 0, free: 0, error: error.message }; }
  }
  static async getSystemInfo() {
    const memory = this.getMemoryUsage();
    const disk = await this.getDiskInfo();
    return {
      ...this.getBasicInfo(),
      memory: { total: `${Math.round(memory.total / 1073741824)}GB`, free: `${Math.round(memory.free / 1073741824)}GB`, usedPercent: `${memory.usedPercent.toFixed(2)}%` },
      cpu: this.getCpuInfo(),
      disk: { total: `${Math.round(disk.total / 1073741824)}GB`, free: `${Math.round(disk.free / 1073741824)}GB` }
    };
  }
}