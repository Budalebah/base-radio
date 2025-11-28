export const baseRadioContract = {
  // Deployed on Base Mainnet
  address: '0x2AF468F7A484dcb8a3F3B92EFEbe0524fdEB432B' as `0x${string}`, 
  abi: [
    {
      type: 'function',
      name: 'tuneStation',
      inputs: [{ name: 'stationId', type: 'string' }],
      outputs: [],
      stateMutability: 'nonpayable',
    },
    {
      type: 'event',
      name: 'Tuned',
      inputs: [
        { indexed: true, name: 'listener', type: 'address' },
        { indexed: false, name: 'stationId', type: 'string' },
        { indexed: false, name: 'timestamp', type: 'uint256' }
      ]
    }
  ] as const,
};

