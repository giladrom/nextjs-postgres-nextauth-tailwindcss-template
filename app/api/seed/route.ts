import { db } from 'lib/db';
import { products, sales, campaigns } from 'lib/schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  // return Response.json({
  //   message: 'Uncomment to seed data after DB is set up.'
  // });

  // await db.insert(products).values([
  //   {
  //     id: 1,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/smartphone-gaPvyZW6aww0IhD3dOpaU6gBGILtcJ.webp',
  //     name: 'Smartphone X Pro',
  //     status: 'active',
  //     price: '999.00',
  //     stock: 150,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 2,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/earbuds-3rew4JGdIK81KNlR8Edr8NBBhFTOtX.webp',
  //     name: 'Wireless Earbuds Ultra',
  //     status: 'active',
  //     price: '199.00',
  //     stock: 300,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 3,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/home-iTeNnmKSMnrykOS9IYyJvnLFgap7Vw.webp',
  //     name: 'Smart Home Hub',
  //     status: 'active',
  //     price: '149.00',
  //     stock: 200,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 4,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/tv-H4l26crxtm9EQHLWc0ddrsXZ0V0Ofw.webp',
  //     name: '4K Ultra HD Smart TV',
  //     status: 'active',
  //     price: '799.00',
  //     stock: 50,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 5,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/laptop-9bgUhjY491hkxiMDeSgqb9R5I3lHNL.webp',
  //     name: 'Gaming Laptop Pro',
  //     status: 'active',
  //     price: '1299.00',
  //     stock: 75,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 6,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/headset-lYnRnpjDbZkB78lS7nnqEJFYFAUDg6.webp',
  //     name: 'VR Headset Plus',
  //     status: 'active',
  //     price: '349.00',
  //     stock: 120,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 7,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/watch-S2VeARK6sEM9QFg4yNQNjHFaHc3sXv.webp',
  //     name: 'Smartwatch Elite',
  //     status: 'active',
  //     price: '249.00',
  //     stock: 250,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 8,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/speaker-4Zk0Ctx5AvxnwNNTFWVK4Gtpru4YEf.webp',
  //     name: 'Bluetooth Speaker Max',
  //     status: 'active',
  //     price: '99.00',
  //     stock: 400,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 9,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/charger-GzRr0NSkCj0ZYWkTMvxXGZQu47w9r5.webp',
  //     name: 'Portable Charger Super',
  //     status: 'active',
  //     price: '59.00',
  //     stock: 500,
  //     availableAt: new Date()
  //   },
  //   {
  //     id: 10,
  //     imageUrl:
  //       'https://uwja77bygk2kgfqe.public.blob.vercel-storage.com/thermostat-8GnK2LDE3lZAjUVtiBk61RrSuqSTF7.webp',
  //     name: 'Smart Thermostat Pro',
  //     status: 'active',
  //     price: '199.00',
  //     stock: 175,
  //     availableAt: new Date()
  //   }
  // ]);

  // const productList = await db.select().from(products);
  // const salesData: any = [];

  // for (let i = 0; i < 1000; i++) {
  //   const product = productList[Math.floor(Math.random() * productList.length)];
  //   const quantity = Math.floor(Math.random() * 5) + 1; // Random quantity between 1 and 5
  //   const salePrice = parseFloat(product.price); // Use the product's price
  //   const saleDate = new Date(
  //     new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 180))
  //   ); // Random date within the last 6 months

  //   salesData.push({
  //     productId: product.id,
  //     quantity,
  //     salePrice,
  //     saleDate
  //   });
  // }

  // await db.insert(sales).values(salesData);

  // Seed campaigns
  await db.insert(campaigns).values([
    {
      name: 'Summer Sale',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-08-31'),
      budget: 10000,
      description: 'Annual summer promotional campaign'
    },
    {
      name: 'Back to School',
      startDate: new Date('2024-08-15'),
      endDate: new Date('2024-09-15'),
      budget: 5000,
      description: 'Targeting students and parents for school supplies'
    },
    {
      name: 'Holiday Special',
      startDate: new Date('2023-11-15'),
      endDate: new Date('2023-12-31'),
      budget: 15000,
      description: 'End-of-year holiday promotion'
    }
  ]);

  const productList = await db.select().from(products);
  const campaignList = await db.select().from(campaigns);
  const salesData: any = [];

  for (let i = 0; i < 1000; i++) {
    const product = productList[Math.floor(Math.random() * productList.length)];
    const quantity = Math.floor(Math.random() * 5) + 1;
    const salePrice = parseFloat(product.price);
    const saleDate = new Date(
      new Date().setDate(new Date().getDate() - Math.floor(Math.random() * 180))
    );

    // 80% chance of attributing to a campaign
    const campaign =
      Math.random() < 0.8
        ? campaignList[Math.floor(Math.random() * campaignList.length)]
        : null;

    salesData.push({
      productId: product.id,
      quantity,
      salePrice,
      saleDate,
      campaignId: campaign ? campaign.id : null
    });
  }

  await db.insert(sales).values(salesData);
}
