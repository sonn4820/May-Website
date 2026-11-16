// English text of the content pages. Section types: { h, p, list, steps: [[title, text]], faq: [[q, a]] },
// { warn }, { note }, { more: "<page key>" }, { taglines: [[lang, text]] }. {ph:field} = placeholder, {info:field} = confirmed clinic info.
// Medical and legal text is a draft for the dentist and a lawyer to review before the site goes live.
DOCS.en = {
  "services/checkups": {
    lead: "Regular visits keep your teeth and gums healthy, and help us find small problems before they become painful or costly.",
    sections: [
      { h: "What a checkup includes", list: [
        "A look at your teeth, gums, tongue and the inside of your cheeks",
        "An oral cancer screening",
        "X-rays when you need them, at a low dose",
        "A check of your dentures, partials or bridges, if you wear them",
        "Time to ask about anything that bothers you"
      ] },
      { h: "Your cleaning", steps: [
        ["Gentle cleaning", "We remove plaque and tartar (hard buildup) that brushing at home cannot reach."],
        ["Polish", "We polish your teeth so they feel smooth and clean."],
        ["Tips for home", "We show you easy ways to brush and clean between your teeth, even with stiff or sore hands."]
      ] },
      { h: "How often should I come?", p: "Most people come every 6 months. If you have gum disease, dry mouth or many fillings, we may suggest coming more often. We will tell you what is right for you." },
      { faq: [
        ["Will the cleaning hurt?", "Most people feel little or no discomfort. Tell us if anything feels sore, and we will slow down or numb the area."],
        ["Do you take X-rays at every visit?", "No. We take X-rays only when they help us check your health, and we explain why first."]
      ] }
    ]
  },
  "services/fillings-crowns": {
    lead: "A filling repairs a cavity. A crown covers and protects a tooth that is weak, cracked or has a large filling.",
    sections: [
      { h: "Fillings", p: "We remove the decay and fill the space with a tooth-colored material. Most fillings take one visit. We numb the area first so you stay comfortable." },
      { h: "Crowns", p: "A crown is a cap that fits over the whole tooth. It makes a broken or weak tooth strong again and helps it look natural. A crown usually takes two visits: one to shape the tooth and fit a temporary crown, and one to place the final crown." },
      { h: "Signs you may need a filling or a crown", list: [
        "A tooth hurts when you eat something sweet, hot or cold",
        "A tooth feels rough, chipped or cracked",
        "Food gets stuck in the same spot again and again",
        "An old filling feels loose or has fallen out"
      ] },
      { h: "Caring for fillings and crowns", list: [
        "Brush twice a day with fluoride toothpaste",
        "Clean between your teeth once a day",
        "Do not chew ice or very hard foods",
        "Come for regular checkups so we can check the edges"
      ] },
      { faq: [
        ["How long does a crown last?", "With good care, many crowns last 10 years or more."],
        ["Will my insurance help pay?", "Many plans help pay for fillings and crowns. We check your benefits and explain the cost before we start."]
      ] }
    ]
  },
  "services/dentures": {
    lead: "Complete dentures replace all the teeth in the upper or lower jaw. Partial dentures fill the gaps when you still have some natural teeth.",
    sections: [
      { h: "What we offer", list: [
        "Complete dentures",
        "Partial dentures",
        "Repairs for cracked or broken dentures",
        "Relines, so loose dentures fit better",
        "Adjustments for sore spots"
      ] },
      { h: "Getting new dentures", steps: [
        ["Exam and planning", "We check your mouth and talk about the type of denture that fits your needs and budget."],
        ["Impressions", "We take molds of your mouth so the dentures match its shape."],
        ["Try-in", "You try a model of the dentures so we can check the fit, the bite and the look before they are finished."],
        ["Fitting and follow-up", "We fit your new dentures, then see you again to fix any sore spots."]
      ] },
      { h: "Getting used to new dentures", p: "New dentures often feel strange at first. Start with soft foods cut into small pieces, and chew on both sides at once. Speaking may feel different for a few days; reading out loud helps. If a spot is sore, call us. Please do not try to adjust the dentures yourself." },
      { h: "When to call us", list: [
        "Your dentures feel loose or click when you talk",
        "A sore spot does not heal within a few days",
        "Your denture is cracked, chipped or missing a tooth"
      ] },
      { more: "tips/denture-care" }
    ]
  },
  "services/implants": {
    lead: "A dental implant is a small post placed in the jawbone. It works like a tooth root and holds a crown, a bridge or a denture firmly in place.",
    sections: [
      { h: "Why people choose implants", list: [
        "They feel and work much like natural teeth",
        "They do not slip when you eat or talk",
        "They can hold a denture firmly so it does not move",
        "They help keep the jawbone healthy where a tooth is missing"
      ] },
      { h: "How it works", steps: [
        ["Exam and X-rays", "We check your gums and bone, and talk about your health and your medicines."],
        ["Placing the implant", "The implant is placed in the jaw. The area is numbed so you stay comfortable."],
        ["Healing", "The bone grows around the implant. This usually takes a few months."],
        ["Your new tooth", "A crown, bridge or denture is attached to the implant."]
      ] },
      { h: "Is an implant right for me?", p: "Many people can have implants at any age. Healthy gums and enough bone are what matter most. Smoking and some health conditions, such as diabetes that is not well controlled, can slow healing. We explain all your choices, including bridges and dentures, so you can decide what is best for you." },
      { faq: [
        ["Am I too old for implants?", "Age alone is usually not a problem. Your general health and your bone matter more."],
        ["Does insurance cover implants?", "Some plans pay for part of the cost. We check your benefits and explain the cost before you decide."]
      ] },
      { more: "tips/implants-guide" }
    ]
  },
  "services/gum-care": {
    lead: "Healthy gums hold your teeth in place. Gum disease is common in older adults, and it often does not hurt until it is advanced.",
    sections: [
      { h: "Warning signs", list: [
        "Gums that bleed when you brush or floss",
        "Red, swollen or tender gums",
        "Gums pulling back from the teeth",
        "Bad breath that does not go away",
        "Teeth that feel loose or are moving apart"
      ] },
      { h: "How we treat gum disease", steps: [
        ["Check", "We gently measure the space between your teeth and gums to see how healthy they are."],
        ["Deep cleaning", "We clean below the gum line to remove tartar and germs. This is called scaling and root planing."],
        ["Follow-up", "We check how your gums are healing and plan regular cleanings to keep them healthy."]
      ] },
      { h: "Why it matters", p: "Without treatment, gum disease can lead to tooth loss. It is also linked to other health problems, such as diabetes and heart disease. Treating it early is easier and more comfortable." },
      { h: "Help at home", list: [
        "Brush gently twice a day with a soft toothbrush",
        "Clean between your teeth with floss, a small brush or a water flosser",
        "An electric toothbrush or a brush with a thick handle helps if your hands are stiff",
        "Do not smoke"
      ] }
    ]
  },
  "services/emergency": {
    lead: "Tooth pain or a broken tooth? Call us. We will help you as soon as we can.",
    sections: [
      { warn: "Call 911 or go to the emergency room if you have swelling that makes it hard to breathe or swallow, a high fever with a swollen face, bleeding that will not stop, or an injury to your face or jaw." },
      { h: "Call us right away for", list: [
        "A bad toothache",
        "A broken, cracked or knocked-out tooth",
        "Swelling in your gums or face",
        "A lost filling or crown",
        "A broken denture"
      ] },
      { h: "What to do until you see us", list: [
        "Toothache: rinse with warm salt water. You can take a pain reliever you normally use, as the label says. Do not put aspirin on your gums.",
        "Knocked-out tooth: hold it by the top, not the root. Rinse it gently and try to put it back in place, or keep it in milk. Call us right away: time matters.",
        "Broken tooth: rinse your mouth and keep any pieces. Hold a cold pack on your cheek to help with swelling.",
        "Lost crown: keep it safe and bring it with you."
      ] },
      { h: "When the office is closed", p: "Call {info:CLINIC_PHONE}.{ph:AFTER_HOURS_EMERGENCY}" }
    ]
  },
  "about": {
    lead: "Meet your dentist at Excelcare Dental in Grayslake.",
    sections: [
      { h: "How we care for you", list: [
        "We listen first, and explain each step before we start",
        "We go at your pace. You can ask us to pause at any time",
        "We talk about costs before any treatment",
        "Free parking right in front, and a ramp at the door for wheelchairs and walkers"
      ] },
      { h: "Visit us", p: "{info:CLINIC_ADDRESS}" }
    ]
  },
  "tips/denture-care": {
    lead: "Five easy steps keep dentures clean, comfortable and lasting longer.",
    sections: [
      { h: "Your daily routine", steps: [
        ["Rinse after eating", "Take your dentures out and rinse them with water to remove food."],
        ["Brush them every day", "Use a soft denture brush and a denture cleaner. Regular toothpaste can scratch dentures."],
        ["Clean your mouth", "Brush your gums, your tongue and any natural teeth with a soft toothbrush."],
        ["Keep them moist overnight", "Most dentures need to stay moist. Soak them in water or a denture solution. Never use hot water: it can bend them."],
        ["Handle them with care", "Clean your dentures over a folded towel or a sink filled with water, so they do not break if you drop them."]
      ] },
      { h: "Give your gums a rest", p: "Take your dentures out at night, unless we tell you otherwise. This lets your gums rest and stay healthy." },
      { h: "Things to avoid", list: [
        "Bleach or whitening products",
        "Very hot or boiling water",
        "Bending or fixing dentures yourself",
        "Store-bought glue for repairs"
      ] },
      { h: "See us regularly", p: "Even with no natural teeth, regular visits matter. We check the fit of your dentures, look for sore spots and do an oral cancer screening. Your mouth changes over time, so dentures may need a reline to keep fitting well." }
    ]
  },
  "tips/dry-mouth": {
    lead: "Many medicines cause dry mouth. Here is how to protect your teeth.",
    sections: [
      { h: "Why it matters", p: "Saliva washes away food and helps protect your teeth. When your mouth is dry, cavities can form faster, dentures may feel uncomfortable, and it can be harder to talk, chew and swallow." },
      { h: "Common causes", list: [
        "Medicines, such as some for blood pressure, allergies, depression, pain and bladder control",
        "Health conditions, such as diabetes and Sjögren's syndrome",
        "Radiation treatment to the head or neck",
        "Not drinking enough water",
        "Breathing through your mouth at night"
      ] },
      { h: "What helps", list: [
        "Sip water often during the day",
        "Chew sugar-free gum or suck on sugar-free candy to help saliva flow",
        "Use a humidifier in your bedroom at night",
        "Choose a mouthwash without alcohol",
        "Limit coffee, alcohol and tobacco",
        "Use fluoride toothpaste, and ask us if extra fluoride is right for you"
      ] },
      { note: "Do not stop or change a medicine on your own. Ask your doctor or pharmacist if there is another choice that causes less dry mouth." },
      { h: "When to see us", p: "Tell us if your mouth feels dry most of the time, or if you notice new cavities, sore spots under your dentures or trouble swallowing. We can look for the cause and suggest products that help." }
    ]
  },
  "tips/implants-guide": {
    lead: "What to expect, how long it takes, and questions to ask at your visit.",
    sections: [
      { h: "What is a dental implant?", p: "An implant is a small post, usually made of titanium, that replaces the root of a missing tooth. Once it has healed in the jawbone, it can hold a single crown, a bridge or a full denture." },
      { h: "Who can get implants?", p: "Many adults can, including older adults. What matters most is healthy gums, enough bone to hold the implant, and general health that allows healing. Smoking and diabetes that is not well controlled can slow healing. If there is not enough bone, a bone graft may help." },
      { h: "How long does it take?", steps: [
        ["Planning", "An exam, X-rays and a talk about your health and medicines."],
        ["Placement", "The implant is placed in a short procedure, with numbing medicine."],
        ["Healing", "Usually a few months. The bone grows around the implant and holds it firmly."],
        ["The final tooth", "Your crown, bridge or denture is attached."]
      ] },
      { h: "Questions to ask at your visit", list: [
        "Am I a good candidate for an implant?",
        "Will I need a bone graft or other treatment first?",
        "How many visits will it take, and over how long?",
        "What will it cost, and will my insurance help?",
        "What are my other choices, such as a bridge or a denture?",
        "How do I care for an implant at home?"
      ] },
      { h: "Caring for an implant", p: "Brush and clean between your teeth every day, just as you would natural teeth, and come for regular checkups. Implants cannot get cavities, but the gums around them can become infected." }
    ]
  },
  "privacy": {
    lead: "How this website collects and uses your information.",
    sections: [
      { h: "What we collect", list: [
        "What you enter when booking, such as your name, date of birth, phone number, email and reason for your visit",
        "The appointment time you choose when you book online",
        "Basic technical information every website receives, such as your browser type and IP address"
      ] },
      { h: "How we use it", list: [
        "To book and confirm your appointment",
        "To prepare for your visit",
        "To contact you about your care",
        "To keep this website working and secure"
      ] },
      { h: "Your health information", p: "Information about your health and care is protected by HIPAA. Our Notice of Privacy Practices explains how we use and share it, and your rights." },
      { more: "privacy-practices" },
      { h: "Who we share it with", p: "We do not sell your information. We share it only with companies that help us run our office, such as our dental records system and our secure email and document service, under agreements that require them to protect it, or when the law requires it." },
      { h: "Cookies and settings", p: "We do not use cookies for advertising. Your choices on this website, such as language, text size and accessibility settings, are saved only in your own browser. The map in Hours and location comes from Google Maps, and Google may set its own cookies when it loads (see Google's privacy policy)." },
      { h: "Security", p: "Forms are sent over a secure, encrypted connection. Only our office team can see what you send." },
      { h: "Children", p: "This website is not meant for children under 13. A parent or guardian should fill out forms for a child." },
      { h: "Questions", p: "Call us at {info:CLINIC_PHONE} or email {info:CLINIC_EMAIL}." },
      { h: "Changes to this policy", p: "If we change this policy, we will post the new version on this page with a new effective date." }
    ]
  },
  "privacy-practices": {
    lead: "This notice describes how medical information about you may be used and disclosed and how you can get access to this information. Please review it carefully.",
    sections: [
      { h: "Your rights", p: "When it comes to your health information, you have the right to:", list: [
        "Get a copy of your paper or electronic dental record",
        "Ask us to correct your record if you think it is wrong or incomplete",
        "Ask us to contact you in a certain way, for example by cell phone or at a different address",
        "Ask us to limit what we use or share. If you pay for a service in full yourself, you can ask us not to share that information with your health insurer",
        "Get a list of those with whom we have shared your information",
        "Get a paper copy of this notice at any time",
        "Choose someone to act for you, such as a legal guardian",
        "File a complaint if you feel your rights have been violated"
      ] },
      { h: "Your choices", p: ["You can tell us whether to share information with family and friends involved in your care, or in a disaster relief situation. If you cannot tell us, for example because you are unconscious, we may share it if we believe it is in your best interest.", "We never use or share your information for marketing, and never sell it, unless you give us written permission."] },
      { h: "How we use and share your information", list: [
        "To treat you, for example by sharing with a specialist who also treats you",
        "To run our office, for example to improve your care and contact you when needed",
        "To bill for your care and get payment from your insurance",
        "For public health and safety, such as preventing disease or reporting suspected abuse",
        "When the law requires it, including to respond to lawsuits, legal actions and law enforcement",
        "For workers' compensation, health oversight agencies and other government requests"
      ] },
      { h: "Appointment reminders", p: "We may contact you by phone, text message or email to remind you of appointments or to share information about your care." },
      { h: "Our responsibilities", list: [
        "We are required by law to keep your health information private and secure",
        "We will tell you promptly if a breach happens that may have put your information at risk",
        "We must follow the duties and privacy practices in this notice and give you a copy",
        "We will not use or share your information in other ways unless you tell us in writing that we can. You may change your mind at any time by letting us know in writing"
      ] },
      { h: "Changes to this notice", p: "We can change the terms of this notice, and the changes will apply to all the information we have about you. The new notice will be available on request, in our office and on this website." },
      { h: "Questions and complaints", p: ["Contact our Privacy Officer{ph:PRIVACY_CONTACT} at {info:CLINIC_PHONE} or {info:CLINIC_EMAIL}.", "You can also file a complaint with the U.S. Department of Health and Human Services Office for Civil Rights by sending a letter to 200 Independence Avenue, S.W., Washington, D.C. 20201, calling 1-877-696-6775, or visiting www.hhs.gov/ocr/privacy/hipaa/complaints/.", "We will not take action against you for filing a complaint."] }
    ]
  },
  "accessibility": {
    lead: "We want everyone to be able to use our website and visit our office.",
    sections: [
      { h: "Our website", p: "We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.1, level AA. This website has:", list: [
        "Large, easy-to-read text and strong color contrast",
        "Text size buttons (A, A+, A++) at the top of every page",
        "An accessibility menu (the round button at the bottom left) to raise contrast, highlight links, add spacing, pause animations and more",
        "Full use with a keyboard and with screen readers",
        "Pages in English, Tiếng Việt and Español"
      ] },
      { h: "Our office", list: [
        "Free parking right in front of the office",
        "A ramp at the entrance for wheelchairs and walkers",
        "Tell us when you book if you need extra time or help, and we will plan for it"
      ] },
      { h: "Need help or found a problem?", p: "If any part of this website is hard to use, please call us at {info:CLINIC_PHONE} or email {info:CLINIC_EMAIL}. We will help you by phone and work to fix the problem." }
    ]
  },
  "nondiscrimination": {
    lead: "Excelcare Dental complies with applicable federal civil rights laws and does not discriminate on the basis of race, color, national origin, age, disability or sex.",
    sections: [
      { p: "Excelcare Dental does not exclude people or treat them differently because of race, color, national origin, age, disability or sex." },
      { h: "Free help we provide", list: [
        "Free aids and services to people with disabilities, such as qualified sign language interpreters and written information in other formats (large print, accessible electronic formats)",
        "Free language services to people whose main language is not English, such as qualified interpreters and information written in other languages"
      ], p: "If you need these services, call {info:CLINIC_PHONE}." },
      { h: "If you believe we have not provided these services or have discriminated", p: "You can file a grievance with our Civil Rights Coordinator{ph:PRIVACY_CONTACT} in person, by mail, by phone at {info:CLINIC_PHONE} or by email at {info:CLINIC_EMAIL}. If you need help filing a grievance, our coordinator can help you." },
      { h: "Complaints to the U.S. government", p: "You can also file a civil rights complaint with the U.S. Department of Health and Human Services, Office for Civil Rights, online at ocrportal.hhs.gov/ocr/portal/lobby.jsf, by mail at 200 Independence Avenue SW, Room 509F, HHH Building, Washington, DC 20201, or by phone at 1-800-368-1019 (TDD: 1-800-537-7697)." },
      { h: "Language help", taglines: [
        ["es", "ATENCIÓN: si habla español, tiene a su disposición servicios gratuitos de asistencia lingüística. Llame al {info:CLINIC_PHONE}."],
        ["vi", "CHÚ Ý: Nếu bạn nói Tiếng Việt, có các dịch vụ hỗ trợ ngôn ngữ miễn phí dành cho bạn. Gọi số {info:CLINIC_PHONE}."]
      ] }
    ]
  }
};
