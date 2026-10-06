import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client to avoid crashes on startup
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      try {
        aiClient = new GoogleGenAI({ apiKey: key });
      } catch (error) {
        console.error("Failed to initialize GoogleGenAI client:", error);
      }
    }
  }
  return aiClient;
}

// 1. API: Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Lazy-loaded Stripe client to avoid crashes on startup
import Stripe from "stripe";
let stripeClient: Stripe | null = null;
function getStripeClient(): Stripe | null {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (key && key !== "MY_STRIPE_SECRET_KEY" && key.trim() !== "") {
      try {
        stripeClient = new Stripe(key, { apiVersion: "2023-10-16" as any });
      } catch (error) {
        console.error("Failed to initialize Stripe client:", error);
      }
    }
  }
  return stripeClient;
}

// Stripe Checkout Session Creation API
app.post("/api/create-checkout-session", async (req, res) => {
  const { planId, planName, price, period } = req.body;
  const stripe = getStripeClient();

  if (!stripe) {
    // If Stripe is not configured, we return a response indicating simulation mode.
    // This avoids breaking the app if the key is missing, and allows the frontend to run in a polished simulated way.
    return res.json({
      success: true,
      mode: "simulation",
      message: "STRIPE_SECRET_KEY is not configured on the backend. Initiating high-fidelity payment simulation.",
      sessionId: `mock_sess_${Date.now()}`
    });
  }

  try {
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `HomePulse AI - ${planName} Plan`,
              description: `Upgrade your home to the ${planName} subscription tier (${period} billing).`,
            },
            unit_amount: Math.round(price * 100), // convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${appUrl}?payment_success=true&plan_id=${planId}`,
      cancel_url: `${appUrl}?payment_cancelled=true`,
    } as any);

    res.json({
      success: true,
      mode: "live",
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error("Stripe Checkout Session creation failed:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
});


// 2. API: Home Analysis Onboarding
app.post("/api/analyze-home", async (req, res) => {
  const { propertyType, yearBuilt, squareFeet, climateZone, hvacType, plumbingAge } = req.body;

  const currentYear = 2026;
  const age = currentYear - parseInt(yearBuilt || "2015");
  
  // Calculate a baseline score based on parameters
  let calculatedScore = 88;
  if (age > 20) calculatedScore -= 10;
  if (age > 40) calculatedScore -= 10;
  if (plumbingAge === "old") calculatedScore -= 8;
  if (hvacType === "old") calculatedScore -= 7;
  calculatedScore = Math.max(50, Math.min(100, calculatedScore));

  const client = getAiClient();
  if (client) {
    try {
      const prompt = `
        You are HomePulse AI, a preventive home maintenance analyst.
        Analyze this property:
        - Type: ${propertyType || "Single Family Home"}
        - Age: ${age} years old (Built: ${yearBuilt})
        - Size: ${squareFeet || "2,000"} sqft
        - Climate Zone: ${climateZone || "Moderate"}
        - HVAC System: ${hvacType || "Standard Central"}
        - Plumbing Condition: ${plumbingAge || "Good"}

        Please return a JSON object with the following fields:
        {
          "score": number (between 50 and 100),
          "status": "Good" | "Fair" | "Critical",
          "summary": "Brief 1-2 sentence description of overall health status.",
          "checklist": string[] (4 items detailing analysis milestones),
          "tasks": [
            {
              "title": "Task Name",
              "due": "Date or time window (e.g. In 2 weeks)",
              "priority": "High" | "Medium" | "Low",
              "why": "Brief explanation of why this is important",
              "how": "1-sentence summary of how to do it",
              "who": "DIY" | "Pro Recommended",
              "where": "Location in the house"
            }
          ]
        }
        Do not output any markdown code blocks, just raw JSON.
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      // Strip markdown code block if Gemini includes it
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const report = JSON.parse(cleanJson);
      return res.json(report);
    } catch (error) {
      console.warn("Gemini API Onboarding Analysis failed, using robust fallback.", error);
    }
  }

  // Robust Fallback Report if Gemini is unavailable or errors
  const fallbackTasks = [
    {
      title: hvacType === "old" ? "Professional HVAC Tune-up" : "HVAC Filter Replacement",
      due: "In 1 week",
      priority: hvacType === "old" ? "High" : "Medium",
      why: "Ensure system is running efficiently, prevent coil freezing, and maintain high air flow quality.",
      how: "Locate the return air grille or furnace chamber, pull out the old filter, and slide in a matching size MERV 8-11 filter.",
      who: hvacType === "old" ? "Pro Recommended" : "DIY",
      where: "Main Return Grille & Basement Air Handler"
    },
    {
      title: age > 25 ? "Plumbing Pressure Relief Valve Test" : "Water Heater Flush & Drain",
      due: "In 3 weeks",
      priority: age > 25 ? "High" : "Medium",
      why: "Remove sediment buildup, extend the lifetime of your heating elements, and prevent tank rust/ruptures.",
      how: "Turn off heating source, attach a standard garden hose to the drain valve, run the other end outside, and open the valve to flush.",
      who: "DIY",
      where: "Water Heater Tank Closet"
    },
    {
      title: "Gutter Clear & Downspout Cleanse",
      due: "In 4 weeks",
      priority: "High",
      why: "Avoid roof water backup, wood rot along the fascia boards, and wet basement foundations from poor drainage.",
      how: "Use a sturdy ladder, scoop leaves and organic debris out of gutters, and flush downspouts with a pressurized garden hose.",
      who: "DIY or Pro",
      where: "Exterior Roofline & Perimeter Drain Points"
    }
  ];

  const report = {
    score: calculatedScore,
    status: calculatedScore >= 80 ? "Good" : calculatedScore >= 65 ? "Fair" : "Critical",
    summary: `Your home is in ${calculatedScore >= 80 ? "Good" : "Fair"} health. Some system components are aging and require attention to prevent high-cost breakdowns.`,
    checklist: [
      "Analyzing HVAC systems and cooling efficiency...",
      "Checking local weather risks and regional climate factors...",
      "Building customized preventive maintenance schedule...",
      "Calculating property-specific structural safety score..."
    ],
    tasks: fallbackTasks
  };

  res.json(report);
});

// 3. API: Chat Diagnostician with Gemini AI
app.post("/api/chat", async (req, res) => {
  const { messages, currentInput } = req.body;

  const client = getAiClient();
  if (client) {
    try {
      // Build a simple chat history
      const formattedHistory = (messages || []).map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      // Add the final user message to contents
      formattedHistory.push({
        role: "user",
        parts: [{ text: currentInput }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedHistory,
        config: {
          systemInstruction: `
            You are HomePulse AI, a predictive home maintenance assistant.
            You help homeowners identify problems early and maintain their appliances, plumbing, and structural systems.
            Keep your answers highly concise, professional, structured, and action-oriented.
            Suggest clear DIY test steps first, then advise when a professional is needed.
            Utilize brief bullet points, and do not write long paragraphs.
          `
        }
      });

      return res.json({ text: response.text });
    } catch (error) {
      console.warn("Gemini Chat failed, using high-fidelity local diagnostician.", error);
    }
  }

  // Local rule-based high-fidelity diagnostic engine
  const query = (currentInput || "").toLowerCase();
  let reply = "";

  if (query.includes("ac") || query.includes("air conditioner") || query.includes("warm air")) {
    reply = `I suspect a low refrigerant charge or a dirty condenser coil. Let's do a quick diagnostic check:

1. **Check Thermostat Settings**: Ensure it is set to "Cool" and the fan is on "Auto" rather than "On".
2. **Inspect the Air Filter**: A heavily clogged filter restricts airflow, causing the coil to freeze and blow lukewarm air.
3. **Check the Outdoor Unit**: Go outside and inspect the condenser. Is it covered in dirt, leaves, or grass clippings? If so, turn off power and gently spray it with a garden hose.
4. **Is the Compressor Humming?**: Listen to the outdoor unit. If the fan runs but you don't hear the compressor, the run capacitor might be blown (which is a fast, cheap repair for a pro).

Would you like me to add an "AC Condenser Cleansing" task to your HomePulse checklist, or help you schedule a vetted local HVAC technician?`;
  } else if (query.includes("leak") || query.includes("water") || query.includes("plumbing")) {
    reply = `Water leaks require urgent attention to prevent structural rot and mold. Here is your urgent inspection checklist:

1. **Locate the Source**: Check under kitchen/bathroom cabinets with a flashlight. Look for water rings, damp wood, or active drips.
2. **Check the Water Meter**: Turn off all taps in the house. Watch the leak indicator triangle on your water meter. If it is spinning, you have a hidden pressurized leak.
3. **Inspect the Water Heater**: Check the relief valve pipe and the bottom tank weld for rusting or condensation pooling.
4. **Main Shut-off Awareness**: Ensure you know where your main house water shut-off valve is (usually near the water meter or curb) in case a pipe bursts.

Should I walk you through testing your main shut-off valve, or add a plumbing audit task to your HomeHealth calendar?`;
  } else if (query.includes("roof") || query.includes("gutter") || query.includes("shingle")) {
    reply = `Roofing issues are best intercepted before a major rainstorm. Let's look for warning signs:

1. **Ground-Level Shingle Scan**: Walk around your yard with binoculars. Look for curling, buckling, or bald shingles (loss of granules).
2. **Attic Moisture Check**: Go up into the attic on a bright day. Look for light beams passing through, water stains on rafter boards, or mold smell.
3. **Gutter Overflow Inspection**: During the next rain, check if water is cascading over gutter edges rather than flowing out the downspouts. This indicates heavy leaf blockages.

I've logged a high-priority "Attic and Flashing Check" in your task center. Would you like a step-by-step DIY guide or a local roofing quote?`;
  } else if (query.includes("humidity") || query.includes("mold") || query.includes("musty")) {
    reply = `High humidity (above 60%) encourages mold spores, while dry air (below 30%) irritates skin and wooden frames.

1. **Measure with a Hygrometer**: Check room-by-room readings. Target 35% - 50% humidity.
2. **Ventilation check**: Always run bathroom exhaust fans for 20 minutes post-shower. Ensure dryer duct lines exhaust fully to the exterior.
3. **Crawlspace Audit**: Check for standing water or exposed wet soil under your subfloor.

I can schedule a periodic reminder to test your crawlspace sump pump. Would you like to proceed?`;
  } else {
    reply = `I'm on standby to analyze your home systems! It sounds like you are managing your home's long-term durability. To help you prevent expensive repairs:

* **What system are you checking?** (e.g. HVAC, plumbing, water heater, roof, electrical panel).
* **Are you noticing any signs of wear?** (noises, slow drains, weird smells, high utility bills).
* **DIY vs Pro**: I can provide either detailed DIY walk-throughs or estimate pro repair costs so you don't get overcharged.

Let me know what you'd like to investigate next, or choose one of our quick diagnostic prompts below!`;
  }

  res.json({ text: reply });
});

// 4. API: Generate Suggested Mitigation Plan using Gemini AI
app.post("/api/mitigate-risk", async (req, res) => {
  const { id, title, level, description, precaution } = req.body;

  const client = getAiClient();
  if (client) {
    try {
      const prompt = `
        You are HomePulse AI, an expert home safety and preventative risk analyst.
        Generate a suggested, highly practical and structured step-by-step mitigation plan to mitigate this specific active risk:
        - Risk ID: ${id || "custom"}
        - Title: ${title || "Home Threat"}
        - Level: ${level || "Medium"}
        - Description: ${description || ""}
        - Precaution: ${precaution || ""}

        Please provide the response in a structured JSON format containing the following fields:
        {
          "summary": "A concise 1-2 sentence overview of the mitigation approach.",
          "steps": [
            {
              "title": "Short title of step",
              "detail": "Actionable description of what to do (be specific and clear)",
              "difficulty": "Easy" | "Medium" | "Hard"
            }
          ],
          "estimatedCost": "DIY (<$50)" | "$50-$200" | "$200-$1000" | "Pro Required (High Cost)"
        }
        Provide only valid JSON in your response. Do not use any markdown formatting, backticks, or other text outside the JSON block.
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const plan = JSON.parse(cleanJson);
      return res.json(plan);
    } catch (error) {
      console.warn("Gemini Mitigation Plan generation failed, using robust fallback.", error);
    }
  }

  // Fallback plans if Gemini is not available or errors out
  let fallbackPlan = {
    summary: "A robust mitigation strategy focused on proactive equipment protection and early testing.",
    steps: [
      {
        title: "Immediate System Audit",
        detail: "Audit the relevant home systems to ensure all sensors, valves, and switches operate correctly.",
        difficulty: "Easy"
      },
      {
        title: "Deploy Physical Safeguards",
        detail: "Clear structural blocks, seal vents, or use shades depending on the specific threat type.",
        difficulty: "Medium"
      },
      {
        title: "Verify Countermeasures",
        detail: "Monitor system load metrics or room sensors to ensure temperature/moisture ranges stabilize.",
        difficulty: "Easy"
      }
    ],
    estimatedCost: "DIY (<$50)"
  };

  const titleLower = (title || "").toLowerCase();
  if (titleLower.includes("heatwave") || id === "risk_1") {
    fallbackPlan = {
      summary: "A cooling safety blueprint to prepare your HVAC compressor and lower interior solar thermal load before the day begins.",
      steps: [
        {
          title: "Pre-Cool the Property",
          detail: "Set your thermostat to 70°F overnight. This builds a cold buffer in your drywalls and furniture before peak heat.",
          difficulty: "Easy"
        },
        {
          title: "Lock Down Solar Entrances",
          detail: "Pull down all South and West-facing window blinds, curtains, and shades by 9:00 AM to deflect radiant solar rays.",
          difficulty: "Easy"
        },
        {
          title: "Clear AC Condensate Line",
          detail: "Verify the drain pipe near your furnace isn't clogged. Pour 1 cup of white vinegar down the drain to kill algae blocks.",
          difficulty: "Medium"
        },
        {
          title: "Optimize Ventilation Loop",
          detail: "Switch off secondary heat sources like dishwashers or ovens between 2:00 PM and 8:00 PM. Run ceiling fans counter-clockwise.",
          difficulty: "Easy"
        }
      ],
      estimatedCost: "DIY (<$50)"
    };
  } else if (titleLower.includes("overuse") || id === "risk_2") {
    fallbackPlan = {
      summary: "An HVAC system defense strategy designed to reduce duty cycle wear, prevent blower freezing, and guarantee air flow.",
      steps: [
        {
          title: "Replace Air Filters",
          detail: "A clogged filter restricts airflow, causing the cooling coil to drop below freezing, turning into ice and halting cooling.",
          difficulty: "Easy"
        },
        {
          title: "Set Moderate Temperature Margins",
          detail: "Keep your cooling setpoint at 78°F or higher during peak hours (2:00 PM to 6:00 PM). Each degree cooler increases workload by 8%.",
          difficulty: "Easy"
        },
        {
          title: "Verify Air Grille Access",
          detail: "Walk the house and ensure furniture, rugs, or curtains are not blocking any supply register vents or return grilles.",
          difficulty: "Easy"
        },
        {
          title: "Inspect Outside Condenser Fan",
          detail: "Ensure there are no weeds, tall grasses, or debris blocking airflow within 2 feet of the external outdoor unit.",
          difficulty: "Medium"
        }
      ],
      estimatedCost: "DIY (<$50)"
    };
  } else if (titleLower.includes("humidity") || id === "risk_3") {
    fallbackPlan = {
      summary: "A wood structural defense plan to preserve high-end oak panels and prevent dry air cracking.",
      steps: [
        {
          title: "Audit Central Humidifier Bypass",
          detail: "Check the duct damper on your central humidifier. Ensure it is switched to 'WINTER' or 'OPEN' and set the humidistat to 38%.",
          difficulty: "Easy"
        },
        {
          title: "Deploy Zone-Specific Vaporizers",
          detail: "Set up small ultrasonic portable vaporizers directly in rooms with premium solid wood dining sets or oak paneling.",
          difficulty: "Easy"
        },
        {
          title: "Monitor Solid Wood Joint Tolerances",
          detail: "Inspect flooring planks and window frame trims for hairline gaps. Maintain humidity above 30% to stop contraction.",
          difficulty: "Easy"
        }
      ],
      estimatedCost: "DIY (<$50)"
    };
  }

  res.json(fallbackPlan);
});

// 5. API: Gemini AI Task Smart Reordering & Prioritization
app.post("/api/reorder-tasks", async (req, res) => {
  const { tasks, systems } = req.body;

  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: "Invalid tasks format" });
  }

  const systemsList = Array.isArray(systems) ? systems : [];

  // Local fallback logic (always calculated first as a secure fallback and comparison baseline)
  const scoredTasks = tasks.map((task: any) => {
    let score = 0;
    let systemName = "General";
    
    if (task.completed) {
      score = -1000; // Put completed tasks at the absolute bottom
    } else {
      if (task.priority === "High") score += 50;
      else if (task.priority === "Medium") score += 30;
      else score += 10;

      // Map tasks to home systems to factor in system health
      const titleLower = (task.title || "").toLowerCase();
      const whyLower = (task.why || "").toLowerCase();
      
      const matchingSystem = systemsList.find((sys: any) => {
        const sysName = (sys.name || "").toLowerCase();
        const sysCat = (sys.category || "").toLowerCase();
        return titleLower.includes(sysName) || 
               whyLower.includes(sysName) || 
               titleLower.includes(sysCat) || 
               whyLower.includes(sysCat);
      });

      if (matchingSystem) {
        systemName = matchingSystem.name;
        // Lower health is a massive boost to risk factor
        const systemRisk = 100 - (matchingSystem.health || 80);
        score += systemRisk * 1.8;
      }
    }
    return { id: task.id, score, title: task.title, systemName };
  });

  // Sort by score descending
  const sortedTasks = [...scoredTasks].sort((a: any, b: any) => b.score - a.score);
  const fallbackOrderedTaskIds = sortedTasks.map((t: any) => t.id);
  
  const fallbackReasonings = sortedTasks.reduce((acc: any, t: any) => {
    if (t.score === -1000) {
      acc[t.id] = `"${t.title}" is already complete. Placed at lower priority.`;
    } else {
      acc[t.id] = `Scheduled based on ${t.systemName} health and preset priority weight of ${t.score.toFixed(0)} points.`;
    }
    return acc;
  }, {});

  const fallbackOverview = "Prioritized maintenance workflow based on urgency and structural risk vectors.";

  const client = getAiClient();
  if (client) {
    try {
      const prompt = `
        You are HomePulse AI, an expert predictive home safety and preventative maintenance planner.
        You need to re-order the given maintenance tasks to maximize home durability, safety, and minimize total cost of repair.
        
        Analyze these inputs:
        1. Home Systems current health stats:
        ${JSON.stringify(systemsList, null, 2)}
        
        2. Unordered Tasks:
        ${JSON.stringify(tasks, null, 2)}
        
        Reorder the tasks. Prioritize tasks that target systems with lower health (especially below 80%) or life-safety tasks (like Smoke Detectors) to prevent high-cost emergency breakdowns.
        
        Please return a JSON response matching this EXACT schema:
        {
          "orderedTaskIds": ["task_id_1", "task_id_2", ...],
          "reasonings": {
            "task_id_1": "Explanation of why this task is at this rank based on system health/urgency",
            "task_id_2": "Explanation..."
          },
          "overview": "A clear, concise 2-sentence summary of the priority shift recommendations."
        }
        
        Return ONLY valid raw JSON. No markdown code blocks, no backticks, no text before or after the JSON.
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const plan = JSON.parse(cleanJson);
      
      if (plan.orderedTaskIds && Array.isArray(plan.orderedTaskIds)) {
        return res.json({
          orderedTaskIds: plan.orderedTaskIds,
          reasonings: plan.reasonings || fallbackReasonings,
          overview: plan.overview || fallbackOverview,
          source: "gemini-ai"
        });
      }
    } catch (error) {
      console.warn("Gemini AI Smart Reordering failed, falling back to local priority algorithm.", error);
    }
  }

  // Return fallback if Gemini isn't available or fails
  res.json({
    orderedTaskIds: fallbackOrderedTaskIds,
    reasonings: fallbackReasonings,
    overview: fallbackOverview,
    source: "local-rule-engine"
  });
});

// 5. API: Appliance Spec Label & Node AI Digitizer Scanner
app.post("/api/scan-appliance-node", async (req, res) => {
  const { image, mimeType, preset } = req.body;

  // Pre-packaged rich simulated responses matching our presets
  const presets: Record<string, any> = {
    hvac: {
      name: "Carrier Comfort 92 Gas Furnace (SN: 1824A790)",
      category: "Mechanical",
      health: 85,
      status: "Good",
      lastInspected: "July 2026",
      details: "Carrier 92% AFUE gas furnace. Model: 59SC2D, Serial: 1824A790. Input 60,000 BTU/hr. Voltage 115V. Normal blower metrics & heat exchanger thermal telemetry.",
      warningThreshold: 75,
      reportingInterval: "Every 1 Hour",
      document: {
        name: "HVAC_Furnace_Spec_Label.png",
        type: "photo"
      },
      consumable: {
        name: "HVAC MERV 11 Air Filter (16x25x1)",
        currentLevel: 100,
        unit: "%",
        lifespanDays: 90,
        cost: 24,
        reorderLink: "https://www.google.com/search?q=16x25x1+merv+11+air+filter"
      },
      task: {
        title: "Replace HVAC MERV 11 Air Filter",
        why: "Restores optimal furnace airflow, maintains healthy indoor air quality, and prevents system micro-fatigue failures.",
        how: "1. Switch off furnace power locally. 2. Slide the dirty MERV filter out. 3. Insert the new 16x25x1 filter observing direction of airflow, and turn power back on.",
        who: "DIY"
      },
      savings: {
        category: "Energy Efficiency",
        amount: 180,
        description: "Standard HVAC air filter replacements save up to 15% on seasonal heating/cooling electric loads and extend blower shelf-life by 4 years."
      }
    },
    warranty: {
      name: "A.O. Smith Signature 40-Gal Gas Water Heater (SN: 2408H31)",
      category: "Plumbing",
      health: 90,
      status: "Good",
      lastInspected: "July 2026",
      details: "A.O. Smith Signature Series. Model: G6-T4040, Serial: 2408H31. Manufactured 2024. Active 6-Year Parts Warranty digitized and synced to Property Vault.",
      warningThreshold: 70,
      reportingInterval: "Every 24 Hours",
      document: {
        name: "AO_Smith_6Yr_Warranty_Sticker.pdf",
        type: "warranty"
      },
      consumable: {
        name: "Magnesium Sacrificial Anode Rod (3/4-inch)",
        currentLevel: 100,
        unit: "%",
        lifespanDays: 1825,
        cost: 45,
        reorderLink: "https://www.google.com/search?q=ao+smith+water+heater+anode+rod+reorder"
      },
      task: {
        title: "Flush Water Heater Sediments & Check Anode Rod",
        why: "Sediment build-ups at the heat exchanger base degrade heat transfer, trigger overheating thermal stress, and shorten cylinder lifespan.",
        how: "1. Turn gas control knob to PILOT. 2. Connect a garden hose to the lower drain bib leading to an safe outlet. 3. Open cold inlet and drain valve to purge calcium scaling.",
        who: "DIY"
      },
      savings: {
        category: "Preventive Maintenance ROI",
        amount: 240,
        description: "Annual core flushing restores water heating recovery rates by 12% and protects against major tank structural ruptures ($2,800)."
      }
    },
    barcode: {
      name: "Nest Learning Thermostat Gen 4 (SN: 09F87A1)",
      category: "Electrical",
      health: 98,
      status: "Optimal",
      lastInspected: "July 2026",
      details: "Nest Learning Thermostat v4. Product Code: T4017US, Serial/Barcode: 09F87A1. Active 24VAC HVAC wire interface. Firmware version verified at latest build.",
      warningThreshold: 80,
      reportingInterval: "Real-time Stream",
      document: {
        name: "Nest_Thermostat_Gen4_Receipt.pdf",
        type: "receipt"
      },
      consumable: {
        name: "Thermostat AAA Backup Cells",
        currentLevel: 100,
        unit: "%",
        lifespanDays: 365,
        cost: 8,
        reorderLink: "https://www.google.com/search?q=aaa+alkaline+batteries+pack"
      },
      task: {
        title: "Validate Smart Learning Schedule Calibration",
        why: "Reviewing automatic learning setpoints prevents accidental over-heating or cooling intervals.",
        how: "1. Open thermostat app dashboard. 2. Filter schedule presets and delete accidental override intervals. 3. Confirm Eco-temperature setbacks are engaged for vacancy loops.",
        who: "DIY"
      },
      savings: {
        category: "Smart Energy ROI",
        amount: 145,
        description: "Optimized smart learning settings shave up to 10% off gas furnace runtime and 15% off air conditioning electricity loads."
      }
    },
    meter: {
      name: "Itron Sentinel Smart Utility Grid Node",
      category: "Safety",
      health: 100,
      status: "Optimal",
      lastInspected: "July 2026",
      details: "Itron Sentinel Smart Grid Node Meter. Serial: 589210-S. Smart mesh radio transmitter running real-time load profile logging. Physical utility seals intact.",
      warningThreshold: 85,
      reportingInterval: "Real-time Stream",
      document: {
        name: "Smart_Utility_Meter_Compliance_Report.pdf",
        type: "report"
      },
      consumable: null,
      task: {
        title: "Audit Electrical Service Panel Main Breaker",
        why: "Identifying early wiring looseness or circuit-breaker thermal fatigue prevents electrical fire hazards.",
        how: "1. Open electrical panel outer shield. 2. Inspect for unusual buzzing, heat, or ozone odors. 3. Ensure all toggle switches flip cleanly without excessive stiffness.",
        who: "Professional Recommended"
      },
      savings: {
        category: "Preventive Maintenance ROI",
        amount: 500,
        description: "Frequent logical panel checks prevent line service outages and mitigate high-resistance hot spots that trigger complete emergency panels overrides ($1,200)."
      }
    }
  };

  const selectedPreset = preset && presets[preset] ? preset : "hvac";
  const defaultFallback = presets[selectedPreset];

  const client = getAiClient();
  if (client && image) {
    try {
      // Clean up base64 string to remove data URI prefix if present
      let cleanBase64 = image;
      if (image.includes("base64,")) {
        cleanBase64 = image.split("base64,")[1];
      }

      const promptText = `
        You are HomePulse AI, an expert predictive home systems engineer and diagnostic analyzer.
        Identify and parse the appliance spec sticker, model serial plate, barcode, or warranty certificate shown in this image.
        Extract all relevant technical metadata to generate a new telemetered Home System Node, along with associated documents, consumables, tasks, and ROI savings benefits.

        Please respond with a raw, valid JSON object matching the exact schema below. Do NOT wrap in markdown blocks, backticks, or write explanations before/after the JSON.

        {
          "name": "Specific brand and model of appliance (e.g. Carrier Comfort 92 Gas Furnace, A.O. Smith Signature Series 40-Gal Water Heater)",
          "category": "Structure" | "Mechanical" | "Plumbing" | "Electrical" | "Safety" | "Exterior",
          "health": 40-100 score based on estimated unit age or state,
          "status": "Optimal" | "Good" | "Fair" | "Critical",
          "lastInspected": "Month Year of scan (e.g. July 2026)",
          "details": "Technical breakdown of manufacturer, serial/model number, electric/gas rating, age, and parsed data points.",
          "warningThreshold": health warning indicator percentage (typically 70-85),
          "reportingInterval": "Real-time Stream" | "Every 5 Minutes" | "Every 15 Minutes" | "Every 1 Hour" | "Every 24 Hours",
          "document": {
            "name": "Filename for vault upload (e.g. Furnace_Spec_Label.png, AO_Smith_Warranty.pdf)",
            "type": "warranty" | "receipt" | "photo" | "report"
          },
          "consumable": {
            "name": "Associated consumable part name (e.g. HVAC Air Filter, Water Heater Anode Rod, AAA Batteries) or null if none",
            "currentLevel": 100,
            "unit": "%",
            "lifespanDays": number,
            "cost": estimated part cost in dollars,
            "reorderLink": "https://www.google.com/search?q=part+name+reorder"
          } | null,
          "task": {
            "title": "Specific preventive DIY/Pro maintenance task name",
            "why": "Clear explanation of why this task is crucial",
            "how": "Three simple step-by-step instructions (e.g. '1. Step one. 2. Step two. 3. Step three.')",
            "who": "DIY" | "Professional Recommended"
          },
          "savings": {
            "category": "Energy Efficiency" | "Preventive Maintenance ROI",
            "amount": estimated yearly savings in dollars,
            "description": "How tracking this node avoids breakdown costs or cuts electricity usage"
          }
        }
      `;

      const imagePart = {
        inlineData: {
          mimeType: mimeType || "image/png",
          data: cleanBase64
        }
      };

      const textPart = {
        text: promptText
      };

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] }
      });

      const responseText = response.text || "";
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      // Make sure we have a fully valid structure
      const finalResult = {
        name: parsed.name || defaultFallback.name,
        category: parsed.category || defaultFallback.category,
        health: Number(parsed.health) || defaultFallback.health,
        status: parsed.status || defaultFallback.status,
        lastInspected: parsed.lastInspected || defaultFallback.lastInspected,
        details: parsed.details || defaultFallback.details,
        warningThreshold: Number(parsed.warningThreshold) || defaultFallback.warningThreshold,
        reportingInterval: parsed.reportingInterval || defaultFallback.reportingInterval,
        document: parsed.document || defaultFallback.document,
        consumable: parsed.consumable || defaultFallback.consumable,
        task: parsed.task || defaultFallback.task,
        savings: parsed.savings || defaultFallback.savings,
        source: "gemini-vision-ai"
      };

      return res.json(finalResult);
    } catch (error) {
      console.warn("Gemini vision analysis failed, falling back to simulated high-fidelity OCR.", error);
    }
  }

  // Simulated fallback response
  res.json({
    ...defaultFallback,
    source: "simulated-ocr-engine"
  });
});

// 6. API: AI Warranty Audit
app.post("/api/audit-warranty", async (req, res) => {
  const { applianceName, category, purchaseDate, durationYears, notes } = req.body;

  const client = getAiClient();
  if (client) {
    try {
      const prompt = `
        You are HomePulse AI, a legal and technical warranty audit analyst.
        Audit this equipment warranty:
        - Appliance: ${applianceName}
        - Category: ${category}
        - Purchase Date: ${purchaseDate}
        - Duration: ${durationYears} Years
        - Notes: ${notes || "None provided"}

        Analyze potential gaps, warranty expiration risks, and hidden maintenance clauses that might void coverage.
        Please respond in structured JSON with these exact fields:
        {
          "summary": "1-sentence audit summary",
          "coverageStatus": "Active" | "Expiring Soon" | "Expired" | "Limited Parts Only",
          "durationExplanation": "Clear description of coverage timeline and key dates",
          "hiddenClauses": [
            "Clause 1 (e.g. Must register within 60 days to get full parts coverage)",
            "Clause 2 (e.g. Failure to clear air filter/drain annually voids parts coverage)"
          ],
          "requiredMaintenance": [
            "Action 1 (e.g. Clean condenser coils every 12 months)",
            "Action 2 (e.g. Retain all service invoices for proof of professional care)"
          ],
          "verdict": "A concise, highly professional verdict and next recommended action."
        }
        Do not include markdown tags, just return valid JSON.
      `;

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const responseText = response.text || "";
      const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const audit = JSON.parse(cleanJson);
      return res.json(audit);
    } catch (error) {
      console.warn("Gemini Warranty Audit failed, falling back to rule-based engine.", error);
    }
  }

  // Fallback Rule-Based Audit
  const yearsPassed = 2026 - new Date(purchaseDate || "2024-01-01").getFullYear();
  const isActive = yearsPassed < durationYears;
  const status = isActive ? (durationYears - yearsPassed <= 1 ? "Expiring Soon" : "Active") : "Expired";

  res.json({
    summary: `Local rule-based audit completed for "${applianceName}".`,
    coverageStatus: status,
    durationExplanation: `This appliance is in its ${yearsPassed + 1}th year of a ${durationYears}-year warranty plan.`,
    hiddenClauses: [
      "Most manufacturers require proof of annual preventive maintenance to keep parts active.",
      "Requires registration within 60 days of installation, otherwise the warranty defaults to a basic 5-year duration."
    ],
    requiredMaintenance: [
      "Ensure all mechanical components are cleaned once a year.",
      "Log all receipts and maintenance logs securely in your Zero-Knowledge HomePulse Document Vault."
    ],
    verdict: isActive 
      ? `Your warranty is ${status.toLowerCase()}. Ensure you document the upcoming filter swaps to prevent claim rejections.`
      : "Your manufacturer warranty has expired. Consider a comprehensive home care protection plan or setting aside a repair fund."
  });
});


// Serve frontend with Vite middleware in development, and static files in production
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[HomePulse v3] Express + Vite backend server running on http://localhost:${PORT}`);
  });
}

initServer();
