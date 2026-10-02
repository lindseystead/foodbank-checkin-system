# Data flow

```
Link2Feed CSV export (primary)  ─┐
Link2Feed API sync (optional)  ──┼─► API ingest ─► unified records (tenant-scoped)
Manual / kiosk check-in        ─┘         │
                                          ▼
                    Admin dashboard ◄─────┤
                    Print ticket          │
                    Reports / HungerCount ┘
                                          │
                    Client kiosk ─────────┘ (lookup + special requests + confirmation)
```

Day-of appointment payloads expire after about 24 hours. Client profiles and volunteer records are stored separately.

Link2Feed CSV vs optional API detail: [`link2feed-integration.md`](link2feed-integration.md).
