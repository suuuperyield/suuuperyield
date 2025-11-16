# GlueX Integration Plan for SuperYield

## Current State vs. Required State

### Current Implementation
- SuperYieldVault accepts **ETH deposits**
- Mock yield opportunities showing USDC vaults
- AI optimization running but mismatch between deposit asset (ETH) and target vaults (USDC)

### GlueX Requirements
Based on `gluexllm.txt` documentation:

1. **Yield API** (`https://yield-api.gluex.xyz`)
   - Provides diluted APY calculations for USDC/stablecoin vaults
   - Endpoints: `/diluted-apy`, `/historical-apy`, `/tvl`
   - Works across 17+ chains including `hyperevm`

2. **Router API** (`https://router.gluex.xyz`)
   - Performs swaps, bridging, lending, staking, zaps
   - Can do "vault entry" in one transaction
   - Accepts USDC and routes to yield vaults

3. **Authentication**
   - API Key (x-api-key header): `XYSzoBEgRQz0in19QSGgruzMCNAY6n0N`
   - Integrator ID (uniquePID in body): Need from GlueX Portal

## Integration Options

### Option A: USDC-Only Vault (Simpler)
**Flow:**
1. User deposits USDC → SuperYieldVault
2. AI analyzes USDC yield opportunities via GlueX Yield API
3. StrategyManager allocates USDC to best GlueX vault
4. Use GlueX Router API for vault entry

**Pros:**
- Clean architecture
- No swap complexity
- Matches GlueX use case

**Cons:**
- Users must hold USDC
- Need USDC contracts on HyperEVM

### Option B: ETH with Auto-Swap (More Complex)
**Flow:**
1. User deposits ETH → SuperYieldVault
2. Vault swaps ETH → USDC via GlueX Router
3. AI analyzes USDC yield opportunities
4. Allocate USDC to best yield vault

**Pros:**
- Better UX (users can deposit ETH)
- More flexible

**Cons:**
- Additional swap step
- More gas costs
- Swap slippage

## Recommended Approach: Hybrid

For the **hackathon demo**, use this flow:

### 1. Frontend: Show Both Assets
```tsx
// Deposit section
<select>
  <option value="ETH">ETH (will swap to USDC)</option>
  <option value="USDC">USDC (direct deposit)</option>
</select>
```

### 2. Fetch Real GlueX Yield Opportunities
```typescript
// New endpoint: /api/gluex/yields
async function fetchGlueXYields() {
  const response = await fetch('https://yield-api.gluex.xyz/diluted-apy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chainID: 'hyperevm',
      poolAddress: '0x...', // USDC vault address
      amount: '1000000', // 1 USDC (6 decimals)
    })
  });

  return response.json();
}
```

### 3. AI Agent: Optimize for USDC Vaults
- Fetch real GlueX opportunities for USDC on HyperEVM
- AI decides best allocation
- Return vault address + amount

### 4. Execution: GlueX Router for Vault Entry
```typescript
// Use GlueX Router API to enter vault
const quote = await fetch('https://router.gluex.xyz/v1/quote', {
  method: 'POST',
  headers: {
    'x-api-key': 'XYSzoBEgRQz0in19QSGgruzMCNAY6n0N',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chainID: 'hyperevm',
    inputToken: '0x...USDC',
    outputToken: '0x...VaultToken',
    inputAmount: '1000000',
    userAddress: address,
    uniquePID: 'your-integrator-id', // Get from GlueX Portal
  })
});
```

## Implementation Steps

### Step 1: Create GlueX Service
**File:** `packages/nextjs/lib/gluex/gluexService.ts`
- Function to fetch diluted APY
- Function to get vault TVL
- Function to execute vault entry

### Step 2: Update Yield Opportunities
**File:** `packages/nextjs/app/api/gluex/yields/route.ts`
- Fetch real USDC yield opportunities from GlueX
- Return formatted opportunities for AI agent

### Step 3: Update AI Agent
**File:** `packages/nextjs/lib/ai/openai-agent.ts`
- Accept USDC vaults instead of ETH
- Consider swap costs if depositing ETH

### Step 4: Update Frontend
**File:** `packages/nextjs/app/superyield/page.tsx`
- Add USDC/ETH toggle
- Show real GlueX opportunities
- Execute via GlueX Router

## Demo Flow (Simplified for Hackathon)

For tomorrow's demo, we can:

1. **Mock the deposit** - Show deposit UI but don't require real USDC
2. **Fetch real GlueX data** - Use Yield API to show real APYs
3. **AI optimization** - GPT-4o analyzes real opportunities
4. **Show execution plan** - Display what would be executed via Router API
5. **Bonus**: If time allows, execute one test transaction on testnet

## Next Steps

1. Get GlueX Integrator ID from portal
2. Create GlueX service functions
3. Fetch real yield opportunities
4. Update UI to reflect USDC focus
5. Test end-to-end flow

## Questions to Resolve

- [ ] Do we have a USDC contract on HyperEVM mainnet?
- [ ] What's our GlueX uniquePID (integrator ID)?
- [ ] Should we deploy a new USDC-focused vault or keep ETH vault?
- [ ] For demo: Mock or real transactions?
