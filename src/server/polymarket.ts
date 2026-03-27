import { ClobClient } from '@polymarket/clob-client';
import { ethers } from 'ethers';

// Cache of ClobClients
const clients = new Map<string, ClobClient>();

export function getClobClient(
  accountId: string,
  privateKey: string,
  key: string,
  secret: string,
  passphrase: string
): ClobClient {
  if (clients.has(accountId)) {
    return clients.get(accountId)!;
  }

  const wallet = new ethers.Wallet(privateKey);
  const client = new ClobClient(
    "https://clob.polymarket.com",
    137, // Polygon Mainnet
    wallet,
    {
      key,
      secret,
      passphrase,
    },
    0, // signatureType: EOA
    wallet.address // funder
  );

  clients.set(accountId, client);
  return client;
}

export function removeClobClient(accountId: string) {
  clients.delete(accountId);
}
