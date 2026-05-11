import { connectDB } from "./lib/mongoose";
import { User } from "./models/User";
import { Service } from "./models/Service";
import { logger } from "./lib/logger";

const services = [
  {
    title: "Logo Design",
    description: "Professional logo design crafted by expert designers. Get a unique, memorable logo that represents your brand identity with unlimited revisions until you are satisfied.",
    thumbnail: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=400&h=300&fit=crop",
    pointsCost: 500,
    deliveryTime: "3-5 days",
    category: "Design",
    status: "active" as const,
    features: ["3 logo concepts", "Unlimited revisions", "All file formats (PNG, SVG, PDF)", "Brand guidelines", "Commercial license"],
  },
  {
    title: "Website Development",
    description: "Full-stack web development using modern technologies. From landing pages to complex web applications, we build fast, secure, and scalable websites.",
    thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop",
    pointsCost: 2000,
    deliveryTime: "7-14 days",
    category: "Development",
    status: "active" as const,
    features: ["Responsive design", "SEO optimized", "Fast loading", "CMS integration", "6 months support"],
  },
  {
    title: "SEO Optimization",
    description: "Boost your website's search engine rankings with our comprehensive SEO service. Technical SEO, content optimization, and link building strategies.",
    thumbnail: "https://images.unsplash.com/photo-1562577309-4932fdd64cd1?w=400&h=300&fit=crop",
    pointsCost: 800,
    deliveryTime: "Ongoing",
    category: "Marketing",
    status: "active" as const,
    features: ["Keyword research", "On-page SEO", "Technical audit", "Monthly reports", "Competitor analysis"],
  },
  {
    title: "Social Media Management",
    description: "Complete social media management for your brand. Content creation, scheduling, engagement, and analytics across all major platforms.",
    thumbnail: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400&h=300&fit=crop",
    pointsCost: 1200,
    deliveryTime: "Monthly",
    category: "Marketing",
    status: "active" as const,
    features: ["4 platforms covered", "Daily posting", "Community management", "Monthly analytics", "Ad campaign management"],
  },
  {
    title: "Mobile App Development",
    description: "Native and cross-platform mobile app development for iOS and Android. Beautiful UI, smooth performance, and App Store deployment.",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
    pointsCost: 5000,
    deliveryTime: "30-60 days",
    category: "Development",
    status: "active" as const,
    features: ["iOS & Android", "React Native", "Backend API", "App Store submission", "3 months support"],
  },
  {
    title: "Content Writing",
    description: "High-quality, SEO-optimized content writing for blogs, websites, and marketing materials. Engaging copy that converts visitors into customers.",
    thumbnail: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop",
    pointsCost: 300,
    deliveryTime: "2-3 days",
    category: "Content",
    status: "active" as const,
    features: ["SEO optimized", "Plagiarism free", "5 articles/month", "Unlimited revisions", "Multiple niches"],
  },
  {
    title: "Video Editing",
    description: "Professional video editing for YouTube, social media, ads, and corporate videos. Color grading, motion graphics, and sound design included.",
    thumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop",
    pointsCost: 700,
    deliveryTime: "3-5 days",
    category: "Design",
    status: "active" as const,
    features: ["Color grading", "Motion graphics", "Sound design", "4K output", "3 revisions"],
  },
  {
    title: "Cybersecurity Audit",
    description: "Comprehensive security audit for your web application or infrastructure. Identify vulnerabilities and get a detailed remediation report.",
    thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=300&fit=crop",
    pointsCost: 3000,
    deliveryTime: "5-7 days",
    category: "Security",
    status: "active" as const,
    features: ["Penetration testing", "OWASP Top 10 check", "Detailed report", "Remediation guide", "Follow-up scan"],
  },
  {
    title: "Cloud Setup & DevOps",
    description: "AWS/GCP/Azure cloud infrastructure setup, CI/CD pipelines, Docker containerization, and Kubernetes orchestration for scalable deployments.",
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    pointsCost: 2500,
    deliveryTime: "7-10 days",
    category: "Development",
    status: "active" as const,
    features: ["Cloud architecture", "CI/CD pipeline", "Docker & K8s", "Monitoring setup", "Auto-scaling"],
  },
];

async function seed() {
  await connectDB();

  // Create admin user if not exists
  const adminExists = await User.findOne({ email: "admin@vectortech.in" });
  if (!adminExists) {
    await User.create({
      name: "Vector Admin",
      email: "admin@vectortech.in",
      password: "Admin@1234",
      role: "admin",
      status: "active",
      walletBalance: 9999,
    });
    logger.info("Admin user created: admin@vectortech.in / Admin@1234");
  }

  // Create demo user if not exists
  const demoExists = await User.findOne({ email: "demo@vectortech.in" });
  if (!demoExists) {
    await User.create({
      name: "Demo User",
      email: "demo@vectortech.in",
      password: "Demo@1234",
      role: "user",
      status: "active",
      walletBalance: 1500,
    });
    logger.info("Demo user created: demo@vectortech.in / Demo@1234");
  }

  // Seed services if none exist
  const serviceCount = await Service.countDocuments();
  if (serviceCount === 0) {
    await Service.insertMany(services);
    logger.info(`Seeded ${services.length} services`);
  }

  logger.info("Seeding complete");
  process.exit(0);
}

seed().catch((err) => {
  logger.error({ err }, "Seeding failed");
  process.exit(1);
});
