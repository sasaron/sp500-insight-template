import mysql from 'mysql2/promise';
import { DateTime } from "luxon";
import {NextResponse} from "next/server";

const conn = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

const querySQL = `
SELECT
    country_code,
    COUNT(*) AS companies
FROM
    companies c
WHERE
    stock_symbol IN (SELECT stock_symbol FROM index_compositions WHERE index_symbol = ?)
GROUP BY
    country_code
ORDER BY
    companies DESC
`;

const getCompositionCountryDistribution = async (symbol: string) => {
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
  const result = await getCompositionCountryDistribution(symbol as string);
  return NextResponse.json(result);
}
