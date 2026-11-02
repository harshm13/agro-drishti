import axios from 'axios';

// Backend Base URL
export const BACKEND_URL = 'http://localhost:5000';

// In-memory CSRF Token Storage
let inMemoryCsrfToken = null;

export const setCsrfToken = (token) => {
  inMemoryCsrfToken = token;
};

export const getCsrfToken = () => inMemoryCsrfToken;

// Central Axios instance with credentials enabled for session cookies
export const apiClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  timeout: 15000,
});

// Request interceptor to attach X-CSRF-Token on state-changing requests
apiClient.interceptors.request.use(
  (config) => {
    const method = config.method ? config.method.toLowerCase() : '';
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      if (inMemoryCsrfToken) {
        config.headers['X-CSRF-Token'] = inMemoryCsrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to automatically capture csrf_token from responses
apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.csrf_token) {
      inMemoryCsrfToken = response.data.csrf_token;
    }
    return response;
  },
  (error) => Promise.reject(error)
);

/**
 * Check if the Flask backend server is alive and responding.
 */
export const checkBackendHealth = async () => {
  try {
    const response = await apiClient.get('/health', { timeout: 2500 });
    return response.status === 200 && response.data?.status === 'healthy';
  } catch (error) {
    return false;
  }
};

/* ==========================================================================
   AUTHENTICATION APIS
   ========================================================================== */

/**
 * Retrieves the current logged-in user profile and initializes CSRF token.
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/auth/me');
    if (response.data?.csrf_token) {
      setCsrfToken(response.data.csrf_token);
    }
    return response.data?.user || null;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

/**
 * Authenticates user via email and password.
 */
export const loginUser = async (email, password) => {
  const response = await apiClient.post('/api/auth/login', { email, password });
  if (response.data?.csrf_token) {
    setCsrfToken(response.data.csrf_token);
  }
  return response.data?.user;
};

/**
 * Registers a new standard user account.
 */
export const registerUser = async (name, email, password) => {
  const response = await apiClient.post('/api/auth/register', { name, email, password });
  if (response.data?.csrf_token) {
    setCsrfToken(response.data.csrf_token);
  }
  return response.data?.user;
};

/**
 * Logs out the current user and clears session.
 */
export const logoutUser = async () => {
  try {
    await apiClient.post('/api/auth/logout');
  } finally {
    setCsrfToken(null);
  }
};

/* ==========================================================================
   SCAN HISTORY APIS (Logged-in User)
   ========================================================================== */

/**
 * Fetches the logged-in user's scan history.
 */
export const getUserHistory = async () => {
  const response = await apiClient.get('/api/history');
  return response.data?.history || [];
};

/**
 * Deletes a single scan history item belonging to the current user.
 */
export const deleteScanHistory = async (scanId) => {
  const response = await apiClient.delete(`/api/history/${scanId}`);
  return response.data;
};

/* ==========================================================================
   INFERENCE & PREDICTION APIS
   ========================================================================== */

/**
 * Real API call sending image payload to Flask backend on port 5000.
 */
export const predictDiseaseReal = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await apiClient.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return response.data;
};

/**
 * Explicit Mock/Demo simulation mode (only when activated by the user).
 */
export const predictDiseaseMock = async (imageFile) => {
  // Simulate 1.6s neural network inference delay
  await new Promise((resolve) => setTimeout(resolve, 1600));

  const mockDatabase = [
    {
      disease: 'Tomato_Early_blight',
      confidence: 94.6,
      is_healthy: false,
      solution: {
        name_en: 'Tomato Early Blight',
        name_hi: 'टमाटर अगेती झुलसा (Early Blight)',
        status_en: '⚠️ Infected (Early Blight)',
        status_hi: '⚠️ रोग ग्रस्त (अगेती झुलसा)',
        dosage: '5 ml Neem Oil / Liter (or 5g Trichoderma viride)',
        frequency: 'Every 7-10 days in early morning or late evening',
        seasonal_tip: 'Prune affected bottom foliage. Avoid overhead splashing to stop Alternaria fungal spores.',
        steps_en: {
          prep: 'Mix 5 ml pure cold-pressed Neem Oil per liter of water with 1 ml mild liquid soap emulsifier, OR dissolve 5g Trichoderma viride powder.',
          apply: 'Spray thoroughly on both upper and lower leaf surfaces every 7-10 days during dawn or dusk.',
          prevent: 'Prune lower diseased foliage with clean shears. Use drip irrigation or straw mulching to keep leaves dry.'
        },
        steps_hi: {
          prep: 'नीम का तेल 5 मिली प्रति लीटर पानी (1 मिली लिक्विड सोप मिलाकर) या 5 ग्राम ट्राइकोडर्मा विरिडी पाउडर प्रति लीटर पानी में घोलें।',
          apply: 'हर 7 से 10 दिनों में सुबह की पहली धूप या शाम को पत्तों के ऊपर व नीचे समान रूप से छिड़काव करें।',
          prevent: 'निचले पीले और सूखे पत्तों को तुरंत काटकर खेत से दूर नष्ट करें। ड्रिप से सिंचाई करें ताकि पत्तों पर पानी न ठहरे।'
        },
        audio_en: 'AgroDrishti diagnosis: Tomato Early Blight detected. Spray 5 ml Neem oil per liter of water every 7 to 10 days. Prune affected bottom leaves.',
        audio_hi: 'एग्रोदृष्टि निदान: आपके टमाटर के पौधे में अगेती झुलसा रोग पाया गया है। पांच मिलीलीटर नीम तेल प्रति लीटर पानी में मिलाकर हर 7 से 10 दिन में छिड़कें।'
      },
      top_predictions: [
        { disease: 'Tomato_Early_blight', confidence: 94.6 },
        { disease: 'Tomato_Late_blight', confidence: 4.8 }
      ]
    },
    {
      disease: 'Tomato_healthy',
      confidence: 98.7,
      is_healthy: true,
      solution: {
        name_en: 'Healthy Tomato Plant',
        name_hi: 'स्वस्थ टमाटर पौधा (Healthy)',
        status_en: '✅ Healthy & Thriving (100% Disease Free)',
        status_hi: '✅ स्वस्थ एवं सुरक्षित (100% रोगमुक्त)',
        dosage: '100 ml Jeevamrut / Liter (or 20 ml Panchagavya)',
        frequency: 'Once every 15-20 days for immunity and vigor',
        seasonal_tip: 'Continue regular crop monitoring. Maintain organic soil mulching for root moisture balance.',
        steps_en: {
          prep: 'Dilute 100 ml organic Jeevamrut tonic or 20 ml Panchagavya bio-nutrient in 1 liter of fresh water.',
          apply: 'Drench around root zone and light foliage spray every 15-20 days for vibrant crop immunity.',
          prevent: 'Maintain consistent moisture and apply organic straw mulching to suppress weeds and prevent future root infections.'
        },
        steps_hi: {
          prep: '100 मिली देसी जीवामृत या 20 मिली पंचगव्य टॉनिक प्रति लीटर ताजे पानी में मिलाएं।',
          apply: 'हर 15 से 20 दिनों में एक बार पत्तियों और जड़ों के आसपास पोषण के लिए छिड़काव करें।',
          prevent: 'मिट्टी में जैविक मल्चिंग (पुआल की परत) बिछाएं और जल निकासी दुरुस्त रखें ताकि पौधे हमेशा रोगमुक्त रहें।'
        },
        audio_en: 'Congratulations! Your tomato plant is completely healthy. Continue maintenance with organic bio-tonics like Jeevamrut for optimal yield.',
        audio_hi: 'बधाई हो! आपकी टमाटर की फसल बिल्कुल स्वस्थ है। पौधे की रोग प्रतिरोधक क्षमता बनाए रखने के लिए जीवामृत का नियमित पोषण देते रहें।'
      },
      top_predictions: [
        { disease: 'Tomato_healthy', confidence: 98.7 },
        { disease: 'Tomato_Early_blight', confidence: 1.1 }
      ]
    },
    {
      disease: 'Tomato_Late_blight',
      confidence: 91.2,
      is_healthy: false,
      solution: {
        name_en: 'Tomato Late Blight',
        name_hi: 'टमाटर पछेती झुलसा (Late Blight)',
        status_en: '⚠️ Severely Infected (Late Blight)',
        status_hi: '⚠️ गंभीर रोग ग्रस्त (पछेती झुलसा)',
        dosage: '2.5g Copper Oxychloride / Liter (or 10 ml Pseudomonas fluorescens)',
        frequency: 'Every 5 to 7 days continuously until new growth appears',
        seasonal_tip: 'Critical during foggy and humid weather. Maintain wide row spacing for canopy ventilation.',
        steps_en: {
          prep: 'Dissolve 2.5 to 3 grams of Copper Oxychloride or 10 ml Pseudomonas fluorescens bio-agent per liter of water.',
          apply: 'Spray generously over canopy and stems every 5-7 days until new healthy growth emerges.',
          prevent: 'Ensure adequate field spacing for airflow during foggy, humid weather. Uproot and burn irreversibly damaged plants.'
        },
        steps_hi: {
          prep: '2.5 से 3 ग्राम कॉपर ऑक्सीक्लोराइड या 10 मिली स्यूडोमोनास फ्लोरोसेंस बायो-फंगिसाइड प्रति लीटर पानी में घोलें।',
          apply: 'हर 5 से 7 दिन में लगातार 2 से 3 बार पत्तियों और तने पर गहरा छिड़काव करें।',
          prevent: 'बरसात या कोहरे के समय पौधों के बीच हवा का संचार रखें। गंभीर रूप से बीमार पौधों को उखाड़कर नष्ट करें।'
        },
        audio_en: 'AgroDrishti diagnosis: Late Blight detected. Spray 2.5 grams Copper Oxychloride or Pseudomonas solution every 5 to 7 days.',
        audio_hi: 'एग्रोदृष्टि निदान: आपके पौधे में पछेती झुलसा रोग है। ढाई ग्राम कॉपर ऑक्सीक्लोराइड का घोल बनाकर हर 5 से 7 दिन में छिड़काव करें।'
      },
      top_predictions: [
        { disease: 'Tomato_Late_blight', confidence: 91.2 },
        { disease: 'Tomato_Early_blight', confidence: 7.9 }
      ]
    },
    {
      disease: 'Tomato_Leaf_Mold',
      confidence: 88.4,
      is_healthy: false,
      solution: {
        name_en: 'Tomato Leaf Mold',
        name_hi: 'टमाटर लीफ मोल्ड / पत्ता फफूंद (Leaf Mold)',
        status_en: '⚠️ Infected (Leaf Mold)',
        status_hi: '⚠️ रोग ग्रस्त (पत्ता फफूंद)',
        dosage: '5 to 8 ml Bacillus subtilis / Liter water',
        frequency: 'Every 7-10 days on underside of leaves',
        seasonal_tip: 'Reduce greenhouse humidity below 80%. Ensure foliage stays dry to prevent mold propagation.',
        steps_en: {
          prep: 'Dilute 5 to 8 ml Bacillus subtilis liquid or 5g bio-fungicide powder per liter of fresh water.',
          apply: 'Spray thoroughly under leaf surfaces every 7 to 10 days in sunny weather.',
          prevent: 'Increase greenhouse or canopy aeration to keep humidity under 80%. Dry leaves naturally prevent mold spores from spreading.'
        },
        steps_hi: {
          prep: '5 से 8 मिली बैसिलस सबटिलिस या 5 ग्राम ट्राइकोडर्मा विरिडी बायो-फंगिसाइड प्रति लीटर ताजे पानी में घोलें।',
          apply: 'धूप निकलने पर हर 7 से 10 दिन में पत्तियों के पिछले हिस्से पर विशेष रूप से छिड़कें।',
          prevent: 'खेत या पॉलीहाउस में हवा का आवागमन बढ़ाएं ताकि नमी 80% से नीचे रहे। पत्तियों को सूखा रखें।'
        },
        audio_en: 'AgroDrishti diagnosis: Leaf Mold identified. Apply Bacillus subtilis bio-fungicide to the underside of foliage.',
        audio_hi: 'एग्रोदृष्टि निदान: आपके पौधे में लीफ मोल्ड यानी पत्ता फफूंद है। बैसिलस सबटिलिस बायो-फंगिसाइड का घोल पत्तों के पीछे छिड़कें।'
      },
      top_predictions: [
        { disease: 'Tomato_Leaf_Mold', confidence: 88.4 },
        { disease: 'Tomato_Early_blight', confidence: 8.5 }
      ]
    }
  ];

  const picked = mockDatabase[Math.floor(Math.random() * mockDatabase.length)];
  return {
    ...picked,
    is_demo: true
  };
};

/* ==========================================================================
   ADMIN & BIOTECH REVIEW APIS (Admin Only)
   ========================================================================== */

/**
 * Returns real aggregate system counts from SQLite.
 */
export const getAdminStats = async () => {
  const response = await apiClient.get('/api/admin/stats');
  return response.data;
};

/**
 * Fetches user list with roles and creation dates (excluding passwords).
 */
export const getAdminUsers = async () => {
  const response = await apiClient.get('/api/admin/users');
  return response.data?.users || [];
};

/**
 * Updates a user's role ('user' or 'admin').
 */
export const updateUserRole = async (userId, role) => {
  const response = await apiClient.put(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};

/**
 * Fetches active bio-solutions and pending drafts.
 */
export const getAdminSolutions = async () => {
  const response = await apiClient.get('/api/admin/solutions');
  return response.data;
};

/**
 * Submits a new biotech solution draft for admin review.
 */
export const submitSolutionDraft = async (payload) => {
  const response = await apiClient.post('/api/admin/solutions/draft', payload);
  return response.data;
};

/**
 * Approves a solution draft and applies it to live bio_solutions.json.
 */
export const approveSolutionDraft = async (draftId) => {
  const response = await apiClient.post(`/api/admin/solutions/draft/${draftId}/approve`);
  return response.data;
};

/**
 * Rejects a solution draft.
 */
export const rejectSolutionDraft = async (draftId) => {
  const response = await apiClient.post(`/api/admin/solutions/draft/${draftId}/reject`);
  return response.data;
};
