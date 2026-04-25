import { PrismaClient, UserRole, UserStatus, VendorStatus, ProductStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Hash passwords
  const adminPass = await bcrypt.hash('Admin@123', 12);
  const vendorPass = await bcrypt.hash('Vendor@123', 12);
  const userPass = await bcrypt.hash('User@123', 12);

  // Create Super Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@example.com',
      phone: '9900000001',
      password: adminPass,
      role: UserRole.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  // Create Sub Admin
  const subAdmin = await prisma.user.upsert({
    where: { email: 'subadmin@example.com' },
    update: {},
    create: {
      name: 'Sub Admin',
      email: 'subadmin@example.com',
      phone: '9900000002',
      password: adminPass,
      role: UserRole.SUB_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  // Create Vendor User
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@example.com' },
    update: {},
    create: {
      name: 'Rajesh Kumar',
      email: 'vendor@example.com',
      phone: '9800000001',
      password: vendorPass,
      role: UserRole.VENDOR,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  // Create Vendor Profile
  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: { status: VendorStatus.APPROVED, isVerified: true },
    create: {
      userId: vendorUser.id,
      companyName: 'Rajesh Industrial Supplies',
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      description: 'Leading supplier of industrial equipment and machinery since 2005.',
      address: '123 Industrial Estate, Sector 5',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      status: VendorStatus.APPROVED,
      isVerified: true,
    },
  });

  // Create Vendor 2
  const vendorUser2 = await prisma.user.upsert({
    where: { email: 'vendor2@example.com' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'vendor2@example.com',
      phone: '9800000002',
      password: vendorPass,
      role: UserRole.VENDOR,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { userId: vendorUser2.id },
    update: { status: VendorStatus.APPROVED, isVerified: true },
    create: {
      userId: vendorUser2.id,
      companyName: 'Priya Tech Components',
      gstNumber: '07FGHIJ5678K2L6',
      description: 'Electronic components and circuit boards manufacturer.',
      address: '45 Tech Park, Phase 2',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      status: VendorStatus.APPROVED,
      isVerified: true,
    },
  });

  // Create Buyer
  const buyer = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      name: 'Amit Singh',
      email: 'user@example.com',
      phone: '9700000001',
      password: userPass,
      role: UserRole.BUYER,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  });

  // Create Categories
  const cats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'industrial-machinery' }, update: {}, create: { name: 'Industrial Machinery', slug: 'industrial-machinery', icon: '⚙️', sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'electronics' }, update: {}, create: { name: 'Electronics & Electricals', slug: 'electronics', icon: '⚡', sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'chemicals' }, update: {}, create: { name: 'Chemicals & Plastics', slug: 'chemicals', icon: '🧪', sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'construction' }, update: {}, create: { name: 'Construction Materials', slug: 'construction', icon: '🏗️', sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: 'textiles' }, update: {}, create: { name: 'Textiles & Garments', slug: 'textiles', icon: '👕', sortOrder: 5 } }),
    prisma.category.upsert({ where: { slug: 'agriculture' }, update: {}, create: { name: 'Agriculture Products', slug: 'agriculture', icon: '🌾', sortOrder: 6 } }),
    prisma.category.upsert({ where: { slug: 'automobiles' }, update: {}, create: { name: 'Automobiles & Parts', slug: 'automobiles', icon: '🚗', sortOrder: 7 } }),
    prisma.category.upsert({ where: { slug: 'food-beverages' }, update: {}, create: { name: 'Food & Beverages', slug: 'food-beverages', icon: '🍎', sortOrder: 8 } }),
  ]);

  // Sub-categories
  const subCats = await Promise.all([
    prisma.category.upsert({ where: { slug: 'pumps-valves' }, update: {}, create: { name: 'Pumps & Valves', slug: 'pumps-valves', parentId: cats[0].id } }),
    prisma.category.upsert({ where: { slug: 'motors-generators' }, update: {}, create: { name: 'Motors & Generators', slug: 'motors-generators', parentId: cats[0].id } }),
    prisma.category.upsert({ where: { slug: 'circuit-boards' }, update: {}, create: { name: 'Circuit Boards', slug: 'circuit-boards', parentId: cats[1].id } }),
    prisma.category.upsert({ where: { slug: 'cables-wires' }, update: {}, create: { name: 'Cables & Wires', slug: 'cables-wires', parentId: cats[1].id } }),
  ]);

  // Products
  const products = [
    { vendorId: vendor.id, categoryId: cats[0].id, title: 'Industrial Centrifugal Pump 5HP', slug: 'industrial-centrifugal-pump-5hp', description: 'High-performance centrifugal pump for industrial water transfer applications. Made with cast iron body and stainless steel impeller. Ideal for chemical, water treatment, and general industrial use.', price: 15000, minOrderQty: 1, unit: 'piece', stock: 50, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'] },
    { vendorId: vendor.id, categoryId: cats[0].id, title: 'AC Induction Motor 10HP', slug: 'ac-induction-motor-10hp', description: 'Energy-efficient AC induction motor suitable for industrial applications. IP55 protection rating. Available in 3-phase configuration.', price: 25000, minOrderQty: 1, unit: 'piece', stock: 30, images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500'] },
    { vendorId: vendor2.id, categoryId: cats[1].id, title: 'Arduino Mega 2560 R3 Board', slug: 'arduino-mega-2560-r3', description: 'Official Arduino Mega 2560 R3 microcontroller board. 54 digital I/O pins, 16 analog inputs. USB connection, power jack, ICSP header.', price: 850, minOrderQty: 10, unit: 'piece', stock: 500, images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=500'] },
    { vendorId: vendor2.id, categoryId: cats[1].id, title: 'Multi-strand Copper Wire 2.5mm', slug: 'copper-wire-2-5mm', description: 'High-quality multi-strand copper wire for electrical installations. PVC insulated, 2.5mm cross-section. Available in 90m coils.', price: 1200, minOrderQty: 5, unit: 'coil', stock: 200, images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'] },
    { vendorId: vendor.id, categoryId: cats[3].id, title: 'TMT Steel Bar 12mm Fe-500', slug: 'tmt-steel-bar-12mm', description: 'High strength TMT steel bars Fe-500 grade. 12mm diameter. Used in RCC construction. ISI marked, corrosion resistant.', price: 65000, minOrderQty: 1, unit: 'MT', stock: 100, images: ['https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500'] },
    { vendorId: vendor2.id, categoryId: cats[1].id, title: 'LED Panel Light 40W', slug: 'led-panel-light-40w', description: 'Energy-saving LED panel light 40W. 4000 lumens output, 6500K cool white. Surface mount installation. 3 year warranty.', price: 450, minOrderQty: 20, unit: 'piece', stock: 1000, images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500'] },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: { status: ProductStatus.ACTIVE },
      create: { ...p, status: ProductStatus.ACTIVE, specifications: { 'Material': 'Industrial Grade', 'Warranty': '1 Year' } },
    });
  }

  // Subscriptions
  await prisma.subscription.create({
    data: { vendorId: vendor.id, plan: SubscriptionPlan.PREMIUM, status: SubscriptionStatus.ACTIVE, price: 4999, endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
  });
  await prisma.subscription.create({
    data: { vendorId: vendor2.id, plan: SubscriptionPlan.BASIC, status: SubscriptionStatus.ACTIVE, price: 999, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
  });

  // Inquiries
  const prod1 = await prisma.product.findFirst({ where: { slug: 'industrial-centrifugal-pump-5hp' } });
  if (prod1) {
    await prisma.inquiry.create({
      data: { buyerId: buyer.id, vendorId: vendor.id, productId: prod1.id, subject: 'Price inquiry for bulk order', message: 'We need 10 units of this pump for our factory. Can you provide a bulk discount and what is the delivery timeline?', quantity: 10, unit: 'piece', status: 'PENDING' },
    });
    await prisma.inquiry.create({
      data: { buyerId: buyer.id, vendorId: vendor.id, productId: prod1.id, subject: 'Technical specifications needed', message: 'Please share detailed technical specifications and installation manual for this pump.', quantity: 2, unit: 'piece', status: 'RESPONDED', response: 'Thank you for your inquiry. We have sent the technical documentation to your email.' },
    });
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: buyer.id, title: 'Welcome to B2B Marketplace', message: 'Start exploring thousands of products from verified vendors.', type: 'info' },
      { userId: vendorUser.id, title: 'Profile Approved', message: 'Your vendor profile has been approved. Start adding products now!', type: 'success' },
      { userId: admin.id, title: 'New vendor registration', message: 'A new vendor has registered and awaiting approval.', type: 'info' },
    ],
  });

  console.log('✅ Seed completed!');
  console.log('\n📋 Login credentials:');
  console.log('Admin    → admin@example.com / Admin@123');
  console.log('Vendor   → vendor@example.com / Vendor@123');
  console.log('Buyer    → user@example.com / User@123');
}

main()
  .then(() => {
    console.log('🎉 Done seeding');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
