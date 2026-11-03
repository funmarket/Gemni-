export interface VibeShotResult {
  uri: string;           // local file path of captured photo
  timestamp: number;     // Date.now() at moment of capture (NOT at confirm)
  latitude: number | null;
  longitude: number | null;
  frontUri: string | null;  // only populated in 'vibeflash' mode
}
