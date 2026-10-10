Object.defineProperty(global, "Request", {
  value: class MockRequest {
    url: string;
    method: string;
    headers: Headers;
    body: BodyInit | null | undefined;

    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.method = init?.method || "GET";
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }

    async json() {
      return JSON.parse((this.body as string) || "{}");
    }
  },
  writable: true,
});

Object.defineProperty(global, "Response", {
  value: class MockResponse {
    status: number;
    statusText: string;
    headers: Headers;
    body: string | null;
    ok: boolean;

    constructor(body: string | null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || "";
      this.headers = new Headers(init?.headers);
      this.ok = this.status >= 200 && this.status < 300;
    }

    async json() {
      return JSON.parse(this.body as string);
    }

    static json(data: unknown, init?: ResponseInit) {
      return new MockResponse(JSON.stringify(data), { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
    }

    static redirect(url: string | URL, status = 302) {
      return new MockResponse(null, { status, headers: { Location: url.toString() } });
    }
  },
  writable: true,
});

Object.defineProperty(global, "Headers", {
  value: class Headers {
    private map: Map<string, string> = new Map();
    constructor(init?: HeadersInit) {
      if (init) {
        if (init instanceof Headers) {
          init.forEach((value, key) => this.map.set(key, value));
        } else if (Array.isArray(init)) {
          init.forEach(([key, value]) => this.map.set(key, value));
        } else {
          Object.entries(init).forEach(([key, value]) => this.map.set(key, value));
        }
      }
    }
    append(key: string, value: string) { this.map.set(key, value); }
    delete(key: string) { this.map.delete(key); }
    get(key: string) { return this.map.get(key) || null; }
    has(key: string) { return this.map.has(key); }
    set(key: string, value: string) { this.map.set(key, value); }
    forEach(callback: (value: string, key: string) => void) { this.map.forEach(callback); }
  },
  writable: true,
});
