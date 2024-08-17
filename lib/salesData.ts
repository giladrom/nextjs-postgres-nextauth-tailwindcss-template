import {
  getSales,
  getAllProducts,
  getCampaigns,
  SelectProduct,
  SelectSales
} from '@/lib/db';

type SaleWithDetails = {
  productName: string;
  campaignName: string | null;
} & SelectSales;

export interface MonthlySalesSummary {
  year: number;
  month: number;
  totalRevenue: number;
  totalUnits: number;
  productSummaries: {
    [productId: number]: {
      productName: string;
      totalRevenue: number;
      totalUnits: number;
      averagePrice: number;
    };
  };
  campaignSummaries: {
    [campaignId: number]: {
      campaignName: string;
      totalRevenue: number;
      totalUnits: number;
    };
  };
}

export async function getSalesData() {
  try {
    const { sales } = await getSales();
    const { products } = await getAllProducts();
    const { campaigns } = await getCampaigns();

    const productMap = products.reduce(
      (
        acc: { [x: string]: string },
        product: { id: string | number; name: string }
      ) => {
        acc[product.id] = product.name as string;
        return acc;
      },
      {}
    );

    const campaignMap = campaigns.reduce(
      (
        acc: { [x: string]: any },
        campaign: { id: string | number; name: any }
      ) => {
        acc[campaign.id] = campaign.name;
        return acc;
      },
      {}
    );

    const salesWithDetails = sales.map((sale: SelectSales) => ({
      ...sale,
      productName: sale.productId
        ? productMap[sale.productId]
        : 'Unknown Product',
      campaignName: sale.campaignId ? campaignMap[sale.campaignId] : null
    })) as SaleWithDetails[];

    // Create salesByMonth structure
    const salesByMonth = salesWithDetails.reduce<
      Record<string, MonthlySalesSummary>
    >((acc, sale) => {
      const date = new Date(sale.saleDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const key = `${year}-${month}`;

      if (!acc[key]) {
        acc[key] = {
          year,
          month,
          totalRevenue: 0,
          totalUnits: 0,
          productSummaries: {},
          campaignSummaries: {}
        };
      }

      const monthlySummary = acc[key];
      const revenue = parseFloat(sale.salePrice) * sale.quantity;

      // Update total summary
      monthlySummary.totalRevenue += revenue;
      monthlySummary.totalUnits += sale.quantity;

      // Update product summary
      if (sale.productId) {
        if (!monthlySummary.productSummaries[sale.productId]) {
          monthlySummary.productSummaries[sale.productId] = {
            productName: sale.productName,
            totalRevenue: 0,
            totalUnits: 0,
            averagePrice: 0
          };
        }

        const productSummary = monthlySummary.productSummaries[sale.productId];
        productSummary.totalRevenue += revenue;
        productSummary.totalUnits += sale.quantity;
        productSummary.averagePrice =
          productSummary.totalRevenue / productSummary.totalUnits;
      }

      // Update campaign summary
      const campaignId = sale.campaignId || 0;
      if (!monthlySummary.campaignSummaries[campaignId]) {
        monthlySummary.campaignSummaries[campaignId] = {
          campaignName: sale.campaignName || 'Non-campaign sales',
          totalRevenue: 0,
          totalUnits: 0
        };
      }

      const campaignSummary = monthlySummary.campaignSummaries[campaignId];
      campaignSummary.totalRevenue += revenue;
      campaignSummary.totalUnits += sale.quantity;

      return acc;
    }, {});

    // Convert the object to an array and sort by date
    const salesByMonthArray = Object.values(salesByMonth).sort(
      (a, b) =>
        new Date(a.year, a.month - 1).getTime() -
        new Date(b.year, b.month - 1).getTime()
    );

    return { salesWithDetails, salesByMonth: salesByMonthArray };
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
}
