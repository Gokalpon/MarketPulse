// Standalone Worker Process for Background Jobs
import { queueService } from './services/queueService.js';
import { dbService, initDatabase } from './services/dbService.js';

console.log('Starting MarketPulse Worker...');

// Initialize database
await initDatabase();

// Health check interval
setInterval(async () => {
  const stats = await queueService.getStats();
  console.log(`[Worker Health] Queue: ${stats.waiting} waiting, ${stats.active} active, ${stats.completed} completed`);
}, 30000);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Worker shutting down...');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Worker interrupted...');
  process.exit(0);
});

console.log('Worker is running and processing jobs...');

// Keep alive
setInterval(() => {}, 1000);
