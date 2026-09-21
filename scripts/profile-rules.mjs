import { writeFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  optimizeDeps: { noDiscovery: true, entries: [] },
});
try {
  const { createGame, dispatch, advance } = await server.ssrLoadModule('/src/rules/game.ts');
  const { configureSession } = await server.ssrLoadModule('/src/rules/sessions.ts');
  let state = configureSession(createGame('profile'), 'endless', 0, 'pictures', ['juice'], 22, 2, [
    'apple',
  ]);
  let serial = 0;
  const send = (command) => {
    state = dispatch(state, { id: `profile-${serial++}`, runId: state.runId, command }).state;
  };
  send({ type: 'move', source: { supply: 'apple' }, destination: { tray: 0 } });
  const request = state.orders[0];
  // Build a real delivery by preparing exactly the accepted menu through commands.
  if (request.request === 'apple') send({ type: 'deliver', tray: 0, order: request.id });
  else send({ type: 'helper', request: 'apple', tray: 1 });
  const operations = {
    actorClone: () => structuredClone(state.actor),
    advance: () => advance(state, 16),
  };
  const output = {
    environment: `node ${process.version} ${process.platform}/${process.arch}`,
    actorPhases: state.actor.current?.plan.phases.length ?? 0,
    iterations: 10000,
    measurements: {},
  };
  for (const [name, run] of Object.entries(operations)) {
    for (let n = 0; n < 1000; n++) run();
    const samples = [];
    for (let batch = 0; batch < 10; batch++) {
      const start = performance.now();
      for (let n = 0; n < 1000; n++) run();
      samples.push((performance.now() - start) / 1000);
    }
    output.measurements[name] = {
      meanMs: samples.reduce((a, b) => a + b, 0) / samples.length,
      maxBatchMeanMs: Math.max(...samples),
    };
  }
  await writeFile(
    `docs/evidence/m21/rule-cost-${process.argv[2] || 'before'}.json`,
    JSON.stringify(output, null, 2),
  );
  console.log(JSON.stringify(output));
} finally {
  await server.close();
}
