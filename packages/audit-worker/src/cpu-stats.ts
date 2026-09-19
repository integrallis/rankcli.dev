// This machine's CPU over roughly the last minute, from /proc/stat. On Fly's shared CPUs, time
// the hypervisor withholds once the burst balance runs out shows up in the guest as steal, so
// a high stealPct means audits are CPU-starved rather than waiting on slow sites.

import { readFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';

interface Sample {
  at: number;
  busy: number;
  steal: number;
  total: number;
}

function read(): Sample | null {
  try {
    // "cpu  user nice system idle iowait irq softirq steal ..."
    const fields = readFileSync('/proc/stat', 'utf8').split('\n')[0].trim().split(/\s+/).slice(1).map(Number);
    const [user, nice, system, idle, iowait, irq, softirq, steal = 0] = fields;
    const busy = user + nice + system + irq + softirq;
    return { at: Date.now(), busy, steal, total: busy + idle + iowait + steal };
  } catch {
    return null; // not Linux
  }
}

const samples: Sample[] = [];
const first = read();
if (first) samples.push(first);
setInterval(() => {
  const sample = read();
  if (!sample) return;
  samples.push(sample);
  if (samples.length > 7) samples.shift();
}, 10_000).unref();

export function cpuStats() {
  const now = read();
  const from = samples[0];
  if (!now || !from || now.total === from.total) return null;
  const total = now.total - from.total;
  return {
    cores: availableParallelism(),
    windowSeconds: Math.round((now.at - from.at) / 1000),
    busyPct: Math.round((100 * (now.busy - from.busy)) / total),
    stealPct: Math.round((100 * (now.steal - from.steal)) / total),
  };
}
