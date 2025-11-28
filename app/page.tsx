'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import { 
  fetchStationsByCategory, 
  searchStations, 
  RadioStation, 
  CATEGORIES, 
  CategoryId 
} from './radio';
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
import { Play, Pause, Music2, Activity, Search, X, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import type { ContractFunctionParameters } from 'viem';

const STATIONS_PER_PAGE = 20;

export default function Home() {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [playingStation, setPlayingStation] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('lofi');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  // Fetch stations by category
  const fetchStations = useCallback(async (category: CategoryId, reset: boolean = true) => {
    if (reset) {
      setLoading(true);
      setOffset(0);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    const newOffset = reset ? 0 : offset;
    const data = await fetchStationsByCategory(category, STATIONS_PER_PAGE, newOffset);
    
    if (reset) {
      setStations(data);
    } else {
      setStations(prev => [...prev, ...data]);
    }
    
    setHasMore(data.length === STATIONS_PER_PAGE);
    setOffset(newOffset + STATIONS_PER_PAGE);
    setLoading(false);
    setLoadingMore(false);
  }, [offset]);

  // Initial load
  useEffect(() => {
    fetchStations(selectedCategory, true);
  }, [selectedCategory]);

  // Search handler with debounce
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!query.trim()) {
      setIsSearching(false);
      fetchStations(selectedCategory, true);
      return;
    }

    setIsSearching(true);
    
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      const results = await searchStations(query, 30);
      setStations(results);
      setHasMore(false);
      setLoading(false);
    }, 500);
  }, [selectedCategory, fetchStations]);

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsSearching(false);
    fetchStations(selectedCategory, true);
  };

  // Category change handler
  const handleCategoryChange = (category: CategoryId) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    setSearchQuery('');
    setIsSearching(false);
  };

  // Load more stations
  const loadMore = () => {
    if (!loadingMore && hasMore && !isSearching) {
      fetchStations(selectedCategory, false);
    }
  };

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
    <main className="min-h-screen pb-20 max-w-md mx-auto px-4 pt-4">
      {/* Header & Wallet */}
      <header className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="Base Radio" className="w-8 h-8 rounded-lg" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
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

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search radio stations..."
          className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`
              flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${selectedCategory === category.id && !isSearching
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'}
            `}
          >
            {category.emoji} {category.label}
          </button>
        ))}
      </div>

      <audio ref={audioRef} className="hidden" />

      {/* Stations List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p>Loading stations...</p>
        </div>
      ) : stations.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4 text-gray-400">
          <Music2 className="w-12 h-12 opacity-50" />
          <p>No stations found</p>
          {isSearching && (
            <button
              onClick={clearSearch}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {stations.map((station) => (
            <div 
              key={station.stationuuid}
              className={`
                relative p-3 rounded-xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm
                transition-all duration-200
                ${playingStation === station.stationuuid ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'hover:border-gray-700'}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={() => togglePlay(station)}
                  className={`
                    flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center
                    transition-colors
                    ${playingStation === station.stationuuid 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}
                  `}
                >
                  {playingStation === station.stationuuid ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-white text-sm truncate">
                    {station.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mt-1 text-xs text-gray-500">
                    {station.country && (
                      <span className="bg-gray-800/80 px-1.5 py-0.5 rounded">
                        {station.country}
                      </span>
                    )}
                    {station.tags?.split(',').slice(0, 2).map(tag => (
                      <span key={tag} className="bg-gray-800/80 px-1.5 py-0.5 rounded truncate max-w-[70px]">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Visualizer or Ping Button */}
                <div className="flex-shrink-0">
                  {playingStation === station.stationuuid ? (
                    <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
                  ) : address ? (
                    <Transaction
                      chainId={8453}
                      contracts={createCalls(station.stationuuid)}
                      onError={(err) => console.error('Transaction error:', err)}
                      onSuccess={(response) => console.log('Transaction successful', response)}
                    >
                      <TransactionButton 
                        className="!bg-gray-800 hover:!bg-gray-700 !text-xs !px-2 !py-1 !rounded-md !border !border-gray-700 !text-gray-400 !min-w-0 !h-auto"
                        text="🔵" 
                      />
                      <TransactionStatus>
                        <TransactionStatusLabel />
                        <TransactionStatusAction />
                      </TransactionStatus>
                    </Transaction>
                  ) : null}
                </div>
              </div>
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && !isSearching && (
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="w-full py-3 mt-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                'Load More Stations'
              )}
            </button>
          )}
        </div>
      )}
      
      <div className="text-center mt-6 text-xs text-gray-600">
        Powered by Base 🔵
      </div>
    </main>
  );
}
