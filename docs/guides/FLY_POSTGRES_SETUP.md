# 🪰 Fly.io Postgres Setup Guide for Vercel

This guide helps you set up a cost-effective PostgreSQL cluster on Fly.io that can be accessed by Vercel.

## Prerequisites
- Fly CLI installed (`winget install flyctl`)
- Logged in (`fly auth login`)

## 1. Create the Postgres Cluster

Run this command to create a standard, single-node Postgres instance (sufficient for dev/hobby).

```powershell
fly pg create --name vibecoder-db-cluster --region fra --vm-size shared-cpu-1x --volume-size 1
```

*   **Region**: `fra` (Frankfurt) - best latency for you (assuming EU).
*   **Size**: `shared-cpu-1x` (cheapest).
*   **Volume**: 1GB (enough for text/metadata).

**Save the credentials displayed in the output!** You will need the `Username`, `Password`, and `Hostname`.

## 2. Expose to Internet (Required for Vercel)

By default, Fly Apps are private. Vercel needs to reach them over the internet.

1.  **Allocate a Public IP** (Costs ~$2/mo, but needed for Vercel direct access):
    ```bash
    fly ips allocate-v4 -a vibecoder-db-cluster
    ```

2.  **Verify access**:
    You can now connect via: `vibecoder-db-cluster.fly.dev:5432`

## 3. Create the Database

Connect to your cluster and create the specific database for this app.

```bash
# Connect via proxy locally
fly proxy 5432 -a vibecoder-db-cluster
```

In a new terminal (using TablePlus, DBeaver, or psql):
URL: `postgres://postgres:<PASSWORD>@localhost:5432/postgres`

Run SQL:
```sql
CREATE DATABASE vibecoder;
```

## 4. Get Connection String

Your Connection String for Vercel (`.env`) will look like this:

```
DATABASE_URL="postgresql://postgres:<PASSWORD>@vibecoder-db-cluster.fly.dev:5432/vibecoder?sslmode=disable"
```

*(Note: Fly Postgres supports SSL, but usually requires cert setup. For simple Vercel <> Fly, disable SSL verification or setup properly later).*

## 5. Migrate Data (Optional)

Since we are moving from SQLite, the database is empty.
Run this in your project root to push the schema:

```bash
npx prisma db push
```
