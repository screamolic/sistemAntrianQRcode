/**
 * Evolution-API Client
 * Handles communication with self-hosted Evolution-API WhatsApp gateway
 */

export interface EvolutionMessageResponse {
  id: string;
  status: string;
  message: string;
}

export interface EvolutionStatusResponse {
  status: 'open' | 'closed' | 'connecting';
  instance?: {
    id: string;
    name: string;
    connectionStatus: string;
  };
}

export interface EvolutionConnectResponse {
  base64: string;
  code: string;
  count?: number;
}

export class EvolutionAPI {
  private baseUrl: string;
  private apiKey: string;
  private instanceName: string;

  constructor(baseUrl: string, apiKey: string, instanceName: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.instanceName = instanceName;
  }

  /**
   * Make authenticated request to Evolution-API
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        apikey: this.apiKey,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`Evolution API error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get instance connection status
   */
  async getInstanceStatus(): Promise<EvolutionStatusResponse> {
    return this.request<EvolutionStatusResponse>(
      `/instance/connectionState/${this.instanceName}`
    );
  }

  /**
   * Check if instance is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      const status = await this.getInstanceStatus();
      return status.status === 'open';
    } catch {
      return false;
    }
  }

  /**
   * Connect instance (get QR code for pairing)
   */
  async connect(): Promise<EvolutionConnectResponse> {
    return this.request<EvolutionConnectResponse>('/instance/connect', {
      method: 'POST',
      body: JSON.stringify({ 
        instanceName: this.instanceName,
        token: this.apiKey,
      }),
    });
  }

  /**
   * Send text message via WhatsApp
   * @param phone - Phone number (with country code, e.g., '628123456789')
   * @param message - Message text
   */
  async sendMessage(phone: string, message: string): Promise<EvolutionMessageResponse> {
    // Format phone number: remove +, spaces, dashes
    const formattedPhone = phone.replace(/[\s\-\+]/g, '');
    
    return this.request<EvolutionMessageResponse>('/message/sendText', {
      method: 'POST',
      body: JSON.stringify({
        instanceName: this.instanceName,
        number: formattedPhone,
        textMessage: { text: message },
      }),
    });
  }

  /**
   * Logout instance
   */
  async logout(): Promise<void> {
    await this.request(`/instance/logout/${this.instanceName}`, {
      method: 'POST',
    });
  }

  /**
   * Delete instance
   */
  async deleteInstance(): Promise<void> {
    await this.request(`/instance/delete/${this.instanceName}`, {
      method: 'DELETE',
    });
  }
}
