// Photos for the FICTIONAL demo doctors, keyed by doctor id. Files live in /public/doctors/.
// Doctors without an entry (or whose image fails to load) show the illustrated avatar.
//
// Before sharing the site publicly, replace any photo of a real, identifiable doctor or with a
// hospital logo / name badge (currently doctor-04, doctor-05, doctor-08) with licensed stock or
// AI-generated images — these profiles use invented names and details.
// Photos go to the doctors nearest the default Chennai location; the rest use illustrated portraits.
export const DOCTOR_PHOTOS = {
  'doc-kavitha-ramanathan': '/doctors/doctor-06.jpg',
  'doc-arun-selvaraj': '/doctors/doctor-01.jpg',
  'doc-priya-rajendran': '/doctors/doctor-04.jpg',
  'doc-fathima-begum': '/doctors/doctor-02.jpg',
  'doc-karthik-balasubramanian': '/doctors/doctor-10.jpg',
  'doc-nandhini-elangovan': '/doctors/doctor-07.jpg',
  'doc-divya-chandrasekar': '/doctors/doctor-09.jpg',
  'doc-prakash-venkatesan': '/doctors/doctor-11.jpg',
  'doc-senthil-arumugam': '/doctors/doctor-03.jpg',
  'doc-vignesh-palanisamy': '/doctors/doctor-05.jpg',
  'doc-ganesh-annamalai': '/doctors/doctor-08.jpg',
  // doctor-12, 14–22: AI-generated sample photos. doctor-13 is still an illustrated portrait.
  'doc-meenakshi-sundaram': '/doctors/doctor-12.jpg',
  'doc-lakshmi-narayanan': '/doctors/doctor-13.jpg',
  'doc-revathi-murugesan': '/doctors/doctor-14.jpg',
  'doc-anitha-krishnamoorthy': '/doctors/doctor-15.jpg',
  'doc-sangeetha-pandian': '/doctors/doctor-16.jpg',
  'doc-bharathi-shanmugam': '/doctors/doctor-17.jpg',
  'doc-suresh-thangavel': '/doctors/doctor-18.jpg',
  'doc-joseph-antony': '/doctors/doctor-19.jpg',
  'doc-rajesh-subramani': '/doctors/doctor-20.jpg',
  'doc-hari-prasad': '/doctors/doctor-21.jpg',
  'doc-mohammed-irfan': '/doctors/doctor-22.jpg',
};

/** Photo used in the home hero. */
export const HERO_PHOTO = '/doctors/hero-doctor.jpg';

/** Photo on the login screen (desktop side panel and mobile banner). */
export const LOGIN_PHOTO = '/doctors/login-doctor.jpg';
