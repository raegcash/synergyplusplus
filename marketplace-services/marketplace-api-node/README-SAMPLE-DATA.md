# Adding Sample Partner Assets

## Quick Start

To add sample partner-submitted assets for testing the Partner Asset Requests feature:

```bash
# From the project root
cd superapp-ecosystem/marketplace-services/marketplace-api-node

# Run the script
node add-sample-partner-assets.js
```

## What This Does

Adds 6 sample partner-submitted assets:
- 3 Crypto assets (BTC, ETH, SOL) via TechInvest Corp
- 2 Stock assets (TSLA, NVDA) via Global Securities  
- 1 UITF asset (BPI Balanced Fund) via Acme Financial

All assets will have status `PENDING_APPROVAL` and can be reviewed at:
**http://localhost:3000/assets/partner-requests**

## Requirements

- At least one APPROVED/ACTIVE product in the database
- At least one APPROVED/ACTIVE partner in the database
- The marketplace API must be running

## Output Example

```
✅ Connected to SQLite database
📊 Adding sample partner-submitted assets...
✅ Added: Bitcoin (BTC) - PARTNER_API
✅ Added: Ethereum (ETH) - PARTNER_API
✅ Added: Solana (SOL) - PARTNER_API
✅ Added: Tesla, Inc. (TSLA) - PARTNER_API
✅ Added: NVIDIA Corporation (NVDA) - PARTNER_API
✅ Added: BPI Balanced Fund (BPI-BALANCED) - PARTNER_API
🎉 Sample assets added successfully!
```

## Troubleshooting

**"No products or partners found"**
- Create and approve at least one product first
- Create and approve at least one partner first

**"Already exists"**
- The script skips assets that already exist
- To re-run, delete existing assets first or use different codes

## For More Details

See: `docs/02-features/✅-SAMPLE-PARTNER-ASSETS-ADDED.md`

