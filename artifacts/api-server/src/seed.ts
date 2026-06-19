import { Service } from "./models/Service";

export async function seedServices() {
  try {
    // await Service.deleteMany({});
    const count = await Service.countDocuments(); 
    if (count > 0) { console.log("⏭️ Seed skipped — services already exist"); return; }

    const services = [
      // ═════════ YOUTUBE ═════════

      {
  title: "Video Upload Service",
  description: "Upload video to YouTube with title, description and tags.",
  category: "YouTube Services",
  subcategory: "Upload",
  pointsCost: 10,
  deliveryTime: "Same day",
  status: "active",
  order: 5,
  features: [
    "Video Upload",
    "Title Setup",
    "Description Setup",
    "Tags Setup"
  ],
},

{
  title: "YouTube Channel Creation",
  description: "Complete YouTube channel setup.",
  category: "YouTube Services",
  subcategory: "Channel Setup",
  pointsCost: 1,
  deliveryTime: "Same day",
  status: "active",
  order: 6,
  features: [
    "Channel Creation",
    "Basic Setup",
    "Profile Setup"
  ],
},

      {
        title: "Thumbnail Design",
        description: "Professional YouTube thumbnail design for high CTR.",
        category: "YouTube Services",
        subcategory: "Design",
        pointsCost: 499,
        deliveryTime: "1 day",
        status: "active",
        order: 1,
        features: ["Custom thumbnail", "HD quality", "CTR optimized"],
      },

      {
        title: "YouTube Shorts (Under 1 Min)",
        description: "Short form video editing for YouTube Shorts.",
        category: "YouTube Services",
        subcategory: "Video Editing",
        pointsCost: 999,
        deliveryTime: "2 days",
        status: "active",
        order: 2,
        features: ["Cuts", "Music", "Captions"],
      },

      {
        title: "1–3 Minute Video Editing",
        description: "Editing for 1–3 minute videos.",
        category: "YouTube Services",
        subcategory: "Video Editing",
        pointsCost: 1499,
        deliveryTime: "2 days",
        status: "active",
        order: 3,
        features: ["Transitions", "Color grading", "Subtitles"],
      },

      {
        title: "1–5 Minute Video Editing",
        description: "Editing for 1–5 minute videos.",
        category: "YouTube Services",
        subcategory: "Video Editing",
        pointsCost: 1999,
        deliveryTime: "3 days",
        status: "active",
        order: 4,
        features: ["Motion graphics", "Sound design"],
      },
      {
        title: "Packages 5 (2000 Points)",
        description: "Editing for 1–5 minute videos.",
        category: "YouTube Services",
        subcategory: "Video Editing",
        pointsCost: 1999,
        deliveryTime: "3 days",
        status: "active",
        order: 4,
        features: ["Motion graphics", "Sound design"],
      },

      // ═════════ WEB & APP ═════════

      {
        title: "Landing Page Development",
        description: "High converting landing page using React/Next.js.",
        category: "Web & App Development",
        subcategory: "Frontend",
        pointsCost: 9999,
        deliveryTime: "7 days",
        status: "active",
        order: 5,
        features: ["Responsive", "SEO", "Fast loading"],
      },

      {
        title: "Full Stack Web Application",
        description: "Full stack web app with backend + frontend.",
        category: "Web & App Development",
        subcategory: "Full Stack",
        pointsCost: 49999,
        deliveryTime: "30 days",
        status: "active",
        order: 6,
        features: ["React", "Node.js", "MongoDB"],
      },

      {
        title: "E-Commerce Website",
        description: "Online store with payment gateway.",
        category: "Web & App Development",
        subcategory: "E-Commerce",
        pointsCost: 29999,
        deliveryTime: "21 days",
        status: "active",
        order: 7,
        features: ["Cart", "Payments", "Admin panel"],
      },

      {
        title: "Mobile App Development (React Native)",
        description: "Cross platform mobile app.",
        category: "Web & App Development",
        subcategory: "Mobile App",
        pointsCost: 59999,
        deliveryTime: "45 days",
        status: "active",
        order: 8,
        features: ["Android + iOS", "API integration"],
      },

      // ═════════ META ADS ═════════

      {
        title: "Meta Ads Campaign Setup",
        description: "Facebook & Instagram ads setup.",
        category: "Meta Ads",
        subcategory: "Campaign Setup",
        pointsCost: 7999,
        deliveryTime: "3 days",
        status: "active",
        order: 9,
        features: ["Pixel setup", "Targeting", "Creatives"],
      },

      {
        title: "Meta Ads Creative Design (5 Ads)",
        description: "High converting ad creatives.",
        category: "Meta Ads",
        subcategory: "Ad Creatives",
        pointsCost: 3999,
        deliveryTime: "3 days",
        status: "active",
        order: 10,
        features: ["Static ads", "Carousel", "Reels"],
      },

      {
        title: "Meta Ads Management (Monthly)",
        description: "Full ads management service.",
        category: "Meta Ads",
        subcategory: "Management",
        pointsCost: 14999,
        deliveryTime: "30 days",
        status: "active",
        order: 11,
        features: ["Optimization", "Reports", "Scaling"],
      },

      {
        title: "Meta Pixel & Conversion API Setup",
        description: "Tracking setup for ads.",
        category: "Meta Ads",
        subcategory: "Tracking",
        pointsCost: 4999,
        deliveryTime: "2 days",
        status: "active",
        order: 12,
        features: ["Pixel", "CAPI", "Events"],
      },

      {
        title: "Meta Ads Audit & Strategy",
        description: "Deep audit + strategy plan.",
        category: "Meta Ads",
        subcategory: "Audit",
        pointsCost: 5999,
        deliveryTime: "4 days",
        status: "active",
        order: 13,
        features: ["Audit", "Strategy", "Reports"],
      },
    ];

    await Service.insertMany(services);

    console.log(`✅ ${services.length} services seeded`);
  } catch (error) {
    console.error("❌ Seed Error:", error);
  }
}