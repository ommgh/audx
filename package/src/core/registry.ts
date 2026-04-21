import type {
  RegistryItem,
  RegistryCatalog,
  GenerateSoundParams,
} from "../types.js";

/**
 * Fetch a single registry item by name.
 * GET {registryUrl}/r/{name}.json
 */
export async function fetchItem(
  registryUrl: string,
  name: string,
): Promise<RegistryItem> {
  const url = `${registryUrl}/r/${name}.json`;
  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      `Could not reach the audx registry at ${registryUrl}. Check your network connection.`,
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch '${name}': HTTP ${response.status}`);
  }

  return (await response.json()) as RegistryItem;
}

/**
 * Fetch the full registry catalog.
 * GET {registryUrl}/r/registry.json
 */
export async function fetchCatalog(
  registryUrl: string,
): Promise<RegistryCatalog> {
  const url = `${registryUrl}/r/registry.json`;
  let response: Response;

  try {
    response = await fetch(url);
  } catch {
    throw new Error(
      `Could not reach the audx registry at ${registryUrl}. Check your network connection.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch registry catalog: HTTP ${response.status}`,
    );
  }

  return (await response.json()) as RegistryCatalog;
}

/**
 * Generate a sound via the API.
 * POST {registryUrl}/api/generate-sound
 * Returns raw audio bytes as a Buffer.
 */
export async function generateSound(
  registryUrl: string,
  params: GenerateSoundParams,
): Promise<Buffer> {
  const url = `${registryUrl}/api/generate-sound`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch {
    throw new Error(
      `Could not reach the audx registry at ${registryUrl}. Check your network connection.`,
    );
  }

  if (!response.ok) {
    let errorMessage: string;
    try {
      const body = (await response.json()) as { error?: string };
      errorMessage = body.error ?? `HTTP ${response.status}`;
    } catch {
      errorMessage = `HTTP ${response.status}`;
    }
    throw new Error(errorMessage);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
