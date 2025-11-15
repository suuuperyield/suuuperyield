# SuperYield - Hackathon TODO List
**Deadline**: Tomorrow 3:30 PM
**Status**: URGENT - ~24 hours remaining

---

## ✅ PROGRESS UPDATE (Current Status)

### What We've Completed:
1. ✅ **Environment Setup** - All API keys configured (.env.local created)
2. ✅ **BoringVault Installed** - Dependencies ready
3. ✅ **Smart Contracts Written** - All 4 core contracts complete:
   - SuperYieldVault.sol (inherits BoringVault, 5 GlueX vaults whitelisted)
   - StrategyManager.sol (allocation logic with role-based access)
   - DepositTeller.sol (user deposit/withdraw interface)
   - YieldAccountant.sol (share pricing & yield tracking)
4. ✅ **Deployment Script** - DeploySuperYield.s.sol ready
5. ✅ **All Contracts Compiled** - No errors
6. 🔄 **GlueX API Service Started** - Basic integration file created

### What's Left:
- Deploy contracts to testnet
- Complete GlueX API integration
- Build AI agent
- Create frontend UI
- Write README & record demo

---

## CRITICAL PATH (Must Complete for Submission)

### Phase 1: Foundation & Setup ✅ COMPLETED

#### Environment Setup ✅
- [x] **Register at GlueX Portal** - API Key & PID in .env.local
- [x] **Set up Privy Auth** - App ID configured
- [x] **Get AI API Key** - OpenAI & Gemini keys ready
- [x] **Create Agent Wallet** - Private key in .env.local
- [x] **Project Dependencies** - BoringVault & OpenZeppelin installed

---

### Phase 2: Smart Contracts ✅ MOSTLY COMPLETE

#### Core Contracts ✅ DONE
- [x] **SuperYieldVault.sol** - Inherits BoringVault, 5 GlueX vaults whitelisted
- [x] **StrategyManager.sol** - Allocation logic with Auth-based access control
- [x] **DepositTeller.sol** - User deposit/withdraw interface
- [x] **YieldAccountant.sol** - Share pricing & yield tracking
- [x] **DeploySuperYield.s.sol** - Complete deployment script ready

#### Still Needed (Optional - Simplified Approach)
- [ ] **Deploy to Testnet** ⚠️ READY WHEN NEEDED
  ```bash
  cd packages/foundry
  forge script script/DeploySuperYield.s.sol --rpc-url $HYPEREVM_RPC_URL --broadcast --legacy
  ```

---

### Phase 3: Backend Integration (3-4 hours)

#### GlueX API Integration (CRITICAL - 1.5 hours)
- [ ] **Create lib/services/gluex-yields.ts** (45 min)
  - `fetchGlueXYields()` - Call Yields API for all 5 vaults
  - Calculate Sharpe ratios
  - Sort by risk-adjusted return
  - Add error handling

- [ ] **Create lib/services/gluex-router.ts** (45 min)
  - `getRouterQuote()` - Get swap quote
  - `executeReallocation()` - Withdraw → Swap → Deposit
  - Handle vault operations via BoringVault.manage()
  - Add retry logic

#### AI Agent (IMPORTANT - 1.5 hours)
- [ ] **Create lib/agents/yield-optimizer.ts** (60 min)
  - System prompt with optimization rules
  - Structured output schema
  - Validation logic (min TVL, max dilution)
  - Add tracing/logging

- [ ] **Create lib/agents/workflow.ts** (30 min)
  - Execute AI decision on-chain
  - Call vault.manage() with merkle proof
  - Update activity feed
  - Error handling

#### API Routes (CRITICAL - 1 hour)
- [ ] **GET /api/gluex/yields/route.ts** (15 min)
  - Fetch yield opportunities
  - Return sorted list

- [ ] **POST /api/agents/optimize/route.ts** (30 min)
  - Trigger AI agent
  - Execute allocation
  - Stream reasoning trace

- [ ] **GET /api/vault/status/route.ts** (15 min)
  - Fetch vault state (TVL, user shares, APY)

---

### Phase 4: Frontend (2-3 hours)

#### Core Pages (CRITICAL - 1.5 hours)
- [ ] **Update app/layout.tsx** (15 min)
  - Add Privy provider
  - Add theme provider
  - Configure wallet settings

- [ ] **Create app/page.tsx (Landing)** (30 min)
  - Privy login buttons
  - Project description
  - Redirect to /home after auth

- [ ] **Create app/home/page.tsx (Dashboard)** (45 min)
  - Vault overview section
  - Yield opportunities grid
  - Deposit/withdraw forms
  - AI reasoning panel
  - Activity feed

#### Components (IMPORTANT - 1.5 hours)
- [ ] **components/VaultOverview.tsx** (20 min)
  - Display TVL, user shares, current APY
  - Real-time updates

- [ ] **components/YieldOpportunities.tsx** (20 min)
  - Grid of GlueX vaults
  - Show APY, diluted APY, TVL, Sharpe
  - "Optimize" button

- [ ] **components/DepositWithdraw.tsx** (30 min)
  - Deposit form with amount input
  - Withdraw form with max button
  - Transaction handling

- [ ] **components/AIReasoningPanel.tsx** (20 min)
  - SSE connection to activity stream
  - Display last 8 reasoning lines
  - Fade animations

---

### Phase 5: Documentation & Demo (1-2 hours)

#### README (CRITICAL - 30 min)
- [ ] **Write comprehensive README.md**
  - Project description
  - Architecture diagram
  - Setup instructions
  - Environment variables
  - Deployment guide
  - How to run locally
  - Live demo link (if deployed)

#### Demo Video (CRITICAL - 60 min)
- [ ] **Record demo video (≤3 minutes)**
  - Script outline:
    1. Introduction (20s) - "SuperYield is an AI-powered yield optimizer..."
    2. Deposit flow (30s) - Show user depositing funds
    3. Yield opportunities (30s) - Display GlueX vaults with APYs
    4. AI optimization (60s) - Click "Optimize", show reasoning, execution
    5. Results (20s) - Show funds reallocated, new APY
  - Use Loom or QuickTime
  - Upload to YouTube/Loom
  - Add link to README

#### Final Polish (30 min)
- [ ] **Test end-to-end on testnet**
  - Fresh wallet deposit
  - Trigger optimization
  - Verify reallocation
  - Withdraw funds

- [ ] **Code cleanup**
  - Remove console.logs
  - Add comments
  - Fix linting errors

- [ ] **GitHub prep**
  - Commit all changes
  - Write clear commit messages
  - Push to GitHub
  - Make repo public (or grant access to judges)

---

## OPTIONAL (If Time Permits)

### Nice-to-Have Features (Pick 1-2 max)
- [ ] **Activity Feed with SSE streaming**
  - `/api/activity/stream/route.ts`
  - Real-time transaction updates
  - Progressive animations

- [ ] **Multiple yield sources** (beyond GlueX)
  - Integrate Aave v3
  - Show combined opportunities

- [ ] **Mobile responsive design**
  - Test on mobile
  - Adjust breakpoints

- [ ] **Dark mode toggle**
  - Already have theme provider
  - Add toggle button

---

## SUBMISSION CHECKLIST (3:30 PM Tomorrow)

### Required Deliverables
- [ ] **GitHub repository**
  - Public OR private with access granted to:
    - Felix (GlueX)
    - Fernando (Chorus One)
  - Repo URL: _______________

- [ ] **README.md with setup instructions**
  - Clear installation steps
  - Environment variables documented
  - How to run locally
  - Deployed demo link (optional)

- [ ] **Demo video (≤3 minutes)**
  - Uploaded to YouTube/Loom
  - Link in README
  - Shows all 4 requirements working

### Acceptance Criteria Verification
- [ ] ✅ **ERC-7540/BoringVault**: Vault contracts deployed
- [ ] ✅ **GlueX Yields API**: Shows APY for all 5 vaults
- [ ] ✅ **GlueX Router API**: Executes reallocations
- [ ] ✅ **GlueX Vaults Whitelisted**: All 5 addresses in contract

### Quality Checks
- [ ] All contracts verified on block explorer
- [ ] Frontend deployed (Vercel/Netlify) OR localhost instructions
- [ ] No hardcoded secrets in repo
- [ ] Demo video clearly shows functionality
- [ ] README has contact info

---

## TIMELINE (24 Hours)

### Hour 0-3 (NOW - 3 hours)
**Phase 1**: Environment setup + Dependencies
- Get all API keys
- Install dependencies
- Set up .env.local

### Hour 3-7 (4 hours)
**Phase 2**: Smart Contracts
- Write contracts
- Deploy to testnet
- Verify on explorer

### Hour 7-11 (4 hours)
**Phase 3**: Backend
- GlueX API integration
- AI agent implementation
- API routes

### Hour 11-14 (3 hours)
**Phase 4**: Frontend
- Core pages
- Components
- Styling

### Hour 14-16 (2 hours)
**Phase 5**: Documentation & Demo
- README
- Demo video
- Testing

### Hour 16-18 (2 hours)
**Buffer**: Final polish, bug fixes, submission prep

### Hour 18-24 (6 hours)
**Sleep/Break** (Be fresh for final submission)

### Final 3 hours before 3:30 PM
- Final testing
- Deploy frontend
- Upload demo video
- Submit!

---

## RISK MITIGATION

### If Running Behind Schedule

**Cut in this order:**
1. ❌ Cut first: Activity feed SSE streaming (use simple list)
2. ❌ Cut second: Multiple AI providers (use OpenAI only)
3. ❌ Cut third: Fancy animations (basic UI is fine)
4. ❌ Cut fourth: Redis (use in-memory)
5. ⚠️ NEVER CUT: The 4 core requirements!

### Minimum Viable Submission
If you have only 8 hours left:
1. **Smart contracts** (2 hours)
   - Deploy BoringVault with GlueX whitelist
   - Skip merkle trees, use simple role-based access

2. **Backend** (2 hours)
   - Manual GlueX API integration (no AI)
   - Simple API route to fetch yields
   - Manual "reallocate" button calls Router API

3. **Frontend** (2 hours)
   - Basic deposit/withdraw UI
   - Show GlueX yields in table
   - Manual reallocation button

4. **Documentation** (2 hours)
   - README with clear setup
   - Simple screen recording demo

This still meets all 4 requirements!

---

## CONTACTS & RESOURCES

### Get Help
- **GlueX Telegram**: https://t.me/+6NrwSlEPAsA3MzE0
- **GlueX Discord**: Ask technical questions
- **Mentor**: Fernando (Chorus One) - reach out if stuck

### Quick References
- **GlueX Docs**: https://docs.gluex.xyz
- **BoringVault Repo**: https://github.com/Se7en-Seas/boring-vault
- **AJEY Reference**: /Users/user/SuperFranky/AJEY
- **Hackathon Plan**: /Users/user/SuperFranky/suuuperyield/HACKATHON_PLAN.md

### Testnet Resources
- **HyperEVM Faucet**: [Get testnet tokens]
- **Block Explorer**: [Verify contracts]

---

## MOTIVATION

**Prize**: $3,000 (Winner takes all)
**Judge**: Felix from GlueX

**What they're looking for**:
1. ✅ All 4 requirements working
2. ✅ Good user experience
3. ✅ Creative implementation
4. ✅ Complete demo

**Your advantages**:
- You have AJEY as reference (AI agent architecture)
- You have BoringVault proven pattern
- You have comprehensive plan
- You understand the requirements

**You got this! 🚀**

Start with Phase 1 NOW. Get those API keys and set up your environment. The rest will flow from there.

---

## DAILY CHECKPOINT

### End of Today
- [ ] All API keys obtained
- [ ] Smart contracts deployed to testnet
- [ ] Basic backend API working
- [ ] Can fetch GlueX yields

### Tomorrow Morning
- [ ] Frontend UI functional
- [ ] Can deposit/withdraw
- [ ] Can trigger reallocation

### Tomorrow Afternoon (Before 3:30 PM)
- [ ] Demo video recorded
- [ ] README complete
- [ ] Repo submitted
- [ ] ✅ DONE!

---

---

## 👥 TEAM TASK DIVISION

### 🎯 Person A (You) - Backend & Integration Focus
**Priority**: Get the data flowing and AI working

1. **Backend API Routes** (2-3 hours)
   - [ ] Create `/api/gluex/yields/route.ts` - Fetch vault yields
   - [ ] Create `/api/agents/optimize/route.ts` - Trigger AI optimization
   - [ ] Create `/api/vault/status/route.ts` - Get vault state
   - [ ] Create AI agent in `services/ai/yield-optimizer.ts`
   - [ ] Complete GlueX API service (already started)

2. **Smart Contract Deployment** (30 min)
   - [ ] Deploy contracts to HyperEVM testnet
   - [ ] Update `.env.local` with deployed addresses
   - [ ] Test basic contract interactions

3. **Integration Testing** (1 hour)
   - [ ] Test GlueX Yields API connection
   - [ ] Test AI agent decision making
   - [ ] Test contract calls from backend
   - [ ] Document any issues for teammate

**Files You'll Create**:
- `packages/nextjs/app/api/gluex/yields/route.ts`
- `packages/nextjs/app/api/agents/optimize/route.ts`
- `packages/nextjs/app/api/vault/status/route.ts`
- `packages/nextjs/services/ai/yield-optimizer.ts`
- Complete `packages/nextjs/services/gluex/api.ts` (already started)

---

### 🎨 Person B (Teammate) - Frontend & UX Focus
**Priority**: Make it look good and be usable

1. **Core Pages & Layout** (2-3 hours)
   - [ ] Update `app/layout.tsx` - Add Privy provider
   - [ ] Update `app/page.tsx` - Landing page with login
   - [ ] Create `app/dashboard/page.tsx` - Main vault dashboard

2. **UI Components** (2-3 hours)
   - [ ] `components/VaultOverview.tsx` - Show TVL, APY, user balance
   - [ ] `components/YieldOpportunities.tsx` - Grid of GlueX vaults
   - [ ] `components/DepositWithdraw.tsx` - Deposit/withdraw forms
   - [ ] `components/AIReasoningPanel.tsx` - Show AI decision process
   - [ ] `components/ActivityFeed.tsx` - Transaction history

3. **Styling & Polish** (1 hour)
   - [ ] Make responsive for mobile
   - [ ] Add loading states
   - [ ] Add error handling UI
   - [ ] Test user flow

**Files You'll Create**:
- `packages/nextjs/app/dashboard/page.tsx`
- `packages/nextjs/components/VaultOverview.tsx`
- `packages/nextjs/components/YieldOpportunities.tsx`
- `packages/nextjs/components/DepositWithdraw.tsx`
- `packages/nextjs/components/AIReasoningPanel.tsx`
- `packages/nextjs/components/ActivityFeed.tsx`

---

### 🤝 Shared Tasks (Both)
**Do together or coordinate**

1. **Demo Preparation** (1-2 hours)
   - [ ] Record demo video (≤3 minutes)
   - [ ] Write comprehensive README.md
   - [ ] Add deployment instructions
   - [ ] Test end-to-end on fresh browser

2. **Final Polish** (30 min)
   - [ ] Remove console.logs
   - [ ] Fix linting errors
   - [ ] Test on testnet with fresh wallet
   - [ ] Prepare submission

---

### 📋 Coordination Checkpoints

**Checkpoint 1** (After 2 hours):
- Person A: "API routes done, AI agent working"
- Person B: "Dashboard page done, can show mock data"
- Together: Connect frontend to real APIs

**Checkpoint 2** (After 4 hours):
- Person A: "Contracts deployed, all APIs tested"
- Person B: "All components done, looks good"
- Together: Full integration testing

**Checkpoint 3** (After 6 hours):
- Both: Demo video script review
- Both: README review
- Both: Final testing & submission prep

---

**Last Updated**: Now (Smart Contracts Complete!)
**Next Action Person A**: Deploy contracts, build API routes
**Next Action Person B**: Build dashboard page & components
**Time Remaining**: ~24 hours

LET'S GO! 🚀
