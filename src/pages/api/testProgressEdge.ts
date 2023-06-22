
import { NextRequest } from 'next/server';
import prisma from '../../../lib/prisma';

export const config = {
  runtime: 'edge',
  regions: ["sin1"],
};

export default async function handler(req: NextRequest) {
  const feed = await prisma.users.findMany() 
  // const feed = {name : "meawza"}
  return new Response(
    JSON.stringify(feed),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, s-maxage=1200, stale-while-revalidate=600',
      },
    }
  )
}