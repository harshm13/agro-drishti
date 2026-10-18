// src/utils/api.js
const API_BASE = 'http://localhost:5000';

/**
 * Predict crop disease using Flask backend (http://localhost:5000/predict).
 * Throws on network failure or backend error (no silent fallback).
 */
export const predictDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    body: formData,
  });
  const data = await response.json();

  // Error ko throw karo, null return mat karo
  if (!response.ok || data.error) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
};

// Alias for backwards compatibility
export const predictDiseaseReal = predictDisease;

/**
 * Check Flask server health at http://localhost:5000/health
 */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) throw new Error('Health check status not ok');
    return await res.json();
  } catch (e) {
    return { status: 'offline', model: 'offline' };
  }
};

/**
 * Explicit demo mode mock function (ONLY used when user manually selects Demo/Mock mode in UI)
 */
export const predictDiseaseMock = async (imageFile) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const mockResults = [
    {
      disease: 'Tomato_Early_Blight',
      confidence: 94.2,
      solution: {
        solution: 'Neem oil spray (नीम का तेल) ya Trichoderma viride bio-fungicide ka upyog karein. Yeh Rog-janak fungus ko natural tarike se rokta hai.',
        solution_hindi: 'नीम का तेल (5ml/लीटर) या ट्राइकोडर्मा विरिडी का स्प्रे करें।',
        solution_english: 'Spray Neem oil 5ml/litre or Trichoderma viride bio-fungicide.',
        dosage: '5 ml Neem Oil prati litre paani (1 ml liquid soap ke saath) YA 5 gram Trichoderma powder prati litre paani.',
        frequency: 'Harr 7 se 10 din mein ek baar chhidkaav karein (Spray every 7-10 days, subah ya shaam ke waqt).',
        seasonal_tip: 'Neeche ke sukhe aur peele patte tod kar khet se door phenkein. Paani dete waqt patto par chheenate na padne dein.',
        name_hi: 'टमाटर अगेती झुलसा (Early Blight)',
        name_en: 'Tomato Early Blight',
        severity: 'High Risk',
        steps_hi: {
          prep: 'नीम का तेल 5 मिली प्रति लीटर पानी (1 मिली लिक्विड सोप मिलाकर) या 5 ग्राम ट्राइकोडर्मा विरिडी पाउडर प्रति लीटर पानी में अच्छी तरह घोलें।',
          apply: 'हर 7 से 10 दिनों में सुबह की पहली धूप या शाम को पत्तों के ऊपर व नीचे समान रूप से छिड़काव करें।',
          prevent: 'निचले पीले और सूखे पत्तों को तुरंत काटकर खेत से दूर नष्ट करें। ड्रिप से सिंचाई करें ताकि पत्तों पर पानी न ठहरे।',
        },
        steps_en: {
          prep: 'Mix 5 ml pure Neem Oil per liter of water with 1 ml mild soap emulsifier, OR dissolve 5g Trichoderma viride powder per liter.',
          apply: 'Spray thoroughly on both upper and lower leaf surfaces every 7-10 days during early morning or late evening.',
          prevent: 'Prune affected lower foliage and discard safely away from crops. Use drip irrigation to prevent water splashing on leaves.',
        },
      },
      is_healthy: false,
    },
    {
      disease: 'Tomato_healthy',
      confidence: 98.7,
      solution: {
        solution: 'Fasal poori tarah swasth hai! Jeevamrut ya Panchagavya ka poshan dete rahein taaki immunity bani rahe.',
        solution_hindi: 'फसल बिल्कुल स्वस्थ है! 👍 जीवामृत या पंचगव्य का पोषण देते रहें।',
        solution_english: 'Crop is healthy & vibrant! 👍 Continue organic nourishment.',
        dosage: '100 ml Jeevamrut prati litre paani (tonic ke roop mein).',
        frequency: 'Harr 15 se 20 din mein ek baar chhidkaav ya sinchai ke saath dein.',
        seasonal_tip: 'Niyamit nigrani rakhein aur mitti mein nami santulit rakhein. Fasal ko samay par poshan dein.',
        name_hi: 'स्वस्थ पौधा (Healthy Plant)',
        name_en: 'Healthy Tomato Plant',
        severity: 'Healthy',
        steps_hi: {
          prep: '100 मिली देसी जीवामृत ताजे पानी में मिलाकर टॉनिक घोल तैयार करें।',
          apply: 'हर 15 से 20 दिनों में एक बार जड़ों के पास व पत्तियों पर छिड़काव करें।',
          prevent: 'जैविक मल्चिंग बनाए रखें ताकि मिट्टी का तापमान व नमी अनुकूल रहे।',
        },
        steps_en: {
          prep: 'Dilute 100 ml organic Jeevamrut tonic in 1 liter of fresh water.',
          apply: 'Apply near root zone and light foliage spray every 15-20 days.',
          prevent: 'Maintain organic mulching and proper irrigation drainage.',
        },
      },
      is_healthy: true,
    },
    {
      disease: 'Tomato_Late_Blight',
      confidence: 89.4,
      solution: {
        solution: 'Copper Oxychloride (कॉपर ऑक्सीक्लोराइड) ya Pseudomonas fluorescens bio-fungicide ka ghol chhidkein. Thand aur nami mein yeh rog tezi se failta hai.',
        solution_hindi: 'कॉपर ऑक्सीक्लोराइड या स्यूडोमोनास फ्लोरोसेंस बायो-एजेंट + जल निकासी सुधारें।',
        solution_english: 'Use Copper Oxychloride or Pseudomonas fluorescens bio-fungicide + improve drainage.',
        dosage: '2.5 se 3 gram Copper Oxychloride prati litre paani YA 10 ml Pseudomonas liquid prati litre paani.',
        frequency: 'Harr 5 se 7 din mein lagataar chhidkaav karein jab tak naye patte swasth na aane lagein.',
        seasonal_tip: 'Kohre aur barsaat ke mausam mein paudho ke beech hawa aane dein. Jyada sankramit paudho ko turant khet se ukhaad kar jala dein.',
        name_hi: 'टमाटर पछेती झुलसा (Late Blight)',
        name_en: 'Tomato Late Blight',
        severity: 'High Risk',
        steps_hi: {
          prep: '2.5 से 3 ग्राम कॉपर ऑक्सीक्लोराइड (Copper Oxychloride) या 10 मिली स्यूडोमोनास फ्लोरोसेंस बायो-फंगिसाइड प्रति लीटर पानी में घोलें।',
          apply: 'हर 5 से 7 दिन में लगातार 2 से 3 बार पत्तियों और तने पर गहरा छिड़काव करें।',
          prevent: 'बरसात या कोहरे के समय पौधों के बीच हवा का संचार रखें। गंभीर रूप से बीमार पौधों को उखाड़कर नष्ट करें।',
        },
        steps_en: {
          prep: 'Dissolve 2.5 to 3 grams of Copper Oxychloride or 10 ml Pseudomonas fluorescens bio-agent per liter of water.',
          apply: 'Spray generously over canopy and stems every 5-7 days until new healthy growth emerges.',
          prevent: 'Ensure adequate field spacing for airflow during foggy, humid weather. Uproot and burn irreversibly damaged plants.',
        },
      },
      is_healthy: false,
    },
    {
      disease: 'Tomato_Leaf_Mold',
      confidence: 86.1,
      solution: {
        solution: 'Bacillus subtilis bio-fungicide (बायो-कंट्रोल एजेंट) ka upyog karein. Yeh patte ke pichhle hisse me fafund ko natural tarike se rokta hai.',
        solution_hindi: 'बैसिलस सबटिलिस बायो-कंट्रोल का छिड़काव करें और हवा का संचार बढ़ाएं।',
        solution_english: 'Spray Bacillus subtilis bio-fungicide and improve canopy ventilation.',
        dosage: '5 ml Bacillus subtilis liquid prati litre paani YA 5 gram bio-fungicide powder.',
        frequency: 'Harr 7 se 10 din mein dhoop nikalne par patto ke dono taraf achhi tarah spray karein.',
        seasonal_tip: 'Greenhouse ya khet mein ventilation (hawa) badhayein taaki nami 80% se kam rahe. Patte sukhe rehne se fungus nahi papti.',
        name_hi: 'टमाटर लीफ मोल्ड / पत्ता फफूंद (Leaf Mold)',
        name_en: 'Tomato Leaf Mold',
        severity: 'Low Risk',
        steps_hi: {
          prep: '5 मिली बैसिलस सबटिलिस (Bacillus subtilis) बायो-फंगिसाइड प्रति लीटर ताजे पानी में अच्छी तरह मिलाएं।',
          apply: 'धूप निकलने पर हर 7 से 10 दिन में पत्तियों के पिछले हिस्से (निचली सतह) पर विशेष रूप से छिड़कें।',
          prevent: 'पॉलीहाउस या खेत में हवा का आवागमन बढ़ाएं ताकि नमी 80% से नीचे रहे। पत्तियों को सूखा रखना सबसे बड़ा बचाव है।',
        },
        steps_en: {
          prep: 'Dilute 5 ml of Bacillus subtilis bio-fungicide per liter of fresh water.',
          apply: 'Spray underside of foliage once every 7 to 10 days during sunny hours.',
          prevent: 'Improve ventilation to keep canopy humidity below 80%.',
        },
      },
      is_healthy: false,
    },
  ];

  return mockResults[Math.floor(Math.random() * mockResults.length)];
};
