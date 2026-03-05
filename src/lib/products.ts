/**
 * Central product catalog — single source of truth for storefront product data.
 * Used by:
 *  - generateStaticParams() to pre-build all product routes at build time
 *  - Product detail pages to render specs, features, sizes, etc.
 *  - Any other component that needs product info (SizeSelectionSection, etc.)
 */

import { Zap, Droplets, Leaf, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SizeOption {
  value: string;
  label: string;
  price: number;
  sublabel: string;
}

export interface KeyFeature {
  icon: LucideIcon;
  label: string;
  desc: string;
}

export interface Spec {
  label: string;
  value: string;
}

export interface HowToUseStep {
  step: string;
  title: string;
  desc: string;
}

export interface ProductCatalogEntry {
  /** URL slug — used for /product/[slug] */
  slug: string;
  name: string;
  tagline: string;
  flavor: string;
  image: string;
  badge: string;
  seoTitle: string;
  seoDescription: string;
  sizeOptions: SizeOption[];
  keyFeatures: KeyFeature[];
  specs: Spec[];
  howToUse: HowToUseStep[];
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export const PRODUCTS: ProductCatalogEntry[] = [
  {
    slug: "california-pickle",
    name: "The California Pickle",
    tagline: "Pickle Juice Sports Drink",
    flavor: "Cucumber",
    image: "/bottle.webp",
    badge: "0g Sugar",
    seoTitle: "The California Pickle — Sports Drink | Stop Cramps in Seconds",
    seoDescription:
      "Fast-acting electrolyte shot powered by real pickle brine. Science-backed cramp relief in under 80 seconds. 0g sugar, vegan, gluten-free.",
    sizeOptions: [
      { value: "60ml-12pack", label: "60ml — Pack of 12", price: 22, sublabel: "Best Value" },
      { value: "halfgallon",  label: "Half Gallon",        price: 28, sublabel: "" },
      { value: "1gallon",     label: "1 Gallon",            price: 38, sublabel: "Bulk" },
    ],
    keyFeatures: [
      { icon: Zap,         label: "Fast Cramp Relief",   desc: "Works in under 80 seconds" },
      { icon: Droplets,    label: "High Electrolytes",   desc: "Dense sodium & potassium" },
      { icon: ShieldCheck, label: "Gut Support",         desc: "Live cultures & acetic acid" },
      { icon: Leaf,        label: "Natural Ingredients", desc: "No artificial additives" },
    ],
    specs: [
      { label: "Volume",       value: "60ml" },
      { label: "Pack Size",    value: "12" },
      { label: "Form",         value: "Liquid" },
      { label: "Flavor",       value: "Cucumber" },
      { label: "Sugar",        value: "0g" },
      { label: "Electrolytes", value: "High" },
      { label: "Sodium",       value: "High" },
      { label: "Diet",         value: "Vegan, Gluten-free" },
      { label: "Use Case",     value: "Workout, Dehydration, Recovery" },
    ],
    howToUse: [
      {
        step: "01",
        title: "At Onset of Cramps",
        desc: "Drink one 60ml shot the moment you feel a cramp coming on. Relief typically occurs within 35–80 seconds.",
      },
      {
        step: "02",
        title: "During Workout",
        desc: "Take one shot every 45–60 minutes during intense training to prevent cramps before they start.",
      },
      {
        step: "03",
        title: "Post-Workout Recovery",
        desc: "One shot after exercise helps restore electrolyte balance and supports faster muscle recovery.",
      },
    ],
  },
];

/** Lookup a product by slug — returns undefined if not found */
export function getProductBySlug(slug: string): ProductCatalogEntry | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
