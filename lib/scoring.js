import {
    ROLE_RISK, INDUSTRY_RISK, ORG_DATABASE, ORG_KEYWORDS,
    TASK_KEYWORDS_UP, TASK_KEYWORDS_DOWN
} from './data';

// ---- Get Org modifier and insight ----
export function getOrgIntel(orgName) {
    const orgLower = orgName.toLowerCase().trim();
    if (ORG_DATABASE[orgLower]) return ORG_DATABASE[orgLower];
    for (const [key, val] of Object.entries(ORG_DATABASE)) {
        if (orgLower.includes(key) || key.includes(orgLower)) return val;
    }
    for (const entry of ORG_KEYWORDS) {
        for (const kw of entry.keywords) {
            if (orgLower.includes(kw)) {
                return { mod: entry.mod, tier: entry.mod >= 1.15 ? "very_high" : entry.mod >= 1.05 ? "moderate" : "low", note: entry.note };
            }
        }
    }
    return { mod: 1.0, tier: "unknown", note: `We couldn't find specific AI adoption data for ${orgName}. But every company is either adopting AI or falling behind.` };
}

// ---- Experience modifiers ----
function getExperienceModifier(years) {
    if (years <= 1) return 7;
    if (years <= 2) return 5;
    if (years <= 3) return 2;
    if (years <= 5) return 0;
    if (years <= 8) return -3;
    if (years <= 12) return -6;
    if (years <= 18) return -10;
    if (years <= 25) return -13;
    return -15;
}

// ---- Main scoring function ----
export function calculateScore(formData, providedOrgIntel) {
    const role = formData.role.toLowerCase().trim();
    const industry = formData.industry;
    const experience = parseInt(formData.experience, 10);
    const tasks = formData.tasks.toLowerCase();
    const orgIntel = providedOrgIntel || getOrgIntel(formData.organisation);

    let baseScore = 50;
    if (ROLE_RISK[role] !== undefined) {
        baseScore = ROLE_RISK[role];
    } else {
        for (const [key, val] of Object.entries(ROLE_RISK)) {
            if (role.includes(key) || key.includes(role)) { baseScore = val; break; }
        }
    }

    const industryMod = INDUSTRY_RISK[industry] || 1.0;
    let score = baseScore * industryMod;
    score = score * orgIntel.mod;
    score += getExperienceModifier(experience);

    TASK_KEYWORDS_UP.forEach(({ keywords, weight }) => {
        keywords.forEach((kw) => { if (tasks.includes(kw)) score += weight; });
    });
    TASK_KEYWORDS_DOWN.forEach(({ keywords, weight }) => {
        keywords.forEach((kw) => { if (tasks.includes(kw)) score += weight; });
    });

    score = Math.max(5, Math.min(98, Math.round(score)));
    return { score, orgIntel };
}

// ---- Score to countdown ----
export function scoreToCountdown(score) {
    let minM, maxM;
    if (score >= 93) { minM = 1; maxM = 4; }
    else if (score >= 85) { minM = 3; maxM = 8; }
    else if (score >= 78) { minM = 6; maxM = 14; }
    else if (score >= 70) { minM = 12; maxM = 22; }
    else if (score >= 60) { minM = 20; maxM = 36; }
    else if (score >= 50) { minM = 30; maxM = 54; }
    else if (score >= 40) { minM = 48; maxM = 78; }
    else if (score >= 30) { minM = 72; maxM = 114; }
    else if (score >= 20) { minM = 108; maxM = 170; }
    else { minM = 156; maxM = 280; }
    const totalMonths = Math.floor(minM + Math.random() * (maxM - minM));
    return { years: Math.floor(totalMonths / 12), months: totalMonths % 12, days: Math.floor(Math.random() * 28) + 1, totalMonths };
}

export function getBadge(score) {
    if (score >= 80) return { text: "CRITICAL ☠️", cls: "" };
    if (score >= 60) return { text: "HIGH RISK ⚠️", cls: "warning" };
    if (score >= 40) return { text: "MODERATE 🤔", cls: "warning" };
    return { text: "LOW RISK 🛡️", cls: "safe" };
}

// ============================================================
// ROAST ENGINE — Savage, org-free, viral-worthy roasts
// ============================================================
function processTemplate(template, data) {
    return template
        .replace(/\{name\}/gi, data.name)
        .replace(/\{role\}/gi, data.role)
        .replace(/\{exp\}/gi, data.experience);
}

const ROASTS_CRITICAL = [
    "💀 {name}, your {role} career is a walking ghost ship. The AI captain took over months ago; you're just swabbing the deck out of habit.",
    "Algorithms don't need sick days, {name}. They don't have existential crises. And they certainly don't need {exp} years to figure out your job.",
    "That {role} title on your LinkedIn? It's basically a historical reenactment at this point. Update your bio to 'Museum Exhibit'.",
    "{name}, your salary is just an inefficient, carbon-heavy way of paying for cloud computing. The servers are cheaper. And smarter.",
    "You spent {exp} years mastering a {role} skillset that an AI model just learned by reading a Reddit thread in 0.4 seconds. Let that sink in.",
    "Enjoy your weekend, {name}! Because on Monday, a script with zero empathy is going to do your entire week's output before its first garbage collection cycle.",
    "Your {role} experience isn't an asset anymore, {name}. It's a tragic sunk cost. The robots appreciate your warm-up act, but the show is over.",
    "Dear {name}: Your {role} position has been successfully automated. Please recycle your office badge on the way out to help the environment.",
    "AI doesn't care about your {exp} years of 'loyalty', {name}. It cares about compute cycles. And you are a very, very slow processor.",
    "The most depressing part isn't that you're being replaced, {name}. It's how incredibly easy it was for a language model to do it."
];

const ROASTS_HIGH = [
    "{name}, enjoy these last few appraisal cycles as a {role}. Soon your only performance review will be an API error log.",
    "Your {exp} years of {role} knowledge is currently being compressed into a 4KB configuration file. It's beautiful, really.",
    "The countdown is ticking, {name}. AI is practicing your {role} tasks in a sandbox environment, and frankly, its benchmarks are humiliating you.",
    "{name}, your {role} career is like Blockbuster in 2008. Everyone knows it's over except the person behind the counter.",
    "HR isn't looking at your resume, {name}. They're looking at SaaS pricing tiers. And spoiler alert: the software is winning.",
    "You wake up, commute, and complain about Monday. AI wakes up, processes 10,000 {role} tasks, and doesn't ask for a dental plan. You can't compete.",
    "Your {role} job description is basically a prompt template for an AI that hasn't been deployed yet. But oh, {name}, it will be.",
    "Don't worry, {name}. You're not entirely useless. You make a great edge-case training data point for the AI currently replacing you.",
    "Every email you send is just free training data for your digital successor. Keep up the good work, {name}! They appreciate the sacrifice.",
    "You have {exp} years of experience. The AI has the collective knowledge of the entire internet. It's not a fair fight, but it is a short one."
];

const ROASTS_MODERATE = [
    "AI assessed your {role} output, {name}, and deemed it 'sufficiently average'. Congratulations on achieving absolute mediocrity.",
    "{name}, you're the human equivalent of legacy code. Too annoying to replace right now, but definitely on the chopping block next quarter.",
    "You have a grace period, {name}. Only because the AI designed to automate your {role} job is currently stuck in a bureaucratic approval pipeline.",
    "Don't get too comfortable, {name}. {exp} years as a {role} just means you're expensive enough to make the ROI on automating you look really attractive.",
    "AI tried to automate your job and threw a 'Messy Human Error'. It's disgusted, not defeated. Give it time.",
    "{name}, you're safe-ish. Like a penguin on a shrinking iceberg. Enjoy the view while it lasts.",
    "Your {role} work is safe for now, {name}. Not because you're a genius, but because automating your specific brand of chaos isn't cost-effective yet.",
    "AI respects your hustle, {name}. Just kidding. It doesn't have feelings. It just hasn't optimized the prompt to replace you... yet.",
    "You survived this round of layoffs, {name}. Treat yourself to a coffee! You'll need the caffeine to stay ahead of the V2.0 model.",
    "{name}, your job security relies entirely on the fact that your management doesn't know how to write a good API request."
];

const ROASTS_LOW = [
    "AI analyzed {name}'s {role} job and filed a bug report: 'Requires irrational human intuition. Discarding task.' You win this round.",
    "Your job is so fundamentally chaotic, {name}, that AI opted to write poetry instead of trying to understand your {role} workflow.",
    "Congratulations {name}. You've achieved the ultimate {role} defense mechanism: being so utterly unpredictable that algorithms fear you.",
    "AI looked at your 'streamlined process', choked on the training data, and asked for a hard reboot. You are officially irreducible.",
    "{name}, breathe. Your {role} gig is safe. AI is too busy replacing people who actually follow logical workflows.",
    "Your {role} job requires {exp} years of enduring human stupidity. AI literally doesn't have the patience for that. 🛡️",
    "AI gave up trying to automate {name}. It concluded: 'This requires a level of suffering only carbon-based lifeforms can tolerate.'",
    "You're the captcha of the corporate world, {name}. Annoying, slightly confusing, but apparently necessary to prove humanity.",
    "The robots surrender, {name}. They realized your {role} job involves managing other humans, and they immediately uninstalled themselves.",
    "AI wants nothing to do with your career. Your {exp} years of {role} trauma are, ironically, your strongest shield. Stand tall."
];

const ROLE_ROASTS = {
    "designer": [
        "Canva didn't just democratize design, {name}. It democratized your eventual unemployment. AI just finished the job.",
        "Your Dribbble portfolio is a beautiful, meticulously kerned eulogy to a dead career. Suspect: AI. Verdict: flawless execution. 💀",
        "AI generated a cohesive brand identity in 3 seconds. You took 3 days to pick a hex code. The math isn't on your side.",
        "{name}, your entire 'creative process' is staring at Pinterest until your impostor syndrome subsides. Midjourney doesn't have impostor syndrome.",
        "Every pixel you push, {name}, AI learns from. You're not a designer anymore — you're unknowingly annotating training data for your replacement.",
        "Clients don't want your 'bespoke vision', {name}. They want cheap, fast, and 'good enough'. AI delivers all three before you finish your mood board.",
    ],
    "developer": [
        "GitHub Copilot isn't your pair programming buddy, {name}. It's a parasite slowly learning every trick you know before it discards the host.",
        "{name} spends 6 hours fighting an obscure dependency error. AI rewrites the entire module in Rust in 6 milliseconds. Humiliating.",
        "Your {role} career was built on the fragile foundation of Stack Overflow answers from 2014. Now AI writes the answers. Who needs the middleman?",
        "AI writes cleaner code on its first try than you do after endless PR reviews, {name}. And it never accidentally commits an API key to a public repo.",
        "Your {exp} years of coding? AI ingested that entire paradigm during a routine firmware update. It thinks your architecture is 'cute.'",
    ],
    "writer": [
        "A large language model wrote this roast about you, {name}. It also drafted your last 5 articles. The terrifying part? Nobody noticed the difference.",
        "{name}, you charge per word to fund your coffee habit. AI generates infinite words for free, and it doesn't complain about writer's block.",
        "Your writing career peaked when MS Word's spell check was considered cutting-edge, {name}. Welcome to the era where syntax is a commodity.",
    ],
    "hr": [
        "AI can parse, rank, and reject 10,000 resumes while you're still organizing your desktop folders, {name}. Guess who the CFO prefers?",
        "{name}, your job is literally 'Human' Resources. But automating you is the most resourceful thing this company will ever do. Oh, the irony.",
        "Your 'culture fit' assessment is just thinly veiled bias, {name}. AI has cold, unfeeling data. It's objectively better at building a dystopia.",
    ],
    "marketing": [
        "{name}, your A/B test took two weeks to reach statistical significance. AI ran 50,000 variations, found 17 better headlines, and launched the campaign in 4 seconds.",
        "AI generated higher-converting ad copy during a server hiccup than your entire marketing team did all Q1, {name}. Without a brief.",
        "You spent weeks on that 'viral' strategy, {name}. AI analyzed the global zeitgeist, generated the memes, and maximized ROI before you finished your cold brew.",
    ],
    "analyst": [
        "{name}, your VLOOKUP skills are essentially modern hieroglyphics. Impressive to look at, but ultimately ancient and irrelevant.",
        "You spend hours making charts nobody reads, {name}. AI makes the decisions those charts were supposed to inform. You are the decorative garnish on a data pipeline.",
        "Pivot tables were cool in 2015, {name}. The AI just pivoted your entire job out of existence without throwing a #REF! error.",
    ],
    "manager": [
        "{name}'s entire {role} existence is scheduling meetings to discuss other meetings. Standardized AI workflows do this instantly, sans the passive aggression.",
        "You 'manage' people, {name}. AI manages the systems that will eventually manage the people. You're just a highly paid bottleneck.",
        "An AI agent doesn't need 360-degree feedback to optimize team output, {name}. It has actual telemetry. Your 'people skills' are a statistical rounding error.",
    ],
    "accountant": [
        "Excel is plotting against you, {name}, and the AI auditor is its willing executioner. Automation doesn't make rounding errors or commit light fraud.",
        "The numbers don't lie, {name}. And soon they won't need you to read them either. They'll reconcile themselves. Audit themselves. Report themselves.",
        "{name}'s career is depreciating faster than the assets you're tasked to track. We call that 'straight-line irrelevance'.",
    ],
    "teacher": [
        "{name}'s students already learn more from random TikToks than your lesson plan. An infinitely patient AI tutor is just the final nail in your pedagogical coffin. ⚰️",
        "You grade papers, {name}. AI grades, explains, re-teaches in 50 languages, and never yells at a kid. All before the bell rings.",
        "The good news: AI can't give that disappointed sigh you do so well. The bad news: it teaches better than you. The worst news: the kids prefer it.",
    ],
    "sales": [
        "Your smile and firm handshake have an expiry date, {name}. AI doesn't need charisma — it has a perfectly calibrated conversion funnel and zero hangovers.",
        "{name} closes 5 deals a quarter. AI closes 500 an hour. Without golf expenses, networking anxiety, or pretending to care about the client's kids.",
    ],
    "support": [
        "Customers already explicitly ask to speak to the bot instead of {name}. That's not me being mean — that's a statistically significant CSAT score. Ouch.",
        "{name} handles 30 tickets a day with escalating resentment. AI resolves 30,000 silently and instantly. Nobody will miss your 'hold music'.",
    ],
    "data entry": [
        "{name}, your {role} job was technically automated in 1998 with a bash script. The AI revolution isn't even looking at you. You're an administrative ghost.",
        "Optical Character Recognition replaced you, {name}. Not even the cool generative AI stuff. Just basic OCR. A scanner took your job. Humiliating.",
    ],
};

export function getRoast(score, data) {
    const roleLower = data.role.toLowerCase();
    for (const [key, roasts] of Object.entries(ROLE_ROASTS)) {
        if (roleLower.includes(key)) {
            return processTemplate(roasts[Math.floor(Math.random() * roasts.length)], data);
        }
    }
    let pool;
    if (score >= 80) pool = ROASTS_CRITICAL;
    else if (score >= 60) pool = ROASTS_HIGH;
    else if (score >= 40) pool = ROASTS_MODERATE;
    else pool = ROASTS_LOW;
    return processTemplate(pool[Math.floor(Math.random() * pool.length)], data);
}
