import { Service } from "./models/Service";

// Har service ke title ke saath uske packages match kiye hain
const packagesData: Record<string, Array<{
  tier: "Basic" | "Standard" | "Advanced" | "Premium";
  group: "Thumbnail" | "Video <1min" | "Video 1-3min" | "Video 1-5min" | "Channel Setup" | "SEO" | "Video Editing" | "Consultation" | "Landing Page" | "Full Stack" | "E-Commerce" | "Mobile App" | "SEO Audit" | "Campaign Setup" | "Ad Creatives" | "Ads Management" | "Pixel Setup" | "Ads Audit" | "Video Upload"|"Channel Creation";
  pointsCost: number;
  deliveryTime: string;
  features: string[];
  status: "active" | "inactive";
  order?: number;
}>> = {

  // ═══ YOUTUBE SERVICES ═══

 

  "Thumbnail Design": [
  {
    tier: "Basic",
    group: "Thumbnail",
    pointsCost: 20,
    deliveryTime: "1 day",
    features: [
      "1 Thumbnail",
      "HD Quality",
      "1 Revision"
    ],
    status: "active",
    order: 1,
  },
  {
    tier: "Standard",
    group: "Thumbnail",
    pointsCost: 29,
    deliveryTime: "2 days",
    features: [
      "3 Thumbnails",
      "Professional Design",
      "3 Revisions"
    ],
    status: "active",
    order: 1,
  },
  {
    tier: "Advanced",
    group: "Thumbnail",
    pointsCost: 39,
    deliveryTime: "2 days",
    features: [
      "5 Thumbnails",
      "CTR Optimized Design",
      "Source File Included",
      "Unlimited Revisions"
    ],
    status: "active",
    order: 1,
  },

],

"YouTube Shorts (Under 1 Min)": [
  {
    tier: "Basic",
    group: "Video <1min",
    pointsCost: 39,
    deliveryTime: "2 days",
    features: [
      "1 Short Video",
      "Basic Cuts",
      "Background Music"
    ],
    status: "active",
    order: 2,
  },
  {
    tier: "Standard",
    group: "Video <1min",
    pointsCost: 59,
    deliveryTime: "3 days",
    features: [
      "3 Short Videos",
      "Captions",
      "Transitions",
      "Color Correction"
    ],
    status: "active",
    order: 2,
  },
  {
    tier: "Advanced",
    group: "Video <1min",
    pointsCost: 149,
    deliveryTime: "4 days",
    features: [
      "5 Short Videos",
      "Motion Graphics",
      "Premium Effects",
      "Unlimited Revisions"
    ],
    status: "active",
    order: 2,
  },
],

"1–3 Minute Video Editing": [
  {
    tier: "Basic",
    group: "Video 1-3min",
    pointsCost: 49,
    deliveryTime: "2 days",
    features: [
      "Basic Editing",
      "Cuts & Trims",
      "Background Music"
    ],
    status: "active",
    order: 3,
  },
  {
    tier: "Standard",
    group: "Video 1-3min",
    pointsCost: 69,
    deliveryTime: "3 days",
    features: [
      "Transitions",
      "Captions",
      "Color Grading",
      "2 Revisions"
    ],
    status: "active",
    order: 3,
  },
  {
    tier: "Advanced",
    group: "Video 1-3min",
    pointsCost: 169,
    deliveryTime: "5 days",
    features: [
      "Motion Graphics",
      "Sound Design",
      "Premium Effects",
      "Unlimited Revisions"
    ],
    status: "active",
    order: 3,
  },
],

"1–5 Minute Video Editing": [
  {
    tier: "Basic",
    group: "Video 1-5min",
    pointsCost: 59,
    deliveryTime: "3 days",
    features: [
      "Basic Editing",
      "Cuts & Trims",
      "Background Music"
    ],
    status: "active",
    order: 4,
  },
  {
    tier: "Standard",
    group: "Video 1-5min",
    pointsCost: 79,
    deliveryTime: "5 days",
    features: [
      "Transitions",
      "Captions",
      "Color Grading",
      "2 Revisions"
    ],
    status: "active",
    order: 4,
  },
  {
    tier: "Advanced",
    group: "Video 1-5min",
    pointsCost: 179,
    deliveryTime: "7 days",
    features: [
      "Motion Graphics",
      "Sound Design",
      "Premium Effects",
      "Unlimited Revisions"
    ],
    status: "active",
    order: 4,
  },
],
 "Video Upload Service": [
  {
    tier: "Basic",
    group: "Video Upload",
    pointsCost: 10,
    deliveryTime: "Same Day",
    features: [
      "Video Upload",
      "Title Setup",
      "Description Setup",
      "Tags Added"
    ],
    status: "active",
    order: 5
  },
],

"YouTube Channel Creation": [
  {
    tier: "Basic",
    group: "Channel Creation",
    pointsCost: 1,
    deliveryTime: "Same Day",
    features: [
      "Channel Creation",
      "Basic Setup",
      "Profile Configuration",
      "Channel Ready"
    ],
    status: "active",
    order: 6
  },
],
};

export async function seedPackages() {
  try {
    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [title, packages] of Object.entries(packagesData)) {
      const service = await Service.findOne({ title });

      if (!service) {
        console.log(`⚠️  Service not found: "${title}"`);
        notFoundCount++;
        continue;
      }

      service.packages = packages as any;
      await service.save();
      updatedCount++;
      console.log(`✅ Packages added → "${title}"`);
    }

    console.log(`\n🎉 Done! ${updatedCount} services updated, ${notFoundCount} not found.`);
  } catch (error) {
    console.error("❌ seedPackages Error:", error);
  }
}