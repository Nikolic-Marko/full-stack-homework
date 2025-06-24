type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface ApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}

interface RequestOptions<T> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: T;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || "";
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...options.defaultHeaders,
    };
  }

  async request<TBody = unknown, TResponse = unknown>(
    endpoint: string,
    options: RequestOptions<TBody> = {}
  ): Promise<TResponse> {
    const { method = "GET", headers = {}, body } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed with status ${response.status}`
      );
    }

    return response.json();
  }

  get<T = unknown>(endpoint: string, headers = {}): Promise<T> {
    return this.request<unknown, T>(endpoint, { method: "GET", headers });
  }

  post<T = unknown, R = unknown>(
    endpoint: string,
    body: T,
    headers = {}
  ): Promise<R> {
    return this.request<T, R>(endpoint, { method: "POST", headers, body });
  }

  put<T = unknown, R = unknown>(
    endpoint: string,
    body: T,
    headers = {}
  ): Promise<R> {
    return this.request<T, R>(endpoint, { method: "PUT", headers, body });
  }

  delete<R = unknown>(endpoint: string, headers = {}): Promise<R> {
    return this.request<unknown, R>(endpoint, { method: "DELETE", headers });
  }
}

export const apiClient = new ApiClient();
export default ApiClient;
