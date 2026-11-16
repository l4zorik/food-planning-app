# Monthly subscriptions: prepared boundary

Current implementation provides three plan definitions, monthly period, preferred-plan selection and a settings dialog. Prices are intentionally not set. Existing features remain available. `subscription.activePlan` remains `free` and `paymentStatus` remains `not-connected`; editing a preference never grants a paid entitlement or charges money.

The next integration requires an authenticated billing service. Keep provider secrets on that service, never in the Electron renderer or distributable application. The desktop app sends a selected plan ID and opens a checkout URL returned by that service. Do not accept client prices, client customer IDs, or a locally asserted paid status as authorization.

Gateway boundary to implement later:

1. Authenticated account and server-owned customer mapping.
2. Server-created monthly checkout session for a configured price ID.
3. Verified, signed and idempotent payment webhooks.
4. Server-side subscription status, renewal, cancellation and entitlement records.
5. Authenticated entitlement reads, authorization for hosted features and customer billing portal.
6. Failure, cancellation, refund and expired-session handling.

No checkout endpoint, card entry, payment SDK, API key or webhook secret is present in this preparation. The preference is a product planning setting, not a real subscription. Activation must be added through the trusted backend instead of relaxing local JSON validation alone.
