# Sample MBSE Project

This is a sample project for testing the MBSE benchmark framework.

## System Overview

The system is a satellite communication module that handles:
- Data transmission to ground stations
- Telemetry collection from sensors
- Power management during eclipse periods

## Requirements

The following capabilities are needed:

1. The system shall transmit data at 1 Mbps minimum
2. The system shall collect telemetry every 100ms
3. The system shall operate on battery during eclipse
4. The system shall provide error correction for transmitted data
5. The system shall log all sensor readings

## Architecture

The system uses a modular architecture with separate components for each function.
