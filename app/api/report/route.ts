import { NextResponse } from 'next/server';
import { getSalesData } from '@/lib/salesData';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function GET() {
  try {
    const { salesWithDetails, salesByMonth } = await getSalesData();
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: `Please generate a sales report from the following JSON structure. The report should have a 1-paragraph summary for the last 30 days at the top, including sales and campaign information, including any trends that you can detect, and then a detailed breakdown of the sales by product and campaign in a table format sorted by revenue. The report should be in markdown format: ${JSON.stringify(
            salesByMonth
          )}`
        }
      ]
    });

    console.log(response.choices[0].message.content);

    return NextResponse.json({ response: response.choices[0].message.content });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}
