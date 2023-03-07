import mysql from 'mysql2/promise';
import { DateTime } from "luxon";
import {NextResponse} from "next/server";

const conn = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

const querySQL = `
SELECT
    record_date, open, close, high, low, adj_close
FROM stock_price_history
WHERE
    stock_symbol = ?
    AND record_date > DATE_SUB(NOW(), INTERVAL 3 MONTH)
`;

const getStockPriceHistory = async (symbol: string) => {
  const queryStart = DateTime.now();
  const [rows] = await conn.query<any[]>(querySQL, [symbol]);
  const queryEnd = DateTime.now();
  const queryCost = queryEnd.diff(queryStart).as('seconds');

  return {
    rows,
    queryStart,
    queryEnd,
    queryCost,
  }
}

export async function GET(req: Request, { params }: any) {
  const { symbol } = params;
  const result = await getStockPriceHistory(symbol as string);
  return NextResponse.json(result);
}
