const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // react frontend URL
  credentials: true
}));
app.use(express.json());

// get all products (optionally filter by q + category)
app.get('/api/products', async (req, res) => {
  try {
    const q = (req.query.q || "").toString().trim();
    const category = (req.query.category || "").toString().trim();

    const andConditions = [];

    if (category) {
      andConditions.push({ category });
    }

    if (q) {
      andConditions.push({
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    const where = andConditions.length ? { AND: andConditions } : undefined;

    const products = await prisma.product.findMany({ where });
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// get single product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// get products by category
app.get('/api/products/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const products = await prisma.product.findMany({
      where: { category }
    });
    res.json(products);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ error: 'Failed to fetch products by category' });
  }
});

// ---------- Auth: Register (plain text password) ----------
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        password,      // plain text on purpose for now
        name: name || null,
        role: 'CUSTOMER',
      },
    });

    // Do not send password back in response
    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

// ---------- Auth: Login (plain text password match) ----------
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Plain text comparison (no bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // no JWT or cookies for now, just send back the user
    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

app.get('/api/admin/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// get simple stats for the dashboard cards
app.get('/api/admin/stats', async (req, res) => {
  const totalSales = await prisma.order.aggregate({ _sum: { total: true } });
  const orderCount = await prisma.order.count();
  const productCount = await prisma.product.count();
  
  res.json({
    revenue: totalSales._sum.total || 0,
    orders: orderCount,
    products: productCount
  });
});

app.patch('/api/admin/products/:id', async (req, res) => {
  const { stock } = req.body;
  try {
    const updated = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { stock: parseInt(stock) }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// Update User Info
app.patch('/api/admin/users/:id', async (req, res) => {
  const { name, email } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: { name, email }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
});

// get all users with their history
app.get('/api/admin/users', async (req, res) => {
  const users = await prisma.user.findMany({
    include: { orders: true },
  });
  res.json(users);
});

// checkout process
app.post('/api/checkout', async (req, res) => {
  const { userData, cartItems, totalAmount } = req.body;

  try {
    // We use a transaction to ensure that if any part fails, 
    // nothing is saved to the database.
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Handle User (Find existing or create new)
      const user = await tx.user.upsert({
        where: { email: userData.email },
        update: { name: `${userData.firstName} ${userData.lastName}` },
        create: {
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          password: 'guest_password_123', // In a real app, generate a random one or use Auth
          role: 'CUSTOMER'
        },
      });

      // B. Create the Order and OrderItems
      const order = await tx.order.create({
        data: {
          userId: user.id,
          total: parseFloat(totalAmount),
          items: {
            create: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.qty,
            })),
          },
        },
      });

      // C. Update Inventory (Subtract stock)
      for (const item of cartItems) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        
        if (!product || product.stock < item.qty) {
          throw new Error(`Product ${item.title} is out of stock!`);
        }

        await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.qty
            }
          }
        });
      }

      return order;
    });

    res.status(201).json({ 
      success: true, 
      message: 'Order placed successfully', 
      orderId: result.id 
    });

  } catch (error) {
    console.error('Checkout error:', error.message);
    res.status(400).json({ 
      success: false, 
      error: error.message || 'Checkout failed' 
    });
  }
});

// test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'E-commerce API is running' });
});

// start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📦 API Endpoints:`);
  console.log(`   GET http://localhost:${PORT}/api/products`);
  console.log(`   GET http://localhost:${PORT}/api/products/:id`);
  console.log(`   GET http://localhost:${PORT}/api/products/category/:category`);
});