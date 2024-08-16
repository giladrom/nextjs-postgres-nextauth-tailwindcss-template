'use client';

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProductSummary {
  productName: string;
  totalRevenue: number;
  totalUnits: number;
  averagePrice: number;
}

interface CampaignSummary {
  campaignName: string;
  totalRevenue: number;
  totalUnits: number;
}

interface MonthlySalesSummary {
  year: number;
  month: number;
  totalRevenue: number;
  totalUnits: number;
  productSummaries: { [productId: string]: ProductSummary };
  campaignSummaries: { [campaignId: string]: CampaignSummary };
}

const SalesDashboard: React.FC = () => {
  const [salesData, setSalesData] = useState<MonthlySalesSummary[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState({ labels: [], data: [] });
  const [campaignPerformance, setCampaignPerformance] = useState<any[]>([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('/api/sales');
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
        const data = await response.json();
        setSalesData(data.sales);
        processData(data.sales);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    fetchSalesData();
  }, []);

  const processData = (data: MonthlySalesSummary[]) => {
    if (data.length === 0) return;

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Filter data for the last 30 days
    const last30DaysData = data.filter(month => {
      const monthDate = new Date(month.year, month.month - 1);
      return monthDate >= thirtyDaysAgo && monthDate <= today;
    });

    // Calculate totals
    const totals = last30DaysData.reduce((acc, month) => {
      acc.totalSales += month.totalRevenue;
      acc.totalQuantity += month.totalUnits;
      return acc;
    }, { totalSales: 0, totalQuantity: 0 });

    setTotalSales(totals.totalSales);
    setTotalQuantity(totals.totalQuantity);

    // Calculate best sellers
    const productSummaries = last30DaysData.reduce((acc, month) => {
      Object.entries(month.productSummaries).forEach(([productId, product]) => {
        if (!acc[productId]) {
          acc[productId] = { ...product, totalRevenue: 0, totalUnits: 0 };
        }
        acc[productId].totalRevenue += product.totalRevenue;
        acc[productId].totalUnits += product.totalUnits;
      });
      return acc;
    }, {} as { [productId: string]: ProductSummary });

    const sortedProducts = Object.entries(productSummaries)
      .sort(([, a], [, b]) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(([productId, data]) => ({
        productId,
        productName: data.productName,
        quantity: data.totalUnits,
        revenue: data.totalRevenue,
      }));

    setBestSellers(sortedProducts);

    // Calculate campaign performance
    const campaignSummaries = last30DaysData.reduce((acc, month) => {
      Object.entries(month.campaignSummaries).forEach(([campaignId, campaign]) => {
        if (!acc[campaignId]) {
          acc[campaignId] = { ...campaign, totalRevenue: 0, totalUnits: 0 };
        }
        acc[campaignId].totalRevenue += campaign.totalRevenue;
        acc[campaignId].totalUnits += campaign.totalUnits;
      });
      return acc;
    }, {} as { [campaignId: string]: CampaignSummary });

    const campaignData = Object.entries(campaignSummaries)
      .map(([campaignId, data]) => ({
        name: data.campaignName,
        sales: data.totalUnits,
        revenue: data.totalRevenue,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    setCampaignPerformance(campaignData);

    // Calculate revenue over time (last 30 days)
    const labels = last30DaysData.map(month => `${month.year}-${String(month.month).padStart(2, '0')}`);
    const revenue = last30DaysData.map(month => month.totalRevenue);

    setRevenueData({ labels, data: revenue });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sales Dashboard (Last 30 Days)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Quantity Sold (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalQuantity}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Best Sellers (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity Sold</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestSellers.map((seller, index) => (
                <TableRow key={seller.productId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{seller.productName}</TableCell>
                  <TableCell>{seller.quantity}</TableCell>
                  <TableCell>${seller.revenue.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Campaign Performance (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Total Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaignPerformance.map((campaign) => (
                <TableRow key={campaign.name}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.sales}</TableCell>
                  <TableCell>${Number(campaign.revenue).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* <Card className="mb-6">
        <CardHeader>
          <CardTitle>Revenue (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar
            data={{
              labels: revenueData.labels,
              datasets: [
                {
                  label: 'Revenue',
                  data: revenueData.data,
                  backgroundColor: 'rgba(75, 192, 192, 0.6)',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Revenue (Last 30 Days)',
                },
              },
            }}
          />
        </CardContent>
      </Card> */}
    </div>
  );
};

export default SalesDashboard;