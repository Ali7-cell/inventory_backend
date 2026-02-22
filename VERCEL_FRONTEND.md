# Vercel Frontend Integration Guide

This backend is configured to work seamlessly with a Vercel-deployed frontend.

## CORS Configuration

### Automatic Vercel Detection

The backend **automatically allows** requests from:
- ✅ All `*.vercel.app` domains (production and preview deployments)
- ✅ Custom Vercel domains (if `VERCEL_URL` env var is set)
- ✅ Localhost (development only)

### Explicit Configuration

To restrict to specific domains, set `ALLOWED_ORIGINS`:

```bash
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-custom-domain.com
```

## Frontend Environment Variables

In your Vercel project settings, set:

```bash
VITE_API_URL=https://your-backend.railway.app
# or
REACT_APP_API_URL=https://your-backend.railway.app
# or
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**Important:** Use the full backend URL (including `https://`). Never hardcode URLs in frontend code.

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Product Management
- `GET /products` - List all products
- `GET /products/:id` - Get product details
- `POST /products` - Create product
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Sales & Checkout (Billing)
- `GET /sales` - Get all sales
- `GET /sales/:id` - Get sale details
- `POST /sales` - **Create sale (checkout endpoint)**
  ```json
  {
    "total_amount": 100.00,
    "net_amount": 95.00,
    "discount": 5.00,
    "payment_method": "Cash",
    "customer_name": "John Doe",
    "items": [
      {
        "batch_id": 1,
        "quantity": 2,
        "unit_price": 50.00,
        "subtotal": 100.00,
        "sold_as": "unit"
      }
    ]
  }
  ```

### Dashboard Metrics
- `GET /analytics/dashboard-stats` - Main dashboard KPIs
  ```json
  {
    "totalProducts": 150,
    "lowStockItems": 5,
    "inventoryValue": 50000.00,
    "todayRevenue": 1250.00,
    "totalRevenue": 50000.00
  }
  ```
- `GET /analytics/low-stock` - Low stock alerts
- `GET /analytics/sales-trend` - Monthly sales trend
- `GET /analytics/top-products` - Top 5 selling products
- `GET /analytics/daily-sales` - Last 30 days sales

### Stock Management
- `GET /stock` - Current stock levels
- `GET /batches` - Product batches
- `GET /movements` - Stock movement history

## Error Handling

All errors return consistent, production-safe responses:

```json
{
  "error": "User-friendly error message"
}
```

**Production:** No stack traces, no internal details
**Development:** Includes error details and stack trace (first 5 lines)

### Common Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (valid token but insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error
- `503` - Service Unavailable (database down)

## Authentication Flow

1. **Register/Login** → Get JWT token
2. **Store token** in localStorage or secure storage
3. **Include in requests:**
   ```
   Authorization: Bearer <token>
   ```
4. **Handle 401** → Redirect to login, refresh token, or re-authenticate

## Example Frontend Code

### Axios Setup

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Checkout Example

```javascript
async function checkout(cartItems, customerInfo) {
  const items = cartItems.map(item => ({
    batch_id: item.batchId,
    quantity: item.quantity,
    unit_price: item.price,
    subtotal: item.price * item.quantity,
    sold_as: item.soldAs || 'unit',
  }));

  const saleData = {
    total_amount: calculateTotal(cartItems),
    discount: customerInfo.discount || 0,
    net_amount: calculateTotal(cartItems) - (customerInfo.discount || 0),
    payment_method: customerInfo.paymentMethod || 'Cash',
    customer_name: customerInfo.name,
    items,
  };

  try {
    const response = await api.post('/sales', saleData);
    return response.data; // { saleId, sale, message }
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Checkout failed');
  }
}
```

### Dashboard Stats Example

```javascript
async function getDashboardStats() {
  try {
    const response = await api.get('/analytics/dashboard-stats');
    return response.data;
  } catch (error) {
    console.error('Failed to load dashboard:', error.response?.data?.error);
    return null;
  }
}
```

## CORS Headers

The backend sends these CORS headers:

```
Access-Control-Allow-Origin: <your-vercel-domain>
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin
Access-Control-Max-Age: 86400
```

## Testing Locally

1. **Backend:** `npm run dev` (runs on `http://localhost:3000`)
2. **Frontend:** Set `VITE_API_URL=http://localhost:3000`
3. **CORS:** Automatically allows `localhost` in development

## Production Checklist

- ✅ Set `VITE_API_URL` in Vercel environment variables
- ✅ Backend `ALLOWED_ORIGINS` includes your Vercel domain (or leave empty for auto)
- ✅ JWT tokens stored securely (httpOnly cookies recommended for production)
- ✅ Error handling implemented in frontend
- ✅ Loading states for async operations
- ✅ Token refresh logic (if using short-lived tokens)
