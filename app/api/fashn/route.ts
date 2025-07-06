import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.FASHN_API_KEY;
const API_BASE_URL = 'https://api.fashn.ai/v1';

export async function POST(request: NextRequest) {
  try {
    if (!API_KEY) {
      console.error('FASHN_API_KEY environment variable not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const endpoint = request.nextUrl.searchParams.get('endpoint');
    
    if (endpoint === 'run') {
      // Start a new prediction
      const requestData = await request.json();
      
      console.log('Starting FASHN prediction with data:', {
        model_name: requestData.model_name,
        inputs: {
          model_image: requestData.inputs?.model_image ? `[data URI ${requestData.inputs.model_image.length} chars]` : 'MISSING',
          garment_image: requestData.inputs?.garment_image ? `[data URI ${requestData.inputs.garment_image.length} chars]` : 'MISSING'
        }
      });

      const response = await fetch(`${API_BASE_URL}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('FASHN API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        return NextResponse.json(
          { error: data.message || data.error || 'API request failed' },
          { status: response.status }
        );
      }

      console.log('FASHN prediction started successfully:', data);
      return NextResponse.json(data);

    } else if (endpoint === 'status') {
      // Check prediction status
      const predictionId = request.nextUrl.searchParams.get('id');
      
      if (!predictionId) {
        return NextResponse.json(
          { error: 'Prediction ID is required' },
          { status: 400 }
        );
      }

      console.log('Checking status for prediction:', predictionId);

      const response = await fetch(`${API_BASE_URL}/status/${predictionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('FASHN Status API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        return NextResponse.json(
          { error: data.message || data.error || 'Status check failed' },
          { status: response.status }
        );
      }

      console.log('FASHN status check result:', data);
      return NextResponse.json(data);

    } else {
      return NextResponse.json(
        { error: 'Invalid endpoint. Use "run" or "status"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('FASHN API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle status checks via GET requests as well
  const endpoint = request.nextUrl.searchParams.get('endpoint');
  const predictionId = request.nextUrl.searchParams.get('id');
  
  if (endpoint === 'status' && predictionId) {
    try {
      if (!API_KEY) {
        return NextResponse.json(
          { error: 'API key not configured' },
          { status: 500 }
        );
      }

      console.log('GET: Checking status for prediction:', predictionId);

      const response = await fetch(`${API_BASE_URL}/status/${predictionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('FASHN Status API Error:', {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        return NextResponse.json(
          { error: data.message || data.error || 'Status check failed' },
          { status: response.status }
        );
      }

      return NextResponse.json(data);

    } catch (error) {
      console.error('FASHN Status Check Error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    { error: 'Invalid GET request. Use endpoint=status&id=prediction_id' },
    { status: 400 }
  );
} 