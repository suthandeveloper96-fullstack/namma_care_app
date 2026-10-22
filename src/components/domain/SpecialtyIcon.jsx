import {
  Baby,
  Bandage,
  Bone,
  BriefcaseMedical,
  Droplet,
  Ear,
  Eye,
  FileCheck2,
  Flower2,
  GlassWater,
  HandHeart,
  HeartPulse,
  Pill,
  Smile,
  Sparkles,
  Stethoscope,
  Thermometer,
} from 'lucide-react';

const ICONS = {
  Baby,
  Bandage,
  Bone,
  BriefcaseMedical,
  Droplet,
  Ear,
  Eye,
  FileCheck2,
  Flower2,
  GlassWater,
  HandHeart,
  HeartPulse,
  Pill,
  Smile,
  Sparkles,
  Stethoscope,
  Thermometer,
};

/** Resolves an icon name stored in static data to a lucide component. */
export default function DataIcon({ name, ...props }) {
  const Icon = ICONS[name] ?? Stethoscope;
  return <Icon aria-hidden="true" {...props} />;
}
