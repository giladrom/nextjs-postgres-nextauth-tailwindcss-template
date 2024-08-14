'use client';

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const SalesDashboard: React.FC = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [bestSellers, setBestSellers] = useState([]);
  const [revenueData, setRevenueData] = useState({ labels: [], data: [] });
  const [campaignPerformance, setCampaignPerformance] = useState([]);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const response = await fetch('/api/sales');
        if (!response.ok) {
          throw new Error('Failed to fetch sales data');
        }
        const { sales } = await response.json();
        setSalesData(sales);
        calculateTotals(sales);
        calculateBestSellers(sales);
        calculateRevenueOverTime(sales);
        calculateCampaignPerformance(sales);
      } catch (error) {
        console.error('Error fetching sales data:', error);
        // Handle error (e.g., show error message to user)
      }
    };

    fetchSalesData();
  }, []);

  const calculateTotals = (data) => {
    const total = data.reduce((acc, sale) => acc + sale.salePrice * sale.quantity, 0);
    const quantity = data.reduce((acc, sale) => acc + sale.quantity, 0);
    setTotalSales(total);
    setTotalQuantity(quantity);
  };

  const calculateBestSellers = (data) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentSales = data.filter(sale => new Date(sale.saleDate) >= thirtyDaysAgo);

    const productSales = recentSales.reduce((acc, sale) => {
      const key = `${sale.productId}-${sale.productName}`;
      if (!acc[key]) {
        acc[key] = { quantity: 0, revenue: 0, campaigns: {} };
      }
      acc[key].quantity += sale.quantity;
      acc[key].revenue += sale.salePrice * sale.quantity;
      
      // Track sales by campaign
      const campaignName = sale.campaignName || 'Organic';
      if (!acc[key].campaigns[campaignName]) {
        acc[key].campaigns[campaignName] = { quantity: 0, revenue: 0 };
      }
      acc[key].campaigns[campaignName].quantity += sale.quantity;
      acc[key].campaigns[campaignName].revenue += sale.salePrice * sale.quantity;
      
      return acc;
    }, {});

    const sortedSellers = Object.entries(productSales)
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .slice(0, 5)
      .map(([key, data]) => {
        const [productId, productName] = key.split('-');
        const topCampaign = Object.entries(data.campaigns)
          .sort(([, a], [, b]) => b.revenue - a.revenue)[0];
        return { 
          productId, 
          productName, 
          quantity: data.quantity, 
          revenue: data.revenue,
          topCampaign: topCampaign[0],
          topCampaignRevenue: topCampaign[1].revenue,
          topCampaignQuantity: topCampaign[1].quantity
        };
      });

    setBestSellers(sortedSellers);
  };

  const calculateRevenueOverTime = (data) => {
    const revenueMap = data.reduce((acc, sale) => {
      const date = new Date(sale.saleDate);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthYear] = (acc[monthYear] || 0) + sale.salePrice * sale.quantity;
      return acc;
    }, {});

    const labels = Object.keys(revenueMap).sort();
    const revenue = labels.map(label => revenueMap[label]);

    setRevenueData({ labels, data: revenue });
  };

  const calculateCampaignPerformance = (data) => {
    console.log(data);
    
    const campaignData = data.reduce((acc, sale) => {
      if (sale.campaignId) {
        if (!acc[sale.campaignId]) {
          acc[sale.campaignId] = { name: sale.campaignName, sales: 0, revenue: 0 };
        }
        acc[sale.campaignId].sales += sale.quantity;
        acc[sale.campaignId].revenue += sale.salePrice * sale.quantity;
      }
      return acc;
    }, {});

    setCampaignPerformance(Object.values(campaignData).sort((a, b) => b.revenue - a.revenue));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Sales Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalSales.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Quantity Sold</CardTitle>
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
                <TableHead>Top Campaign</TableHead>
                <TableHead>Campaign Revenue</TableHead>
                <TableHead>Campaign Quantity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bestSellers.map((seller, index) => (
                <TableRow key={seller.productId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{seller.productName}</TableCell>
                  <TableCell>{seller.quantity}</TableCell>
                  <TableCell>${seller.revenue.toFixed(2)}</TableCell>
                  <TableCell>{seller.topCampaign}</TableCell>
                  <TableCell>${seller.topCampaignRevenue.toFixed(2)}</TableCell>
                  <TableCell>{seller.topCampaignQuantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
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

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
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
                  text: 'Monthly Revenue',
                },
              },
            }}
          />
        </CardContent>
      </Card>

    
      {/* We do not need a detailed sales data table for now.   */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Sales Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Sale Date</TableHead>
                <TableHead>Campaign</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.productName}</TableCell>
                  <TableCell>{sale.quantity}</TableCell>
                  <TableCell>${Number(sale.salePrice).toFixed(2)}</TableCell>
                  <TableCell>{new Date(sale.saleDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {sale.campaignName || 'Organic'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default SalesDashboard;