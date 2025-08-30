import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';

if (!existsSync('reports')) mkdirSync('reports', { recursive: true });
const run = JSON.parse(readFileSync('reports/run.json', 'utf-8'));

// simple numeric series for example metrics
const series = [1, 2, 3, 4, 5];
const alpha = 0.3;
let ewma = series[0];
for (let i = 1; i < series.length; i++) {
  ewma = alpha * series[i] + (1 - alpha) * ewma;
}
const cusum = series.reduce((acc, v) => acc + v, 0);

const metrics = {
  seed: run.seed,
  ewma,
  cusum,
  crossValidation: run.seed ? true : false
};

writeFileSync('reports/metrics.json', JSON.stringify(metrics, null, 2) + '\n');
