import { NextResponse } from 'next/server';
import { getSales, getAllProducts, getCampaigns } from '@/lib/db';

export async function GET() {
  try {
    const { sales } = await getSales();
    const { products } = await getAllProducts();
    const { campaigns } = await getCampaigns();

    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product.name;
      return acc;
    }, {});

    const campaignMap = campaigns.reduce((acc, campaign) => {
      acc[campaign.id] = campaign.name;
      return acc;
    }, {});

    const salesWithDetails = sales.map((sale) => ({
      ...sale,
      productName: productMap[sale.productId] || 'Unknown Product',
      campaignName: sale.campaignId ? campaignMap[sale.campaignId] : null
    }));

    return NextResponse.json({ sales: salesWithDetails });
  } catch (error) {
    console.error('Error fetching sales data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales data' },
      { status: 500 }
    );
  }
}
