'use client';

import { useEffect, useState, useRef } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import { fetchLofiStations, RadioStation } from './radio';
import { baseRadioContract } from './calls';
import { 
  Transaction, 
  TransactionButton, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction 
} from '@coinbase/onchainkit/transaction';
import { ConnectWallet, Wallet, WalletDropdown, WalletDropdownDisconnect } from '@coinbase/onchainkit/wallet';
import { Address, Avatar, Name, Identity, EthBalance } from '@coinbase/onchainkit/identity';
import { Play, Pause, Radio, Music2, Activity } from 'lucide-react';
import { useAccount } from 'wagmi';
import type { ContractFunctionParameters } from 'viem';

export default function Home() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingStation, setPlayingStation] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { address } = useAccount();

  // Initialize Farcaster SDK
  useEffect(() => {
    const init = async () => {
      try {
        await sdk.actions.ready();
      } catch (e) {
        console.error('SDK ready failed', e);
      }
    };
    init();
  }, []);

  // Fetch Stations
  useEffect(() => {
    fetchLofiStations().then((data) => {
      setStations(data);
      setLoading(false);
    });
  }, []);

  // Audio Player Logic
  const togglePlay = (station: RadioStation) => {
    if (playingStation === station.stationuuid) {
      audioRef.current?.pause();
      setPlayingStation(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = station.url;
        audioRef.current.play().catch(e => console.error("Playback failed", e));
        setPlayingStation(station.stationuuid);
      }
    }
  };

  // Create contract calls for a station
  const createCalls = (stationId: string): ContractFunctionParameters[] => {
    return [
      {
        address: baseRadioContract.address,
        abi: baseRadioContract.abi,
        functionName: 'tuneStation',
        args: [stationId],
      },
    ] as unknown as ContractFunctionParameters[];
  };

  return (
    <main className="min-h-screen pb-20 max-w-md mx-auto px-4 pt-6">
      {/* Header & Wallet */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Radio className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Base Radio
          </h1>
        </div>
        
        <Wallet>
          <ConnectWallet>
            <Avatar className="h-6 w-6" />
            <Name />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>

      <audio ref={audioRef} className="hidden" />

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p>Loading vibes...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stations.map((station) => (
            <div 
              key={station.stationuuid}
              className={`
                relative p-4 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm
                transition-all duration-200
                ${playingStation === station.stationuuid ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'hover:border-gray-700'}
              `}
            >
              <div className="flex justify-between items-start gap-4">
                {/* Play/Pause Button */}
                <button
                  onClick={() => togglePlay(station)}
                  className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    transition-colors
                    ${playingStation === station.stationuuid 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                  `}
                >
                  {playingStation === station.stationuuid ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-1" />
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white truncate pr-2">
                    {station.name}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-400">
                    {station.country && (
                      <span className="bg-gray-800 px-2 py-0.5 rounded-md">
                        {station.country}
                      </span>
                    )}
                    {station.tags?.split(',').slice(0, 2).map(tag => (
                      <span key={tag} className="bg-gray-800 px-2 py-0.5 rounded-md truncate max-w-[80px]">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Optional Visualizer Icon */}
                {playingStation === station.stationuuid && (
                  <div className="flex items-center h-12">
                    <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                  </div>
                )}
              </div>

              {/* Onchain Action */}
              <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between">
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Music2 className="w-3 h-3" />
                  <span>Free Listen</span>
                </div>
                
                <div className="flex-shrink-0">
                  {address ? (
                    <Transaction
                      chainId={8453}
                      contracts={createCalls(station.stationuuid)}
                      onError={(err) => console.error('Transaction error:', err)}
                      onSuccess={(response) => console.log('Transaction successful', response)}
                    >
                      <TransactionButton 
                        className="bg-gray-800 hover:bg-gray-700 text-xs px-3 py-1.5 rounded-md border border-gray-700 text-gray-300"
                        text="Ping on Base 🔵" 
                      />
                      <TransactionStatus>
                        <TransactionStatusLabel />
                        <TransactionStatusAction />
                      </TransactionStatus>
                    </Transaction>
                  ) : (
                    <span className="text-xs text-gray-500">Connect wallet to ping</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-center mt-8 text-xs text-gray-600">
        Powered by Base 🔵
      </div>
    </main>
  );
}
