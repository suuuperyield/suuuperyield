// Simple test for GlueX API
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const API_KEY = process.env.GLUEX_API_KEY;
const BASE_URL = 'https://router.gluex.xyz';

async function simpleTest() {
  console.log('🧪 Simple GlueX API Test');
  console.log('API Key:', API_KEY ? API_KEY.substring(0, 8) + '...' : 'MISSING');

  // Test 1: Check if we can hit the liquidity endpoint
  try {
    console.log('\n1. Testing basic connectivity...');
    const response = await axios.get(`${BASE_URL}/liquidity`, {
      headers: {
        'x-api-key': API_KEY,
      },
    });
    console.log('✅ Liquidity endpoint accessible');
    console.log('Chains available:', Object.keys(response.data.chains || {}));
  } catch (error) {
    console.error('❌ Connectivity test failed:', error.message);
    return;
  }

  // Test 2: Try the most minimal price request
  try {
    console.log('\n2. Testing minimal price request...');
    const minimalRequest = {
      inputToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      outputToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
      inputAmount: '1000000', // 1 USDC
      chainID: 'ethereum',
    };

    const response = await axios.post(`${BASE_URL}/v1/price`, minimalRequest, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Price request successful!');
    console.log('Output amount:', response.data.outputAmount);
  } catch (error) {
    console.log('❌ Price request failed:', error.response?.status, error.response?.statusText);
    if (error.response?.data?.errors) {
      console.log('Validation errors:', error.response.data.errors);
    }
  }

  // Test 3: Try with different chain format
  try {
    console.log('\n3. Testing with networkID instead of chainID...');
    const networkRequest = {
      inputToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      outputToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
      inputAmount: '1000000', // 1 USDC
      networkID: 1, // Ethereum mainnet
    };

    const response = await axios.post(`${BASE_URL}/v1/price`, networkRequest, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ NetworkID format works!');
    console.log('Output amount:', response.data.outputAmount);
  } catch (error) {
    console.log('❌ NetworkID request failed:', error.response?.status, error.response?.statusText);
  }
}

simpleTest().catch(console.error);