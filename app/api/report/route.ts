import { NextResponse } from 'next/server';
import { getSalesData } from '@/lib/salesData';
import OpenAI from 'openai';
import { google } from 'googleapis';
import { authenticate } from '@google-cloud/local-auth';
import { GoogleAuth } from 'google-auth-library';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

const base64EncodedServiceAccount = process.env.BASE64_ENCODED_SERVICE_ACCOUNT;
const decodedServiceAccount = Buffer.from(
  base64EncodedServiceAccount!,
  'base64'
).toString('utf-8');
const credentials = JSON.parse(decodedServiceAccount);

export async function GET() {
  try {
    const { salesByMonth } = await getSalesData();
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `Please generate a sales report from the following JSON structure. The report should have a 1-paragraph summary for the last 30 days at the top, including sales and campaign information, including any trends that you can detect, and then a detailed breakdown of the sales by product and campaign in a table format sorted by revenue. The report should be in markdown format: ${JSON.stringify(
            salesByMonth
          )}`
        }
      ]
    });

    const reportContent = response.choices[0].message.content;

    // Create Google Doc
    const docUrl = await createGoogleDoc(reportContent);

    return NextResponse.json({
      response: reportContent,
      googleDocUrl: docUrl
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

async function createGoogleDoc(content: string): Promise<string> {
  try {
    // Authenticate
    const auth = new GoogleAuth({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
        private_key_id: credentials.private_key_id,
        project_id: credentials.project_id,
        client_secret: credentials.client_secret,
        projectId: credentials.project_id
      },
      scopes: [
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/drive.file'
      ]
    });

    const docs = google.docs({ version: 'v1', auth });
    const drive = google.drive({ version: 'v3', auth });

    // Create a new document
    const createResponse = await docs.documents.create({
      requestBody: {
        title: 'Sales Report'
      }
    });

    const documentId = createResponse.data.documentId;

    if (!documentId) {
      throw new Error('Failed to create document');
    }

    // Update the document with the content
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: content
            }
          }
        ]
      }
    });

    // Set public read permission
    await drive.permissions.create({
      fileId: documentId,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    return `https://docs.google.com/document/d/${documentId}`;
  } catch (error) {
    console.error('Error creating Google Doc:', error);
    throw error;
  }
}
