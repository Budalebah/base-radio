// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BaseRadio {
    struct Tune {
        address listener;
        string stationId; // RadioBrowser stationuuid
        uint256 timestamp;
    }

    Tune[] public tunes;

    event Tuned(address indexed listener, string stationId, uint256 timestamp);

    function tuneStation(string calldata stationId) external {
        tunes.push(Tune({
            listener: msg.sender,
            stationId: stationId,
            timestamp: block.timestamp
        }));

        emit Tuned(msg.sender, stationId, block.timestamp);
    }

    function tunesCount() external view returns (uint256) {
        return tunes.length;
    }
}

