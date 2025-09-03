// TODO : move to separate package

import { log } from '@rxap/rxjs';
import { JoinPath } from '@rxap/utilities';
import {
  catchError,
  EMPTY,
  firstValueFrom,
  Observable,
  race,
} from 'rxjs';

/**
 * Similar to Promise.race() but only resolves with the first successful promise.
 * It will only reject if all promises reject.
 */
export async function raceSuccess<T>(promises: Promise<T>[]): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let rejectionCount = 0;

    promises.forEach((promise) => {
      promise.then(
        // On success, resolve the entire raceSuccess promise
        (value) => resolve(value),
        // On rejection, count it and check if all promises rejected
        () => {
          rejectionCount++;
          if (rejectionCount === promises.length) {
            reject(new Error('All promises were rejected'));
          }
          // Otherwise continue waiting for other promises
        }
      );
    });
  });
}


export async function dnsResolver(endpoint: string, name: string, type: string): Promise<string> {
  const response = await fetch(`${endpoint}?name=${name}&type=${type}`, {
    method: 'GET',
    headers: { 'Accept': 'application/dns-json' },
  });
  if (!response.ok) {
    throw new Error(`Failed to resolve DNS via ${endpoint} (${response.status}): ${response.statusText}`);
  }
  const result = await response.json();
  // Basic validation of the response structure
  if (!result || !Array.isArray(result.Answer) || result.Answer.length === 0 || !result.Answer[0].data) {
    throw new Error(`Invalid DNS response structure from ${endpoint} for ${name} ${type}`);
  }
  const data = result.Answer[0].data;
  // Remove surrounding quotes often found in TXT records
  return data.replace(/^"(.*)"$/, '$1');
}

export async function dnsLookup(
  name: string,
  type: string,
  dnsServers = [
    'https://dns.google/resolve',
    'https://cloudflare-dns.com/dns-query'
  ]
): Promise<string> {
  type = type.toUpperCase();
  console.log(`Performing DNS lookup for ${type} record of ${name} using servers: ${dnsServers.join(', ')}`);
  try {
    // Use Promise.race to get the first successful response
    return await raceSuccess(dnsServers.map(server => dnsResolver(server, name, type)));
  } catch (error: any) {
    console.error(`Failed to resolve DNS TXT record for ${name} using any server: ${error.message}`);
    throw new Error(`DNS lookup failed for ${name} (${type})`); // Re-throw a more specific error
  }
}

export function fetchContentViaHttp(url: string): Observable<Blob | null> {
  return new Observable<Blob>((subscriber) => {
    let controller: AbortController | null = new AbortController(); // For cancellation

    fetch(url)
      .then(response => {
        if (!response.ok) {
          // Don't complete here, let catchError handle it
          throw new Error(`HTTP error ${response.status} for ${url}: ${response.statusText}`);
        }
        return response.blob();
      })
      .then(blob => {
        if (!subscriber.closed) {
          subscriber.next(blob);
          subscriber.complete();
        }
      })
      .catch(error => {
        if (error.name !== 'AbortError' && !subscriber.closed) {
          console.warn(`Fetch error for ${url}:`, error);
        }
      });

    // Cleanup function for when the observable is unsubscribed
    return () => {
      controller?.abort();
      controller = null; // Release reference
    };

  }).pipe(
    catchError(error => {
      // Log the error but return null to signal failure without stopping the race
      console.error(`Fetch failed for ${url}: ${error.message}`);
      return EMPTY; // Signal failure with null
    }),
  );
}

export function fetchCidContentViaHttp(cid: string, path?: string): Observable<Blob | null> {
  return race(
    // Attempt 1: w3s.link
    fetchContentViaHttp(JoinPath(`https://${ cid }.ipfs.w3s.link`, path)).pipe(
      log(`w3s fetch attempt for ${cid}`),
    ),
    // Attempt 2: Local gateway
    fetchContentViaHttp(JoinPath(`${location.origin}/ipfs/${ cid }`, path)).pipe(
      log(`local fetch attempt for ${cid}`),
    )
    // Add more sources here if needed
  ).pipe(
    log(`Race winner for ${cid}`), // Log which source won (will show Blob or null)
  );
}

export async function fetchCidContent(cid: string, path?: string): Promise<Blob | null> {
  console.log(`Fetching content for CID: ${cid}`);
  // Example: Fetch from an IPFS gateway or other source
  // const gatewayUrl = `https://ipfs.io/ipfs/${cid}`;
  try {
    return await firstValueFrom(
      race(
        fetchCidContentViaHttp(cid, path)
      ),
      { defaultValue: null } // Return null if the stream completes empty
    );
  } catch (error) {
    console.error(`Error fetching or parsing content for CID ${cid}:`, error);
    return null; // Return null on error
  }
}

export async function fetchCidContentAsJson(cid: string, path?: string, _fetchCidContent = fetchCidContent): Promise<any | null> {
  console.log(`Fetching JSON content for CID: ${cid}`);
  const blob = await _fetchCidContent(cid, path);
  if (blob) {
    try {
      const text = await blob.text();
      return JSON.parse(text);
    } catch (error) {
      console.error(`Error parsing JSON content for CID ${cid}:`, error);
      return null; // Return null on error
    }
  }
  console.warn(`No blob available for CID ${cid}, cannot parse as JSON.`);
  return null; // Return null if blob is not available
}
