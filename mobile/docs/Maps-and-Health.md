# Maps & Health

Maps (react-native-maps)
- Android: `provider={PROVIDER_GOOGLE}` for English labels
- Health mini-map: Berlin polyline + avatar start marker
- Main Map: Berlin region, avatar/current/end markers, live simulation, history modal

Berlin Path Defaults
- Health: Tiergarten fallback polyline
- Map: `BERLIN_PATHS` and generated historical paths

Health Data (mocked)
- `MOCK_HEALTH_DATA` uses Celsius and dog-relevant metrics
- `MOCK_HISTORICAL_HEALTH_DATA` keyed by health metrics with time-series
- Metric card opens modal graph (not inline)

Units & Ranges
- Temperature: °C (healthy range 38–39)
- Heart rate: bpm (healthy range 60–100)
