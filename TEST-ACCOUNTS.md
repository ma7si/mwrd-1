# mwrd Test Accounts & Data

## Quick Start

Your mwrd marketplace is ready to test! Use these accounts to explore all three portals.

---

## 🔐 Test Account Credentials

### Admin Portal
```
Email:    admin@mwrd.com
Password: admin123
Role:     Administrator
```

**What you can do:**
- View all users, items, RFQs, and orders
- Approve pending users and items
- Configure margin rules
- Monitor marketplace activity
- See real identities behind random names

---

### Client Portal (Buyer)
```
Email:    client@test.com
Password: client123
Role:     Client
Random Name: Client-9760
```

**What you can do:**
- Browse 8 approved products across 4 categories
- Add items to RFQ (Request for Quotation)
- Submit RFQs to multiple suppliers
- Compare anonymous quotes from suppliers
- Accept quotes and place orders
- View order history

---

### Supplier Portal #1 (Seller)
```
Email:    supplier@test.com
Password: supplier123
Role:     Supplier
Random Name: Supplier-7659
Rating: 4.5 ⭐ (12 completed orders)
```

**Current Inventory (4 items):**
- Microcontroller Boards - $45.00/pcs (Electronics)
- Industrial Sensors - $89.99/pcs (Electronics)
- Stainless Steel Sheets - $125.50/kg (Raw Materials)
- Printer Paper Reams - $12.99/ream (Office Supplies)

**What you can do:**
- Add new products to your inventory
- View pending item approvals
- Receive RFQs from anonymous clients
- Submit competitive quotes
- Manage orders and fulfillment

---

### Supplier Portal #2 (Seller)
```
Email:    supplier2@test.com
Password: supplier123
Role:     Supplier
Random Name: Supplier-2585
Rating: 4.8 ⭐ (24 completed orders)
```

**Current Inventory (4 items):**
- LED Display Panels - $199.00/pcs (Electronics)
- Premium Office Chairs - $299.99/pcs (Office Supplies)
- Industrial Pumps - $1,499.00/pcs (Machinery)
- Aluminum Bars - $78.00/kg (Raw Materials)

**What you can do:**
- Add new products to your inventory
- View pending item approvals
- Receive RFQs from anonymous clients
- Submit competitive quotes
- Manage orders and fulfillment

---

## 📊 Sample Data Included

### Categories
1. **Electronics** - Electronic components and devices (20% margin)
2. **Raw Materials** - Industrial raw materials and supplies (15% margin)
3. **Office Supplies** - Office and business supplies (15% margin)
4. **Machinery** - Industrial machinery and equipment (25% margin)

### Margin Rules
- Global default: **15%**
- Electronics: **20%**
- Machinery: **25%**

---

## 🔄 How the Anonymization Works

1. When clients submit RFQs, suppliers see them as **Client-9760** (not "ABC Manufacturing Co.")
2. When suppliers submit quotes, clients see them as **Supplier-7659** (not "Quality Supplies Ltd.")
3. Only the admin can see real company names and contact information
4. All pricing shown to clients includes the mwrd margin automatically

---

## 🧪 Testing Workflow

### Complete RFQ Flow Test:
1. **Login as Client** (client@test.com)
   - Browse catalog at `/portal/client/catalog`
   - Add items to your RFQ cart
   - Submit an RFQ

2. **Login as Supplier** (supplier@test.com)
   - View received RFQs (you'll see Client-9760)
   - Submit a competitive quote
   - View client's rating and order history

3. **Login as Client again**
   - Review quotes from Supplier-7659 and Supplier-2585
   - Compare prices, ratings, and delivery times
   - Accept the best quote

4. **Login as Admin** (admin@mwrd.com)
   - Monitor the entire transaction
   - See real identities of both parties
   - Track margin earned
   - Manage logistics status

---

## 🎨 Key Features to Test

### Landing Page
- Visit `/` to see the public homepage
- Click "Get Started" to create new accounts
- Try the signup flow for both client and supplier

### Client Features
- **Product Catalog** with search and category filters
- **Shopping cart** style RFQ builder
- **Quote comparison** with anonymized supplier info
- **Rating display** for supplier credibility

### Supplier Features
- **Inventory management** with approval workflow
- **RFQ notifications** for relevant items
- **Quote submission** with pricing and delivery terms
- **Performance dashboard** with ratings and stats

### Admin Features
- **User approval** workflow for new registrations
- **Item approval** for supplier products
- **Margin configuration** per category
- **Full visibility** into all transactions
- **Analytics dashboard** with key metrics

---

## 🚀 Next Steps

To fully complete the platform, implement:
- [ ] RFQ submission workflow
- [ ] Quote submission and comparison
- [ ] Order placement and tracking
- [ ] Real-time notifications
- [ ] File uploads for KYC and images
- [ ] Email notifications
- [ ] Rating and review submission

---

## 🔧 Technical Notes

- All accounts are **pre-approved** and ready to use
- Random names are **automatically generated**
- Passwords are stored securely with Supabase Auth
- Row Level Security ensures **data isolation**
- Margin calculations happen **automatically**

---

**Enjoy testing your mwrd marketplace! 🎉**
