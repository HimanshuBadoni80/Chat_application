
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

  throw new Error("sever returned a non-json response");
}
