// --- Dual-Mode OBS WebSocket Bridge ---
export class OBSWebSocketManager {
  private ws: WebSocket | null = null;
  private messageId = 1;
  public onConnect?: (mode: 'local' | 'tunnel') => void;
  public onDisconnect?: () => void;
  public connected = false;
  public mode: 'local' | 'tunnel' | null = null;

  connect() {
    // 1. Attempt direct 0ms local port first
    try {
      this.ws = new WebSocket('ws://localhost:4455');

      this.ws.onopen = () => {
        console.log('[OBS] Connected to local OBS (ws://localhost:4455).');
        this.connected = true;
        this.mode = 'local';
        if (this.onConnect) this.onConnect('local');
      };

      this.ws.onerror = () => {
        console.warn('[OBS] Local connection failed. Falling back to Cloudflare tunnel...');
        this.ws?.close();

        // 2. Fallback to Cloudflare Encrypted WSS Tunnel
        try {
          this.ws = new WebSocket('wss://obs.henryix.com');
          this.ws.onopen = () => {
            console.log('[OBS] Connected to Cloudflare WSS tunnel (wss://obs.henryix.com).');
            this.connected = true;
            this.mode = 'tunnel';
            if (this.onConnect) this.onConnect('tunnel');
          };
          this.ws.onerror = (err) => {
            console.warn('[OBS] Cloudflare tunnel offline (Simulated standby).', err);
          };
          this.ws.onclose = () => {
            this.connected = false;
            this.mode = null;
            if (this.onDisconnect) this.onDisconnect();
          };
        } catch (e) {
          console.warn('[OBS] Tunnel initialization error:', e);
        }
      };

      this.ws.onclose = () => {
        this.connected = false;
        this.mode = null;
        if (this.onDisconnect) this.onDisconnect();
      };
    } catch (err) {
      console.warn('[OBS] Connection init exception:', err);
    }
  }

  send(requestType: string, requestData?: any) {
    if (!this.ws || !this.connected) return;
    try {
      this.ws.send(
        JSON.stringify({
          op: 6,
          d: {
            requestType,
            requestId: (this.messageId++).toString(),
            requestData,
          },
        })
      );
    } catch (e) {
      console.warn('[OBS] Error sending command:', e);
    }
  }

  setScene(sceneName: string) {
    this.send('SetCurrentProgramScene', { sceneName });
  }

  disconnect() {
    this.ws?.close();
  }
}
