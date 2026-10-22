// `icon` is a lucide-react icon name resolved in components/domain/SpecialtyIcon.jsx.
export const SPECIALTIES = [
  { id: 'general-medicine', name: 'General Medicine', icon: 'Stethoscope', blurb: 'Fever, infections, routine check-ups' },
  { id: 'paediatrics', name: 'Paediatrics', icon: 'Baby', blurb: 'Care for infants, children and teens' },
  { id: 'cardiology', name: 'Cardiology', icon: 'HeartPulse', blurb: 'Heart and blood-pressure care' },
  { id: 'diabetology', name: 'Diabetology', icon: 'Droplet', blurb: 'Diabetes management and follow-ups' },
  { id: 'dermatology', name: 'Dermatology', icon: 'Sparkles', blurb: 'Skin, hair and nail concerns' },
  { id: 'orthopaedics', name: 'Orthopaedics', icon: 'Bone', blurb: 'Bones, joints and sports injuries' },
  { id: 'gynaecology', name: 'Obstetrics & Gynaecology', icon: 'Flower2', blurb: "Women's health and pregnancy care" },
  { id: 'ent', name: 'ENT', icon: 'Ear', blurb: 'Ear, nose and throat' },
  { id: 'ophthalmology', name: 'Ophthalmology', icon: 'Eye', blurb: 'Eye check-ups and vision care' },
  { id: 'dental', name: 'Dental', icon: 'Smile', blurb: 'Dental check-ups and oral care' },
];

export function getSpecialtyById(id) {
  return SPECIALTIES.find((s) => s.id === id) ?? null;
}
