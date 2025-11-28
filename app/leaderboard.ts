import { createPublicClient, http, parseAbiItem } from 'viem';
import { base } from 'viem/chains';
import { baseRadioContract } from './calls';

// Public client for reading from Base
const publicClient = createPublicClient({
  chain: base,
  transport: http(),
});

export interface StationLeaderboardEntry {
  stationId: string;
  pingCount: number;
  lastPing: number;
}

export interface ListenerLeaderboardEntry {
  address: string;
  pingCount: number;
  lastPing: number;
}

export interface LeaderboardData {
  topStations: StationLeaderboardEntry[];
  topListeners: ListenerLeaderboardEntry[];
  totalPings: number;
}

// Fetch all Tuned events and compute leaderboards
export async function fetchLeaderboard(): Promise<LeaderboardData> {
  try {
    // Get all Tuned events from the contract
    const logs = await publicClient.getLogs({
      address: baseRadioContract.address,
      event: parseAbiItem('event Tuned(address indexed listener, string stationId, uint256 timestamp)'),
      fromBlock: 'earliest',
      toBlock: 'latest',
    });

    // Process logs to build leaderboards
    const stationCounts = new Map<string, { count: number; lastPing: number }>();
    const listenerCounts = new Map<string, { count: number; lastPing: number }>();

    for (const log of logs) {
      const { listener, stationId, timestamp } = log.args as {
        listener: string;
        stationId: string;
        timestamp: bigint;
      };

      const timestampNum = Number(timestamp);

      // Update station counts
      const stationData = stationCounts.get(stationId) || { count: 0, lastPing: 0 };
      stationData.count += 1;
      stationData.lastPing = Math.max(stationData.lastPing, timestampNum);
      stationCounts.set(stationId, stationData);

      // Update listener counts
      const listenerData = listenerCounts.get(listener) || { count: 0, lastPing: 0 };
      listenerData.count += 1;
      listenerData.lastPing = Math.max(listenerData.lastPing, timestampNum);
      listenerCounts.set(listener, listenerData);
    }

    // Convert to arrays and sort by ping count
    const topStations: StationLeaderboardEntry[] = Array.from(stationCounts.entries())
      .map(([stationId, data]) => ({
        stationId,
        pingCount: data.count,
        lastPing: data.lastPing,
      }))
      .sort((a, b) => b.pingCount - a.pingCount)
      .slice(0, 10);

    const topListeners: ListenerLeaderboardEntry[] = Array.from(listenerCounts.entries())
      .map(([address, data]) => ({
        address,
        pingCount: data.count,
        lastPing: data.lastPing,
      }))
      .sort((a, b) => b.pingCount - a.pingCount)
      .slice(0, 10);

    return {
      topStations,
      topListeners,
      totalPings: logs.length,
    };
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return {
      topStations: [],
      topListeners: [],
      totalPings: 0,
    };
  }
}

// Helper to truncate address for display
export function truncateAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

