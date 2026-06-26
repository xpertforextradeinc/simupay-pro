# SimuPay Pro 🚀

A modern, high-performance fintech simulation and wallet management application. Designed with a sleek, responsive interface, SimuPay Pro offers a comprehensive sandbox environment for managing virtual assets, testing ledger pipelines, and executing simulated cross-chain transactions.

![SimuPay Pro](https://via.placeholder.com/1200x600/050E0C/00C853?text=SimuPay+Pro)

## 🌟 Features

- **Robust Authentication**: Secure email/password and Google OAuth integration powered by Supabase.
- **Advanced Wallet System**: Real-time balance tracking, virtual asset injection across multiple simulated networks (TRC20, ERC20, BEP20, BTC, ETH), and secure node status monitoring.
- **Flash Transfers**: Simulated high-speed, decentralized peer-to-peer asset transfers with PIN protection and dynamic fee calculations.
- **Enterprise Analytics**: Premium tier access to advanced cross-chain analytics, interactive charts, and predictive forecasting.
- **Dynamic Receipt Generator**: Create, customize, and print verified transaction receipts.
- **Subscription Management**: Seamless tier-based access control with integrated payment provider capabilities.
- **Admin Control Panel**: Comprehensive user management, transaction auditing, and system oversight.
- **Support & Ticketing**: Built-in support portal with WhatsApp integration and ticket tracking.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Google OAuth)
- **Deployment**: Vercel
- **Architecture**: Modern ES Modules, Functional Components, Custom Hooks, React Suspense for lazy loading

## ⚙️ Environment Variables

To run this project locally or in production, you must configure the appropriate environment variables. Create a `.env` file in the root directory and add the following:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Additional API Keys (if applicable in the future)
# VITE_OTHER_SERVICE_KEY=your_key
```

> **Warning:** Never commit your `.env` file to version control. The repository includes a `.gitignore` to prevent this.

## 🔐 Supabase Configuration Notes

1. **Authentication**:
   - Enable **Email Authentication**.
   - Enable **Google Provider** in the Supabase Auth settings.
   - Set the Google OAuth Client ID and Secret.
   - Configure the **Callback URL** in Google Cloud Console to point to your Supabase project: `https://<your-project-ref>.supabase.co/auth/v1/callback`

2. **Redirect URLs**:
   - Add your local development URL (e.g., `http://localhost:3000`) and your production Vercel URL (e.g., `https://simupay-pro.vercel.app`) to the **Site URL** and **Redirect URLs** in Supabase Auth configuration. Ensure you add wildcard support if needed (e.g., `https://simupay-pro.vercel.app/**`).

3. **Database & RLS**:
   - The application relies heavily on Supabase Row Level Security (RLS) policies to ensure data privacy between users. Ensure your schema and RLS policies are properly applied.

## 🚀 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/simupay-pro.git
   cd simupay-pro
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up your environment variables**:
   Create a `.env` file based on the environment variables guide above.

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000` (or the port specified by Vite).

## 🚢 Deployment (Vercel)

Deploying SimuPay Pro to Vercel is straightforward:

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Log in to [Vercel](https://vercel.com) and click **Add New** -> **Project**.
3. Import your SimuPay Pro repository.
4. Configure the **Environment Variables** in the Vercel deployment settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will automatically detect the Vite build settings (`npm run build` and `dist` output directory).

Once deployed, ensure you update your Supabase Redirect URLs with the new Vercel production domain!

## 📄 License

This project is proprietary and intended for demonstration/simulation purposes.

---
*Built with precision for the modern financial web.*
