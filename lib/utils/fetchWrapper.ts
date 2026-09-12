export default async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const data = await response.json();
    if (!response.ok) {
      throw data; // Throw the error body so 'catch' handles it
    }
    return data as T;
  }

  throw new Error("server returned a non-json response");
}

// keep the older logic ⬆️ intact, later migrate to industry standard⬇️.

type FetchOptions = RequestInit & {
  timeoutMs?: number;
};
export async function ApiFetch<T>(
  url: string,
  options?: FetchOptions,
): Promise<T> {
  const {
    timeoutMs = 10_000,
    signal: callerSignal,
    ...fetchOptions
  } = options ?? {};

  const signal = callerSignal
    ? AbortSignal.any([AbortSignal.timeout(timeoutMs), callerSignal])
    : AbortSignal.timeout(timeoutMs);

  const response = await fetch(url, { ...fetchOptions, signal });

  const contentType = response.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new Error(
      `Server returned a non-JSON response (status:${response.status}, url: ${url})`,
    );
  }

  const data = await response.json();

  if (!response.ok) throw data;
  return data as T;
}


