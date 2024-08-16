import { NextResponse } from 'next/server';
import { getSalesData } from '@/lib/salesData';
import OpenAI from 'openai';
import { google } from 'googleapis';
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
          content: `${process.env.OPENAI_PROMPT} ${JSON.stringify(
            salesByMonth
          )}`
        }
      ]
    });

    const reportContent = response.choices[0].message.content;

    // Create Google Doc
    const docUrl = await createGoogleDoc(reportContent!);

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

    // Parse the content
    const lines = content.split('\n');
    let requests: any[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    for (const line of lines) {
      if (line.trim() === '[TABLE]') {
        inTable = true;
        continue;
      }

      if (inTable) {
        if (line.trim() === '') {
          // Empty line marks the end of the table
          inTable = false;

          // Insert the table
          if (tableRows.length > 0) {
            requests.push({
              insertTable: {
                rows: tableRows.length,
                columns: tableRows[0].length,
                endOfSegmentLocation: { segmentId: '' }
              }
            });

            tableRows.forEach((row, rowIndex) => {
              row.forEach((cell, cellIndex) => {
                requests.push({
                  insertText: {
                    endOfSegmentLocation: { segmentId: '' },
                    text:
                      cell.trim() + (cellIndex === row.length - 1 ? '\n' : '')
                  }
                });
                if (rowIndex === 0) {
                  // Bold the header row
                  requests.push({
                    updateTextStyle: {
                      range: {
                        startIndex: 1,
                        endIndex: 2
                      },
                      textStyle: { bold: true },
                      fields: 'bold'
                    }
                  });
                }
              });
            });

            tableRows = [];
          }
        } else {
          // Add row to the table
          tableRows.push(
            line
              .split('|')
              .map((cell) => cell.trim())
              .filter((cell) => cell !== '')
          );
        }
      } else if (line.startsWith('# ')) {
        // Heading 1
        requests.push({
          insertText: {
            endOfSegmentLocation: { segmentId: '' },
            text: line.substring(2) + '\n'
          }
        });
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: 1,
              endIndex: 2
            },
            paragraphStyle: {
              namedStyleType: 'HEADING_1'
            },
            fields: 'namedStyleType'
          }
        });
      } else if (line.startsWith('## ')) {
        // Heading 2
        requests.push({
          insertText: {
            endOfSegmentLocation: { segmentId: '' },
            text: line.substring(3) + '\n'
          }
        });
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: 1,
              endIndex: 2
            },
            paragraphStyle: {
              namedStyleType: 'HEADING_2'
            },
            fields: 'namedStyleType'
          }
        });
      } else if (line.startsWith('### ')) {
        // Heading 3
        requests.push({
          insertText: {
            endOfSegmentLocation: { segmentId: '' },
            text: line.substring(3) + '\n'
          }
        });
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: 1,
              endIndex: 2
            },
            paragraphStyle: {
              namedStyleType: 'HEADING_3'
            },
            fields: 'namedStyleType'
          }
        });
      } else {
        // Normal text
        requests.push({
          insertText: {
            endOfSegmentLocation: { segmentId: '' },
            text: line + '\n'
          }
        });
      }
    }

    // Update the document with the formatted content
    await docs.documents.batchUpdate({
      documentId,
      requestBody: { requests }
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
