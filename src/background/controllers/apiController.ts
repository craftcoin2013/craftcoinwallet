import { API_URL } from "@/shared/constant";

import type {
  ApiUTXO,
  IAccountStats,
  ITransaction,
} from "@/shared/interfaces/api";
import {
  ContentDetailedInscription,
  ContentInscriptionResopnse,
  FindInscriptionsByOutpointResponseItem,
} from "@/shared/interfaces/inscriptions";
import { IToken } from "@/shared/interfaces/token";
import { customFetch, fetchProps } from "@/shared/utils";
import { isValidTXID } from "@/ui/utils";

export interface UtxoQueryParams {
  hex?: boolean;
  amount?: number;
}

export interface IApiController {
  getUtxos(address: string, amount?: number): Promise<ApiUTXO[] | undefined>;
  pushTx(rawTx: string): Promise<string>;
  getTransactions(address: string): Promise<ITransaction[] | undefined>;
  getPaginatedTransactions(
    address: string,
    txid: string
  ): Promise<ITransaction[] | undefined>;
  getCRCPrice(): Promise<{ usd: number } | undefined>;
  getLastBlockCRC(): Promise<number | undefined>;
  getAccountStats(address: string): Promise<IAccountStats | undefined>;
  getTokens(address: string): Promise<IToken[] | undefined>;
  getTransactionHex(txid: string): Promise<string | undefined>;
  getTransaction(txid: string): Promise<ITransaction | undefined>;
  getUtxoValues(outpoints: string[]): Promise<number[] | undefined>;
  getContentPaginatedInscriptions(
    address: string,
    page: number
  ): Promise<ContentInscriptionResopnse | undefined>;
  searchContentInscriptionByInscriptionId(
    inscriptionId: string
  ): Promise<ContentDetailedInscription | undefined>;
  searchContentInscriptionByInscriptionNumber(
    address: string,
    number: number
  ): Promise<ContentInscriptionResopnse | undefined>;
  getLocationByInscriptionId(
    inscriptionId: string
  ): Promise<{ location: string; owner: string } | undefined>;
  findInscriptionsByOutpoint(data: {
    outpoint: string;
    address: string;
  }): Promise<FindInscriptionsByOutpointResponseItem[] | undefined>;
}

type FetchType = <T>(props: fetchProps) => Promise<T | undefined>;

class ApiController implements IApiController {
  private fetch: FetchType = async (p) => {
    try {
      return await customFetch({
        ...p,
      });
    } catch {
      return;
    }
  };

  async getUtxos(
    address: string,
    amount?: number
  ): Promise<ApiUTXO[] | undefined> {
    let res;

    if (amount) {
      res = await fetch(`${API_URL}/address/${address}/fetch-utxos/${amount}`);
    } else {
      res = await fetch(`${API_URL}/address/${address}/utxo`);
    }

    if (!res.ok) return undefined;

    const utxos = await res.json();
    if (!utxos || !Array.isArray(utxos)) return undefined;

    const utxosWithHex: ApiUTXO[] = await Promise.all(
      utxos.map(async (utxo) => {
        return {
          txid: utxo.txid,
          vout: utxo.vout,
          status: utxo.status,
          value: utxo.value,
          hex: utxo.raw,
        };
      })
    );

    return utxosWithHex;
  }

  async pushTx(txHex: string) {
    const res = await fetch(`${API_URL}/tx`, {
      method: "POST",
      headers: {
        "content-type": "text/plain",
      },
      body: txHex,
    });

    if (!res.ok) {
      console.error("Failed to push transaction:", res);
      return "";
    }

    const data = await res.text();

    if (data && isValidTXID(data)) {
      return data;
    } else {
      console.error("Failed to push transaction:", data);
      return "";
    }
  }

  async getTransactions(address: string): Promise<ITransaction[] | undefined> {
    try {
      const res = await fetch(`${API_URL}/address/${address}/txs`);

      if (!res.ok) return undefined;

      return (await res.json()) as ITransaction[];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return undefined;
    }
  }

  async getPaginatedTransactions(
    address: string,
    txid: string
  ): Promise<ITransaction[] | undefined> {
    try {
      return await this.fetch<ITransaction[]>({
        path: `/address/${address}/txs/chain/${txid}`,
        service: "content",
      });
    } catch (e) {
      return undefined;
    }
  }

  async getLastBlockCRC() {
    const res = await fetch(`${API_URL}/blocks/tip/height`);

    if (!res.ok) {
      return undefined;
    }

    return Number(await res.text());
  }

  async getCRCPrice() {
    const res = await fetch('https://explorer.craftcoin.info/ext/getcurrentprice');
    
    if (!res.ok) {
      return undefined;
    }
  
    const data = await res.json() as {
      last_price_usdt: number;  
      last_price_usd: number;
    };
  
    return {
      usd: data.last_price_usdt,
    };
  }

  async getAccountStats(address: string): Promise<IAccountStats | undefined> {
    try {
      const res = await fetch(`${API_URL}/address/${address}`);

      if (!res.ok) throw new Error("Failed to fetch account stats");

      const data = (await res.json()) as {
        address: string;
        chain_stats: {
          funded_txo_count: number;
          funded_txo_sum: number;
          spent_txo_count: number;
          spent_txo_sum: number;
          tx_count: number;
        };
      };

      if (!data.chain_stats) {
        return { amount: 0, count: 0, balance: 0 };
      }

      return {
        amount: 0, // TODO: implement
        count: 0, // TODO: implement
        balance:
          (data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) /
          1e8,
      };
    } catch {
      return { amount: 0, count: 0, balance: 0 };
    }
  }

  async getTokens(address: string): Promise<IToken[] | undefined> {
    return await this.fetch<IToken[]>({
      path: `/address/${address}/tokens`,
      service: "content",
    });
  }

  async getTransaction(txid: string) {
    return await this.fetch<ITransaction>({
      path: "/tx/" + txid,
      service: "content",
    });
  }

  async getTransactionHex(txid: string) {
    return await this.fetch<string>({
      path: "/tx/" + txid + "/hex",
      json: false,
      service: "content",
    });
  }

  async getUtxoValues(outpoints: string[]) {
    const result = await this.fetch<{ values: number[] }>({
      path: "/prev",
      body: JSON.stringify({ locations: outpoints }),
      method: "POST",
      service: "content",
    });
    return result?.values;
  }

  async getContentPaginatedInscriptions(address: string, page: number) {
    return await this.fetch<ContentInscriptionResopnse>({
      path: `/search?account=${address}&page_size=6&page=${page}`,
      service: "content",
    });
  }

  async searchContentInscriptionByInscriptionId(inscriptionId: string) {
    return await this.fetch<ContentDetailedInscription>({
      path: `/${inscriptionId}/info`,
      service: "content",
    });
  }

  async searchContentInscriptionByInscriptionNumber(
    address: string,
    number: number
  ) {
    return await this.fetch<ContentInscriptionResopnse>({
      path: `/search?account=${address}&page_size=6&page=1&from=${number}&to=${number}`,
      service: "content",
    });
  }

  async getLocationByInscriptionId(inscriptionId: string) {
    return await this.fetch<{ location: string; owner: string }>({
      path: `/location/${inscriptionId}`,
      service: "content",
    });
  }

  async findInscriptionsByOutpoint(data: {
    outpoint: string;
    address: string;
  }) {
    return await this.fetch<FindInscriptionsByOutpointResponseItem[]>({
      path: `/find_meta/${data.outpoint}?address=${data.address}`,
      service: "content",
    });
  }
}

export default new ApiController();
