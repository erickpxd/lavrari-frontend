import { useAuthStore } from "@/stores/authStore"

export const BASE = "https://lavrari-api.2b9zc5fehjax.br-sao.codeengine.appdomain.cloud/lavrari/api/v1"

// Coleções que TÊM trailing slash (regra exata do OpenAPI).
// Match no path SEM querystring.
const COLLECTION_SLASH = [
  /^\/usuarios$/,
  /^\/empresas$/,
  /^\/obras$/,
  /^\/rdos$/,
  /^\/alertas$/,
  /^\/rdos\/[^/]+\/midias$/,
  /^\/rdos\/[^/]+\/comentarios$/,
]

function normalizePath(path: string): string {
  const [rawPath, query] = path.split("?")
  const clean = rawPath.replace(/\/$/, "")
  const needsSlash = COLLECTION_SLASH.some((re) => re.test(clean))
  const finalPath = needsSlash ? `${clean}/` : clean
  return query ? `${finalPath}?${query}` : finalPath
}

export class ApiError extends Error {
  status: number
  detail: unknown
  constructor(status: number, detail: unknown, message?: string) {
    super(message ?? `API error ${status}`)
    this.status = status
    this.detail = detail
  }
}

function authHeader(): Record<string, string> {
  const token = useAuthStore.getState().access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

let refreshPromise: Promise<string | null> | null = null

async function doRefresh(): Promise<string | null> {
  const { refresh_token } = useAuthStore.getState()
  if (!refresh_token) return null
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token }),
    })
    if (!res.ok) return null
    const data = await res.json()
    useAuthStore.getState().setAccessToken(data.access_token)
    return data.access_token as string
  } catch {
    return null
  }
}

function logoutRedirect() {
  useAuthStore.getState().clear()
  if (window.location.pathname !== "/login") {
    window.location.href = "/login"
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let detail: unknown = null
  try {
    const data = await res.json()
    detail = data?.detail ?? data
  } catch {
    detail = await res.text().catch(() => null)
  }
  const message =
    typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? (detail[0]?.msg ?? "Erro de validação")
        : `Erro ${res.status}`
  return new ApiError(res.status, detail, message)
}

interface RequestOpts {
  method: string
  body?: unknown
  formData?: FormData
  raw?: boolean // retorna Response (para blobs)
  retry?: boolean
}

async function request<T>(path: string, opts: RequestOpts): Promise<T> {
  const url = `${BASE}${normalizePath(path)}`
  const headers: Record<string, string> = { ...authHeader() }
  let body: BodyInit | undefined

  if (opts.formData) {
    body = opts.formData
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json"
    body = JSON.stringify(opts.body)
  }

  const res = await fetch(url, { method: opts.method, headers, body })

  if (res.status === 401 && opts.retry !== false) {
    if (!refreshPromise) refreshPromise = doRefresh()
    const newToken = await refreshPromise
    refreshPromise = null
    if (newToken) {
      return request<T>(path, { ...opts, retry: false })
    }
    logoutRedirect()
    throw new ApiError(401, null, "Sessão expirada")
  }

  if (!res.ok) throw await parseError(res)

  if (opts.raw) return res as unknown as T
  if (res.status === 204) return undefined as T
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return ""
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  )
  if (entries.length === 0) return ""
  const sp = new URLSearchParams()
  for (const [k, v] of entries) sp.append(k, String(v))
  return `?${sp.toString()}`
}

export const api = {
  get: <T>(path: string, params?: Record<string, unknown>) =>
    request<T>(`${path}${buildQuery(params)}`, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: "POST", formData }),
  async download(
    path: string,
    opts?: { method?: "GET" | "POST"; body?: unknown; filename?: string }
  ): Promise<void> {
    const res = await request<Response>(path, {
      method: opts?.method ?? "GET",
      body: opts?.body,
      raw: true,
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    const cd = res.headers.get("Content-Disposition")
    const match = cd?.match(/filename="?([^"]+)"?/)
    a.download = opts?.filename ?? match?.[1] ?? "download.pdf"
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  },
}
