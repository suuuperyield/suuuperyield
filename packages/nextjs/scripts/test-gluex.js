// Test script for GlueX API integration
const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const API_KEY = process.env.GLUEX_API_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const BASE_URL = 'https://router.gluex.xyz';

// Test wallet address (derived from private key)
const TEST_ADDRESS = '0x8D72d68765083081b7a0faf71bAe06db6726dDe5';

console.log('🚀 Testing GlueX Router API Integration');
console.log('=====================================');

async function testLiquidityModules() {
  console.log('\n1. Testing Liquidity Modules Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/liquidity`, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Liquidity modules fetched successfully');
    console.log('Response type:', typeof response.data);
    console.log('Response structure:', Object.keys(response.data));

    if (Array.isArray(response.data)) {
      console.log(`Found ${response.data.length} liquidity modules`);
      console.log('Sample modules:', response.data.slice(0, 3).map(m => m.name || m.id || m));
    } else if (response.data.chains) {
      console.log(`Found ${Object.keys(response.data.chains).length} chains`);
      const firstChain = Object.keys(response.data.chains)[0];
      console.log(`Sample chain: ${firstChain} with ${response.data.chains[firstChain]?.length || 0} modules`);
    } else {
      console.log('Response:', JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('❌ Error fetching liquidity modules:', error.response?.data || error.message);
  }
}

async function testPriceQuote() {
  console.log('\n2. Testing Price Quote (USDC -> ETH)...');
  try {
    const requestBody = {
      inputToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      outputToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
      inputAmount: '1000000', // 1 USDC (6 decimals)
      chainID: 'ethereum',
      userAddress: TEST_ADDRESS,
      outputReceiver: TEST_ADDRESS,
      uniquePID: 'superyield-optimizer-test',
    };

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(`${BASE_URL}/v1/price`, requestBody, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Price quote fetched successfully');
    console.log('Response keys:', Object.keys(response.data));
    console.log('Input Amount:', response.data.inputAmount);
    console.log('Output Amount:', response.data.outputAmount);
    if (response.data.outputAmount) {
      console.log('Exchange Rate:', (parseFloat(response.data.outputAmount) / 1e18).toFixed(6), 'ETH per USDC');
    }
  } catch (error) {
    console.error('❌ Error fetching price quote:', error.response?.data || error.message);
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testFullQuoteWithCalldata() {
  console.log('\n3. Testing Full Quote with Calldata (USDC -> ETH)...');
  try {
    const requestBody = {
      inputToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
      outputToken: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // ETH
      inputAmount: '1000000', // 1 USDC (6 decimals)
      userAddress: TEST_ADDRESS,
      outputReceiver: TEST_ADDRESS,
      chainID: 'ethereum',
      uniquePID: 'superyield-optimizer-test',
      slippage: 100, // 1% in basis points
    };

    console.log('Quote request body:', JSON.stringify(requestBody, null, 2));

    const response = await axios.post(`${BASE_URL}/v1/quote`, requestBody, {
      headers: {
        'x-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Full quote with calldata fetched successfully');
    console.log('Response keys:', Object.keys(response.data));
    console.log('Transaction To:', response.data.to);
    console.log('Transaction Value:', response.data.value);
    console.log('Gas Estimate:', response.data.gasLimit);
    console.log('Expected Output:', (parseFloat(response.data.outputAmount) / 1e18).toFixed(6), 'ETH');
    console.log('Route Steps:', response.data.steps?.length || 'N/A');
  } catch (error) {
    console.error('❌ Error fetching full quote:', error.response?.data || error.message);
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

async function testOurAPIEndpoints() {
  console.log('\n4. Testing Our API Endpoints...');

  // Test our router endpoint
  try {
    console.log('Testing our router endpoint...');
    const response = await axios.get('http://localhost:3000/api/gluex/router');
    console.log('✅ Our router info endpoint works');
    console.log('Supported tokens:', response.data.supportedTokens?.length);
  } catch (error) {
    console.log('ℹ️  Local server not running, skipping local API tests');
  }
}

async function runAllTests() {
  console.log('API Key:', API_KEY ? '✅ Present' : '❌ Missing');
  console.log('Private Key:', PRIVATE_KEY ? '✅ Present' : '❌ Missing');
  console.log('Test Address:', TEST_ADDRESS);

  await testLiquidityModules();
  await testPriceQuote();
  await testFullQuoteWithCalldata();
  await testOurAPIEndpoints();

  console.log('\n🎉 GlueX API Testing Complete!');
}

// Run the tests
runAllTests().catch(console.error);