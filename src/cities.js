// Built-in places, used when the online place search is down or finds nothing.
// [name, region, country, latitude, longitude]
const C = [
  ["Delhi","Delhi","India",28.6139,77.209],["New Delhi","Delhi","India",28.6139,77.209],["Mumbai","Maharashtra","India",19.076,72.8777],
  ["Bengaluru","Karnataka","India",12.9716,77.5946],["Bangalore","Karnataka","India",12.9716,77.5946],["Hyderabad","Telangana","India",17.385,78.4867],
  ["Ahmedabad","Gujarat","India",23.0225,72.5714],["Chennai","Tamil Nadu","India",13.0827,80.2707],["Kolkata","West Bengal","India",22.5726,88.3639],
  ["Pune","Maharashtra","India",18.5204,73.8567],["Jaipur","Rajasthan","India",26.9124,75.7873],["Surat","Gujarat","India",21.1702,72.8311],
  ["Lucknow","Uttar Pradesh","India",26.8467,80.9462],["Kanpur","Uttar Pradesh","India",26.4499,80.3319],["Nagpur","Maharashtra","India",21.1458,79.0882],
  ["Indore","Madhya Pradesh","India",22.7196,75.8577],["Bhopal","Madhya Pradesh","India",23.2599,77.4126],["Patna","Bihar","India",25.5941,85.1376],
  ["Vadodara","Gujarat","India",22.3072,73.1812],["Ghaziabad","Uttar Pradesh","India",28.6692,77.4538],["Ludhiana","Punjab","India",30.901,75.8573],
  ["Agra","Uttar Pradesh","India",27.1767,78.0081],["Nashik","Maharashtra","India",19.9975,73.7898],["Faridabad","Haryana","India",28.4089,77.3178],
  ["Meerut","Uttar Pradesh","India",28.9845,77.7064],["Rajkot","Gujarat","India",22.3039,70.8022],["Varanasi","Uttar Pradesh","India",25.3176,82.9739],
  ["Srinagar","Jammu and Kashmir","India",34.0837,74.7973],["Amritsar","Punjab","India",31.634,74.8723],["Allahabad","Uttar Pradesh","India",25.4358,81.8463],
  ["Prayagraj","Uttar Pradesh","India",25.4358,81.8463],["Ranchi","Jharkhand","India",23.3441,85.3096],["Howrah","West Bengal","India",22.5958,88.2636],
  ["Coimbatore","Tamil Nadu","India",11.0168,76.9558],["Jabalpur","Madhya Pradesh","India",23.1815,79.9864],["Gwalior","Madhya Pradesh","India",26.2183,78.1828],
  ["Vijayawada","Andhra Pradesh","India",16.5062,80.648],["Jodhpur","Rajasthan","India",26.2389,73.0243],["Madurai","Tamil Nadu","India",9.9252,78.1198],
  ["Raipur","Chhattisgarh","India",21.2514,81.6296],["Kota","Rajasthan","India",25.2138,75.8648],["Chandigarh","Chandigarh","India",30.7333,76.7794],
  ["Guwahati","Assam","India",26.1445,91.7362],["Solapur","Maharashtra","India",17.6599,75.9064],["Hubli","Karnataka","India",15.3647,75.124],
  ["Mysuru","Karnataka","India",12.2958,76.6394],["Mysore","Karnataka","India",12.2958,76.6394],["Tiruchirappalli","Tamil Nadu","India",10.7905,78.7047],
  ["Bareilly","Uttar Pradesh","India",28.367,79.4304],["Aligarh","Uttar Pradesh","India",27.8974,78.088],["Moradabad","Uttar Pradesh","India",28.8386,78.7733],
  ["Gurgaon","Haryana","India",28.4595,77.0266],["Gurugram","Haryana","India",28.4595,77.0266],["Noida","Uttar Pradesh","India",28.5355,77.391],
  ["Jalandhar","Punjab","India",31.326,75.5762],["Bhubaneswar","Odisha","India",20.2961,85.8245],["Cuttack","Odisha","India",20.4625,85.883],
  ["Salem","Tamil Nadu","India",11.6643,78.146],["Warangal","Telangana","India",17.9689,79.5941],["Thiruvananthapuram","Kerala","India",8.5241,76.9366],
  ["Kochi","Kerala","India",9.9312,76.2673],["Kozhikode","Kerala","India",11.2588,75.7804],["Thrissur","Kerala","India",10.5276,76.2144],
  ["Visakhapatnam","Andhra Pradesh","India",17.6868,83.2185],["Guntur","Andhra Pradesh","India",16.3067,80.4365],["Tirupati","Andhra Pradesh","India",13.6288,79.4192],
  ["Dehradun","Uttarakhand","India",30.3165,78.0322],["Haridwar","Uttarakhand","India",29.9457,78.1642],["Rishikesh","Uttarakhand","India",30.0869,78.2676],
  ["Shimla","Himachal Pradesh","India",31.1048,77.1734],["Jammu","Jammu and Kashmir","India",32.7266,74.857],["Panaji","Goa","India",15.4909,73.8278],
  ["Goa","Goa","India",15.2993,74.124],["Gangtok","Sikkim","India",27.3389,88.6065],["Imphal","Manipur","India",24.817,93.9368],
  ["Shillong","Meghalaya","India",25.5788,91.8933],["Aizawl","Mizoram","India",23.7271,92.7176],["Agartala","Tripura","India",23.8315,91.2868],
  ["Kohima","Nagaland","India",25.6747,94.1086],["Itanagar","Arunachal Pradesh","India",27.0844,93.6053],["Dispur","Assam","India",26.1433,91.7898],
  ["Puducherry","Puducherry","India",11.9416,79.8083],["Pondicherry","Puducherry","India",11.9416,79.8083],["Mangaluru","Karnataka","India",12.9141,74.856],
  ["Belgaum","Karnataka","India",15.8497,74.4977],["Belagavi","Karnataka","India",15.8497,74.4977],["Kolhapur","Maharashtra","India",16.705,74.2433],
  ["Aurangabad","Maharashtra","India",19.8762,75.3433],["Thane","Maharashtra","India",19.2183,72.9781],["Navi Mumbai","Maharashtra","India",19.033,73.0297],
  ["Ujjain","Madhya Pradesh","India",23.1765,75.7885],["Mathura","Uttar Pradesh","India",27.4924,77.6737],["Vrindavan","Uttar Pradesh","India",27.5806,77.7006],
  ["Ayodhya","Uttar Pradesh","India",26.7922,82.1998],["Gorakhpur","Uttar Pradesh","India",26.7606,83.3732],["Gaya","Bihar","India",24.7914,85.0002],
  ["Muzaffarpur","Bihar","India",26.1209,85.3647],["Bhagalpur","Bihar","India",25.2425,86.9842],["Darbhanga","Bihar","India",26.1542,85.8918],
  ["Jamshedpur","Jharkhand","India",22.8046,86.2029],["Dhanbad","Jharkhand","India",23.7957,86.4304],["Bokaro","Jharkhand","India",23.6693,86.1511],
  ["Siliguri","West Bengal","India",26.7271,88.3953],["Durgapur","West Bengal","India",23.5204,87.3119],["Asansol","West Bengal","India",23.6889,86.9661],
  ["Bikaner","Rajasthan","India",28.0229,73.3119],["Udaipur","Rajasthan","India",24.5854,73.7125],["Ajmer","Rajasthan","India",26.4499,74.6399],
  ["Alwar","Rajasthan","India",27.5665,76.6103],["Bhilai","Chhattisgarh","India",21.2094,81.4285],["Bilaspur","Chhattisgarh","India",22.0797,82.1409],
  ["Jamnagar","Gujarat","India",22.4707,70.0577],["Bhavnagar","Gujarat","India",21.7645,72.1519],["Gandhinagar","Gujarat","India",23.2156,72.6369],
  ["Panipat","Haryana","India",29.3909,76.9635],["Karnal","Haryana","India",29.6857,76.9905],["Rohtak","Haryana","India",28.8955,76.6066],
  ["Hisar","Haryana","India",29.1492,75.7217],["Ambala","Haryana","India",30.3782,76.7767],["Patiala","Punjab","India",30.3398,76.3869],
  ["Bathinda","Punjab","India",30.211,74.9455],["Saharanpur","Uttar Pradesh","India",29.968,77.5552],["Jhansi","Uttar Pradesh","India",25.4484,78.5685],
  ["Nellore","Andhra Pradesh","India",14.4426,79.9865],["Kakinada","Andhra Pradesh","India",16.9891,82.2475],["Kurnool","Andhra Pradesh","India",15.8281,78.0373],
  ["Nanded","Maharashtra","India",19.1383,77.321],["Amravati","Maharashtra","India",20.9374,77.7796],["Sangli","Maharashtra","India",16.8524,74.5815],
  ["Port Blair","Andaman and Nicobar","India",11.6234,92.7265],["Leh","Ladakh","India",34.1526,77.5771],
  ["London","England","United Kingdom",51.5072,-0.1276],["Birmingham","England","United Kingdom",52.4862,-1.8904],["Leicester","England","United Kingdom",52.6369,-1.1398],
  ["Dubai","Dubai","United Arab Emirates",25.2048,55.2708],["Abu Dhabi","Abu Dhabi","United Arab Emirates",24.4539,54.3773],["Sharjah","Sharjah","United Arab Emirates",25.3463,55.4209],
  ["Doha","Doha","Qatar",25.2854,51.531],["Muscat","Muscat","Oman",23.588,58.3829],["Riyadh","Riyadh","Saudi Arabia",24.7136,46.6753],
  ["Kuwait City","Kuwait","Kuwait",29.3759,47.9774],["Singapore","","Singapore",1.3521,103.8198],["Kuala Lumpur","","Malaysia",3.139,101.6869],
  ["New York","New York","United States",40.7128,-74.006],["San Francisco","California","United States",37.7749,-122.4194],["Los Angeles","California","United States",34.0522,-118.2437],
  ["Chicago","Illinois","United States",41.8781,-87.6298],["Houston","Texas","United States",29.7604,-95.3698],["Dallas","Texas","United States",32.7767,-96.797],
  ["Seattle","Washington","United States",47.6062,-122.3321],["Edison","New Jersey","United States",40.5187,-74.4121],["Toronto","Ontario","Canada",43.6532,-79.3832],
  ["Vancouver","British Columbia","Canada",49.2827,-123.1207],["Brampton","Ontario","Canada",43.7315,-79.7624],["Sydney","New South Wales","Australia",-33.8688,151.2093],
  ["Melbourne","Victoria","Australia",-37.8136,144.9631],["Auckland","","New Zealand",-36.8485,174.7633],["Kathmandu","","Nepal",27.7172,85.324],
  ["Dhaka","","Bangladesh",23.8103,90.4125],["Karachi","Sindh","Pakistan",24.8607,67.0011],["Lahore","Punjab","Pakistan",31.5204,74.3587],
  ["Colombo","","Sri Lanka",6.9271,79.8612],["Nairobi","","Kenya",-1.2921,36.8219],["Johannesburg","Gauteng","South Africa",-26.2041,28.0473],
  ["Port Louis","","Mauritius",-20.1609,57.5012],["Singapore City","","Singapore",1.3521,103.8198],
];

const fold = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
const INDEX = C.map(([name, region, country, lat, lon]) => ({ name, region, country, lat, lon, key: fold(name), full: fold(`${name} ${region} ${country}`) }));

export function localPlaces(query, count = 6) {
  const q = fold(query);
  if (q.length < 2) return [];
  const rank = (p) => (p.key === q ? 0 : p.key.startsWith(q) ? 1 : p.key.split(" ").some((w) => w.startsWith(q)) ? 2 : p.full.includes(q) ? 3 : 9);
  return INDEX.map((p) => [rank(p), p]).filter(([r]) => r < 9)
    .sort((a, b) => a[0] - b[0])
    .filter(([, p], i, arr) => arr.findIndex(([, o]) => o.lat === p.lat && o.lon === p.lon) === i)
    .slice(0, count)
    .map(([, p]) => ({ label: [p.name, p.region, p.country].filter(Boolean).join(", "), lat: p.lat, lon: p.lon }));
}
