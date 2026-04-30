import axios from 'axios';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (iPad; CPU OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

/**
 * Enhanced Network Service
 * Handles HTTP requests with automatic retries, UA rotation, and smart error handling.
 */
class NetworkService {
  constructor() {
    this.proxyUrl = process.env.PROXY_URL || null;
  }

  getRandomUA() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  /**
   * Generates core headers to mimic a real browser session
   */
  getCoreHeaders() {
    return {
      'User-Agent': this.getRandomUA(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Platform': '"Windows"'
    };
  }

  async fetch(url, options = {}) {
    const {
      retryCount = 3,
      delay = 1500,
      method = 'GET',
      headers = {},
      ...axiosOptions
    } = options;

    let lastError = null;

    for (let i = 0; i < retryCount; i++) {
      try {
        const response = await axios({
          url,
          method,
          headers: {
            ...this.getCoreHeaders(),
            ...headers
          },
          ...axiosOptions,
          timeout: axiosOptions.timeout || 15000,
          // Real proxy implementation would use an agent, but we set up the config here
          ...(this.proxyUrl ? { proxy: false, httpsAgent: null /* add agent if needed */ } : {})
        });

        return response;
      } catch (error) {
        lastError = error;
        const status = error.response?.status;

        // Critical failures should not be retried to avoid further flagging
        if (status === 403 || status === 401) {
          console.error(`[Network] Access Denied (${status}) for ${url}`);
          throw error;
        }

        console.warn(`[Network] ${url} failed (Attempt ${i + 1}/${retryCount}): ${error.message}`);

        if (i < retryCount - 1) {
          // Smart backoff: longer waits for 429s
          const waitTime = status === 429 ? delay * 10 : delay * (i + 1);
          await new Promise(r => setTimeout(r, waitTime));
        }
      }
    }

    throw lastError;
  }

  async fetchJson(url, options = {}) {
    const res = await this.fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Accept': 'application/json'
      }
    });
    return res.data;
  }
}

export const networkService = new NetworkService();
