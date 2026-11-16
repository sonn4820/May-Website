// Confirmed clinic information. Markup shows it with data-info="NAME".
const CLINIC_INFO = {
  CLINIC_NAME:    "Excelcare Dental",
  CLINIC_PHONE:   "847-548-2222",
  CLINIC_ADDRESS: "1227 N Illinois 83 Ste E, Grayslake, IL 60030",
  CLINIC_EMAIL:   "business@excelcaredental.com",
  // Google share link from the clinic (opens the Excelcare Dental business profile on Google)
  CLINIC_MAPS_URL: "https://share.google/fyuOVADZM7Bpl3VVZ"
};
// "Get directions" opens Google Maps directions straight away (Maps URLs, no API key; opens the Maps app on phones)
const directionsUrl = () => "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(CLINIC_INFO.CLINIC_NAME + ", " + CLINIC_INFO.CLINIC_ADDRESS);
