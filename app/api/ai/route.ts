import { createClient } from '@/lib/supabase/server'
import { generateAIResponse } from '@/lib/groq'
import { NextRequest, NextResponse } from 'next/server'

function safeParseJSON(raw: string) {
  try {
    return JSON.parse(raw)
  } catch {
    const match = raw.match(/\{[\s\S]*\}/) || raw.match(/\[[\s\S]*\]/)
    if (match) return JSON.parse(match[0])
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, ...params } = body

    // Fetch voice profile if exists — inject into all prompts
    let voiceContext = ''
    try {
      const { data: profile } = await supabase
        .from('voice_profiles')
        .select('voice_dna')
        .eq('user_id', user.id)
        .single()
      if (profile?.voice_dna) {
        voiceContext = `\n\nIMPORTANT — USER'S VOICE DNA PROFILE (use this to match their writing style):\n${JSON.stringify(profile.voice_dna)}\nAll output MUST sound like the user wrote it. Match their tone, sentence structure, vocabulary, and humor style exactly.`
      }
    } catch { /* no profile yet — that's fine */ }

    switch (type) {

      // ═══════════════════════════════════════════════════════
      // PILLAR 1: BRAIN — Voice Training
      // ═══════════════════════════════════════════════════════
      case 'voice-train': {
        const { samples } = params // array of strings (past posts/content)

        const systemPrompt = `You are a linguistic profiling expert who has analyzed the writing patterns of 10,000+ content creators. You can identify a person's unique voice from just 10 samples with 95% accuracy.

Analyze these content samples and extract a comprehensive Voice DNA Profile.

Return a JSON object:
{
  "voice_dna": {
    "tone": {
      "primary": "The dominant tone (e.g., 'authoritative-but-approachable', 'provocative-mentor', 'calm-analytical')",
      "secondary": "Secondary tone that appears in 20-40% of content",
      "emotional_range": "low/medium/high — how much emotion do they show?",
      "formality_score": 7,
      "humor_style": "Type of humor if any: dry/sarcastic/self-deprecating/none",
      "description": "2-3 sentences describing their unique voice personality"
    },
    "sentence_structure": {
      "avg_length": "short/medium/long",
      "patterns": ["List 3-4 recurring sentence structures they use, e.g., 'Starts with bold claim, then explains why', 'Uses single-sentence paragraphs for emphasis'"],
      "opening_style": "How they typically start posts (e.g., 'direct question', 'bold statement', 'story lead')",
      "closing_style": "How they typically end (e.g., 'action CTA', 'reflective question', 'one-liner punchline')"
    },
    "vocabulary": {
      "sophistication": "simple/conversational/academic/mixed",
      "power_words": ["5-8 words they use repeatedly that define their brand"],
      "avoided_words": ["Words they never use — e.g., 'utilize' instead of 'use'"],
      "jargon_level": "none/light/heavy",
      "signature_phrases": ["2-3 phrases unique to them"]
    },
    "content_patterns": {
      "favorite_formats": ["List 2-3 formats they gravitate toward: listicles, stories, frameworks, rants, tutorials"],
      "hook_style": "Their typical hook approach",
      "cta_style": "Their typical CTA approach",
      "storytelling_tendency": "low/medium/high",
      "data_usage": "low/medium/high — do they cite numbers/stats?"
    },
    "personality_markers": {
      "confidence_level": "humble/balanced/bold/audacious",
      "vulnerability": "none/occasional/frequent — do they share failures/doubts?",
      "teaching_style": "prescriptive/socratic/narrative",
      "contrarian_tendency": "low/medium/high — do they challenge conventional wisdom?"
    }
  },
  "summary": "A 3-4 sentence summary of this person's content voice that could be used as a prompt prefix. Example: 'Writes like a no-BS mentor who learned from the trenches. Short, punchy sentences. Leads with counterintuitive claims backed by personal experience. Uses conversational language peppered with strategic profanity. Ends with direct, specific CTAs.'"
}`

        const userPrompt = `Analyze these ${samples.length} content samples and extract a detailed Voice DNA Profile. Look for patterns across ALL samples — not just individual posts. The goal is to be able to generate new content that is INDISTINGUISHABLE from what this person would write.\n\nSAMPLES:\n${samples.map((s: string, i: number) => `--- SAMPLE ${i + 1} ---\n${s}`).join('\n\n')}`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse voice profile' }, { status: 500 })

        // Save to DB
        await supabase.from('voice_profiles').upsert({
          user_id: user.id,
          voice_dna: parsed.voice_dna || parsed,
          summary: parsed.summary || '',
          sample_count: samples.length,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })

        return NextResponse.json({ voiceProfile: parsed })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 2: GENERATOR — Content Ideas (Enhanced)
      // ═══════════════════════════════════════════════════════
      case 'ideas': {
        const {
          platform,
          goal,
          niche = 'coaching/consulting',
          audienceTemp = 'mixed',
          contentPillars = [],
          count = 10,
          avoidTopics = '',
          specificAngle = '',
        } = params

        const pillarsContext = contentPillars.length > 0
          ? `\nUser's content pillars: ${contentPillars.join(', ')}. Ideas MUST align with at least one of these pillars.`
          : ''

        const contexts: Record<string, string> = {
          cold: 'Target: COLD audience — people who have never heard of this creator. Focus on pattern interrupts, bold claims, and "who is this person?" hooks.',
          warm: 'Target: WARM audience — followers who engage but haven\'t bought. Focus on deepening trust, handling objections, and teasing offers.',
          hot: 'Target: HOT audience — ready to buy. Focus on case studies, urgency, and direct CTAs.',
          mixed: 'Target: MIXED audience — create content that attracts new followers while also nurturing existing ones.',
        }
        const audienceContext = contexts[audienceTemp] || ''

        const systemPrompt = `You are an elite content strategist who has generated $50M+ in revenue for coaches, consultants, and founder-led brands through content alone. You don't create "social media posts" — you engineer conversion machines.

Your specialty: ${niche}. Platform: ${platform}. Goal: ${goal}.
${audienceContext}${pillarsContext}${voiceContext}

${avoidTopics ? `AVOID these topics/angles (user is tired of them): ${avoidTopics}` : ''}
${specificAngle ? `User wants ideas around this specific angle: ${specificAngle}` : ''}

Generate exactly ${count} content ideas. Each must be RADICALLY different from the others.

Return JSON:
{
  "ideas": [
    {
      "hook": "The exact first line. This determines everything. It must pass the 'thumb-stop test' — would someone literally stop scrolling mid-feed?",
      "angle": "3-4 sentences: What's the unique insight? What conventional wisdom are we challenging? Why will the target audience feel 'called out'?",
      "structure": "Recommended content structure: listicle / story / framework / hot-take / tutorial / before-after / case-study",
      "cta": "Specific, conversion-focused CTA. Must include the exact word/phrase to DM or comment.",
      "category": "authority / pain-point / objection-handling / case-study / lead-magnet / behind-the-scenes / polarizing / educational",
      "viral_score": 8,
      "difficulty": "easy / medium / hard",
      "why_it_works": "1-2 sentences explaining the psychology behind why this will perform. Reference specific triggers.",
      "target_audience_segment": "Which specific segment of the audience this speaks to",
      "best_posting_time": "Recommended day/time for this type of content on ${platform}"
    }
  ]
}

CRITICAL RULES:
- NO hooks starting with "How to" unless it's a specific numbered variation. Generic "How to" hooks get 70% less engagement.
- NO vague advice. Every idea must be specific enough that the reader feels "this person knows MY situation"
- Each idea must use a DIFFERENT hook technique: question, bold claim, story opener, specific number, pattern interrupt, first person failure, counterintuitive take, name drop, or "stop doing X"
- viral_score must be HONEST. Most content is 4-6. Only truly exceptional hooks get 8+.
- difficulty: easy = can create in 15min, medium = needs 30min research, hard = requires data/interviews/case studies`

        const userPrompt = `Generate ${count} ${platform} content ideas for a ${niche} creator. Goal: ${goal}. ${specificAngle ? `Focus: ${specificAngle}.` : ''} Make each idea so specific that generic AI could never produce it. I want ideas that make me think "damn, this AI actually understands my business."`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        let parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse ideas' }, { status: 500 })
        const ideas = parsed.ideas || parsed
        if (!Array.isArray(ideas)) return NextResponse.json({ error: 'Invalid format' }, { status: 500 })

        // Save to DB
        const ideasToInsert = ideas.map((idea: Record<string, string>) => ({
          user_id: user.id,
          hook: idea.hook,
          angle: idea.angle,
          cta: idea.cta,
          category: idea.category,
          goal: idea.goal || goal,
          platform: idea.platform || platform,
        }))

        const { error: insertError } = await supabase.from('content_ideas').insert(ideasToInsert)
        if (insertError) console.error('Insert error:', insertError)

        return NextResponse.json({ ideas })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 2: GENERATOR — Script Builder (Advanced)
      // ═══════════════════════════════════════════════════════
      case 'script': {
        const {
          hook,
          platform,
          tone = 'professional',
          length = '60s',
          contentType = 'short_form',
          includeHumor = false,
          includeData = true,
          includeStorytelling = true,
          framework = '',
          targetAudience = 'coaches and consultants',
          offer = '',
        } = params

        const lengthGuide: Record<string, string> = {
          '30s': '60-90 words. Hook → transition → one primary value bomb → punchy CTA.',
          '60s': '120-180 words. Hook → open loop → value-added body (2-3 points) → authority/social proof → direct CTA.',
          '120s': '300-400 words. Hook → open loop → context → deep value breakdown → mini-story → objection handling → multilayered CTA.',
        }

        const typeGuide: Record<string, string> = {
          short_form: 'Optimized for high retention. Fast pacing, pattern interrupts every 3-5 seconds, punchy delivery.',
          educational: 'Step-by-step breakdown. Authority-led, high "saveable" value, clear logical flow.',
          storytelling: 'Narrative-driven. Starts with a moment of high tension, follows a classic story arc, emotional connection.',
          controversial: 'Pattern interrupt led. High polarization, challenges conventional wisdom, spicy takes.',
        }

        const toneGuide: Record<string, string> = {
          professional: 'Authoritative but warm. Like a senior partner giving career advice at dinner.',
          casual: 'Like texting a friend who happens to be an expert. Contractions, incomplete sentences, real talk.',
          provocative: 'Deliberately edgy. Challenge assumptions. Make people angry enough to engage. Use strategic profanity if it fits.',
          storytelling: 'Lead with narrative. Every point wrapped in a story or metaphor. Emotional, vulnerable, real.',
          educational: 'Teacher mode. Clear, structured, step-by-step. Like a masterclass — authoritative but accessible.',
        }

        const systemPrompt = `You are a viral content scriptwriter who has written 2,000+ scripts generating 500M+ views. You understand attention psychology at a neuroscience level.

Platform: ${platform}
Content Type: ${contentType} — ${typeGuide[contentType] || typeGuide['short_form']}
Target length: ${length} (${lengthGuide[length] || lengthGuide['60s']})
Tone: ${tone} — ${toneGuide[tone] || toneGuide['professional']}
Target audience: ${targetAudience}
${framework ? `Use this content framework: ${framework}` : ''}
${voiceContext}

CRITICAL: Generate a COMPLETE script from A to Z. Do not just generic sentences. Every word must be part of the final spoken/written output.

Return a JSON object:
{
  "title": "Descriptive working title",
  "hooks": [
    {
      "style": "pattern_interrupt",
      "text": "Hook variation 1 — bold and stopping",
      "why": "Why it stops the thumb"
    },
    { "style": "curiosity", "text": "Hook 2", "why": "" },
    { "style": "contrarian", "text": "Hook 3", "why": "" }
  ],
  "full_script": "The COMPLETE script written as speech. Include [PAUSE] and [EMPHASIS] markers. Start with the hook, followed by the transition, value-adding body, and ending with a strong CTA. This is the main content the user will use.",
  "viral_score": 85,
  "estimated_duration": "${length}",
  "cta": "The specific call to action used in the script",
  "caption_suggestion": "Social media description"
}`

        const userPrompt = `Create a ${length} ${contentType} ${platform} script about: "${hook}". Tone: ${tone}. Generate a FULL, complete script ready for recording/posting.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        let script = safeParseJSON(result)
        if (!script) return NextResponse.json({ error: 'Failed to parse script' }, { status: 500 })
        if (script.script) script = script.script

        // Save
        const { error: insertError } = await supabase.from('scripts').insert({
          user_id: user.id,
          title: script.title || hook.substring(0, 100),
          hook: typeof script.hooks === 'object' ? script.hooks[0]?.text : script.hook,
          content: script.full_script || script.body, // Use 'content' to match schema
          cta: script.cta,
          platform,
          status: 'draft',
          settings: { ...params, contentType, length, tone }
        })
        if (insertError) console.error('Insert error:', insertError)

        return NextResponse.json({ script })
      }

      case 'refine-script': {
        const { script, feedback, platform, contentType } = params
        const systemPrompt = `You are an elite script editor. Your goal is to take an existing script and REFINE it based on user feedback.

Original Script:
${script}

Platform: ${platform}
Content Type: ${contentType}

Return JSON with the modified script:
{
  "refined_script": "The full updated script",
  "changes_made": "Brief summary of what was changed",
  "viral_score": 88
}

${voiceContext}`

        const userPrompt = `Refine the script based on this feedback: "${feedback}". Ensure the tone stays consistent with the platform and type. Return the full modified script.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const refined = safeParseJSON(result)
        if (!refined) return NextResponse.json({ error: 'Failed to refine script' }, { status: 500 })

        return NextResponse.json({ refined })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 2: GENERATOR — Hook Optimizer (5 Named Styles)
      // ═══════════════════════════════════════════════════════
      case 'hook-optimize': {
        const { hook, platform = 'any', niche = 'coaching/consulting' } = params

        const systemPrompt = `You are the world's foremost expert on social media hooks. You've analyzed 100,000+ hooks across every platform and can predict engagement with 90% accuracy. You don't just score — you REWRITE.

Analyze the hook and provide a brutal, honest assessment. Then rewrite it in 5 distinct styles.

Return JSON:
{
  "original": "${hook}",
  "overall_score": 65,
  "analysis": {
    "curiosity": {
      "score": 7,
      "feedback": "Specific feedback on whether it creates an open loop. What's missing? What would make it irresistible?"
    },
    "specificity": {
      "score": 5,
      "feedback": "Does it use specific numbers, names, timeframes, dollar amounts? Vague hooks die."
    },
    "emotional_trigger": {
      "score": 6,
      "primary_emotion": "fear/desire/anger/surprise/envy/shame/pride",
      "feedback": "Which emotion does it trigger? Is it strong enough? How to amplify?"
    },
    "pattern_interrupt": {
      "score": 8,
      "feedback": "Does it break expectations? Does it challenge what the reader assumes?"
    },
    "authority_signal": {
      "score": 4,
      "feedback": "Does it signal expertise or results? Does the reader trust this person?"
    }
  },
  "rewrites": [
    {
      "style": "The Contrarian",
      "hook": "Everyone says X. Here's why they're wrong.",
      "explanation": "Why this works: challenges conventional wisdom, triggers curiosity + mild anger",
      "predicted_score": 82
    },
    {
      "style": "The Specific Number",
      "hook": "3 mindset shifts that made me $500K in 12 months",
      "explanation": "Why this works: specificity creates believability, number creates structure expectation",
      "predicted_score": 78
    },
    {
      "style": "The Open Loop",
      "hook": "I discovered something that changed everything about how I...",
      "explanation": "Why this works: unresolved tension forces the brain to seek closure",
      "predicted_score": 75
    },
    {
      "style": "The Pattern Interrupt",
      "hook": "Stop doing X. Do this instead.",
      "explanation": "Why this works: tells them they're wrong → instant attention",
      "predicted_score": 80
    },
    {
      "style": "The Social Proof",
      "hook": "How [famous person] actually thinks about [topic]",
      "explanation": "Why this works: borrowed authority + curiosity about insider knowledge",
      "predicted_score": 77
    }
  ],
  "overall_feedback": "Direct, no-BS paragraph. Reference the actual words in their hook. What's the single biggest weakness? What's the #1 fix? Be brutally honest but constructive.",
  "best_rewrite": 0,
  "best_rewrite_reason": "Why the top-ranked rewrite would outperform the original by 3-5x"
}

Platform: ${platform}. Niche: ${niche}.
${voiceContext}`

        const userPrompt = `Analyze and rewrite this hook: "${hook}". Be brutally honest — if it's weak, say so. Then provide 5 dramatically different rewrites that would 3-5x its engagement. Each rewrite must feel like a completely different creator wrote it. Rank them by predicted performance.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const hookAnalysis = safeParseJSON(result)
        if (!hookAnalysis) return NextResponse.json({ error: 'Failed to parse hook analysis' }, { status: 500 })

        return NextResponse.json({ hookAnalysis })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 2: GENERATOR — Framework Suggest
      // ═══════════════════════════════════════════════════════
      case 'framework-suggest': {
        const { rawIdea, goal = 'engagement', platform = 'LinkedIn' } = params

        const systemPrompt = `You are a content framework strategist who has cataloged and tested 500+ content frameworks. You know exactly which framework to use for any combination of goal, platform, and content type.

Given a raw idea, suggest the 3 best frameworks and explain WHY each one is the best fit.

Return JSON:
{
  "suggestions": [
    {
      "rank": 1,
      "framework_name": "Name of the framework",
      "category": "hooks / stories / educational / controversy / ctas / authority / engagement",
      "structure": "Step-by-step structure of the framework",
      "template": "Fill-in-the-blank template the user can use immediately",
      "applied_example": "The user's raw idea written using this framework — complete, ready to post",
      "why_this_works": "2-3 sentences: Why this framework + this idea + this platform = high performance",
      "expected_engagement": "Predicted engagement level: low/medium/high/viral",
      "best_for": "What type of content goal this excels at"
    }
  ],
  "reasoning": "1-2 sentences explaining your selection logic — what patterns in the idea made you choose these frameworks"
}

Goal: ${goal}. Platform: ${platform}.
${voiceContext}`

        const userPrompt = `My raw idea: "${rawIdea}". Goal: ${goal}. Platform: ${platform}. Suggest the 3 best content frameworks and APPLY each one to my idea — give me ready-to-use output, not just framework descriptions.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse suggestions' }, { status: 500 })

        return NextResponse.json({ suggestions: parsed.suggestions || parsed })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 2: GENERATOR — Series Builder (Enhanced)
      // ═══════════════════════════════════════════════════════
      case 'series': {
        const {
          coreIdea,
          platform = 'LinkedIn',
          niche = 'coaching',
          seriesLength = 10,
          seriesGoal = 'authority-to-sales',
        } = params

        const systemPrompt = `You are a content series strategist who builds multi-post campaigns that take audiences from "who is this?" to "take my money." You understand narrative tension across posts.

Generate a ${seriesLength}-post content series with a strategic narrative arc:

Posts 1-2: HOOK phase — Attention-grabbing, bold, shareable
Posts 3-4: EDUCATE phase — Deep value, builds trust and expertise perception
Posts 5-6: STORY phase — Personal stories, vulnerability, emotional connection
Posts 7-8: TACTICAL phase — Step-by-step, frameworks, "I can DO this" moments
Post 9: OBJECTION phase — Address why people hesitate
Post 10: CTA phase — Case study + clear, direct offer

Return JSON:
{
  "series_title": "Name for this content series",
  "narrative_arc": "2-3 sentences describing the emotional journey across all posts",
  "series": [
    {
      "day": 1,
      "type": "hook/educate/story/tactical/objection/cta",
      "title": "Descriptive title",
      "hook": "The scroll-stopping first line",
      "body": "Complete post body. 100-250 words. Ready to copy-paste and publish.",
      "cta": "Platform-appropriate CTA",
      "platform": "${platform}",
      "teaser_for_next": "How this post teases or connects to the next one",
      "predicted_engagement": "low/medium/high/viral",
      "predicted_conversions": "none/soft-leads/direct-leads/sales",
      "best_time_to_post": "Recommended day/time"
    }
  ],
  "cross_promotion_strategy": "How to promote this series in stories, emails, and other platforms",
  "email_tie_in": "Suggested email to send alongside this series to subscribers"
}

Niche: ${niche}. Platform: ${platform}. Goal: ${seriesGoal}.
${voiceContext}`

        const userPrompt = `Build a ${seriesLength}-post content series about: "${coreIdea}". Platform: ${platform}. Niche: ${niche}. Each post must be COMPLETE (ready to publish), build on the previous one, and drive toward ${seriesGoal}. Include cross-promotion strategy.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        let parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse series' }, { status: 500 })
        const series = parsed.series || (Array.isArray(parsed) ? parsed : [])

        return NextResponse.json({
          series,
          seriesTitle: parsed.series_title,
          narrativeArc: parsed.narrative_arc,
          crossPromotion: parsed.cross_promotion_strategy,
          emailTieIn: parsed.email_tie_in,
        })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 2: GENERATOR — Repurpose Engine (Enhanced)
      // ═══════════════════════════════════════════════════════
      case 'repurpose': {
        const { content, sourceType = 'post', targetPlatforms = ['linkedin', 'twitter', 'shorts', 'newsletter', 'carousel', 'email'] } = params

        const systemPrompt = `You are a content repurposing strategist who turns one piece of content into an entire week's worth of multi-platform assets. Each piece must feel NATIVE to its platform — not reformatted.

Take this ${sourceType} and create platform-specific content for: ${targetPlatforms.join(', ')}.

Return JSON:
{
  "asset_count": 20,
  "linkedin": [
    {
      "hook": "LinkedIn-optimized hook. Professional, insight-led. Uses line breaks.",
      "body": "Full LinkedIn post. 150-300 words. Short paragraphs. Personal insight. Engagement question at end.",
      "hashtags": ["3-5 hashtags"],
      "best_time": "Tuesday 8am EST"
    },
    { "hook": "Different angle", "body": "...", "hashtags": [], "best_time": "" },
    { "hook": "Third angle", "body": "...", "hashtags": [], "best_time": "" }
  ],
  "twitter": [
    { "content": "Tweet 1 — 280 chars max. Hot take.", "type": "standalone" },
    { "content": "Tweet 2 — listicle format", "type": "standalone" },
    {
      "type": "thread",
      "tweets": [
        "Thread opener (most important tweet)",
        "Point 1",
        "Point 2",
        "Point 3",
        "CTA tweet"
      ]
    }
  ],
  "shorts": [
    {
      "title": "Video title (curiosity-driven)",
      "script": "30-60 second script with [HOOK] [BODY] [CTA] markers",
      "thumbnail_idea": "Suggested thumbnail concept",
      "caption": "Video caption"
    },
    { "title": "", "script": "", "thumbnail_idea": "", "caption": "" }
  ],
  "newsletter": {
    "subject_line": "Email subject (40%+ open rate potential)",
    "preview_text": "Preview text shown in inbox",
    "body": "Complete email. Opening hook → Context/Story → 3 key insights → Action step → CTA. 300-500 words.",
    "ps_line": "P.S. line (often most-read part of an email)"
  },
  "carousel": [
    {
      "slide_count": 8,
      "slides": [
        { "slide": 1, "headline": "Cover slide headline", "subtext": "Supporting text" },
        { "slide": 2, "headline": "Problem statement", "subtext": "" },
        { "slide": 3, "headline": "Point 1", "subtext": "Explanation" },
        { "slide": 4, "headline": "Point 2", "subtext": "Explanation" },
        { "slide": 5, "headline": "Point 3", "subtext": "Explanation" },
        { "slide": 6, "headline": "Summary / Key takeaway", "subtext": "" },
        { "slide": 7, "headline": "CTA slide", "subtext": "Follow + save + share" }
      ]
    }
  ],
  "lead_magnet_outline": {
    "title": "Lead magnet title (e.g., 'The 5-Step Framework for...')",
    "format": "PDF checklist / Notion template / Mini-guide / Swipe file",
    "sections": ["Section 1 title", "Section 2 title", "Section 3 title"],
    "hook": "How to position this lead magnet in a CTA"
  }
}

${voiceContext}`

        const userPrompt = `Repurpose this ${sourceType} into multi-platform content: "${content}". Each piece must feel native to its platform. Generate as many assets as possible. Include carousel slides, email newsletter, and lead magnet outline.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const repurposed = safeParseJSON(result)
        if (!repurposed) return NextResponse.json({ error: 'Failed to parse repurposed content' }, { status: 500 })

        return NextResponse.json({ repurposed })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 3: STRATEGIST — Calendar Auto-Fill
      // ═══════════════════════════════════════════════════════
      case 'calendar-autofill': {
        const {
          niche = 'coaching',
          goals = ['authority', 'leads'],
          platforms = ['LinkedIn'],
          daysToFill = 30,
          existingTopics = [],
        } = params

        const systemPrompt = `You are a content strategist who builds 30-day content calendars that systematically grow audiences and generate leads. You understand content rhythm, topic variety, and audience fatigue.

Generate a ${daysToFill}-day content calendar.

Return JSON:
{
  "calendar": [
    {
      "day": 1,
      "date_label": "Monday",
      "platform": "${platforms[0] || 'LinkedIn'}",
      "content_type": "hook / educational / story / tactical / case-study / polarizing / behind-the-scenes / carousel / thread",
      "title": "Working title for this piece",
      "hook": "Suggested hook / first line",
      "notes": "Brief notes on angle / what to cover",
      "goal": "engagement / leads / authority / sales",
      "priority": "must-post / recommended / bonus",
      "estimated_time": "15min / 30min / 1hr"
    }
  ],
  "strategy_notes": "2-3 sentences explaining the content mix and rhythm",
  "weekly_rhythm": "Suggested posting pattern (e.g., Mon: educational, Wed: story, Fri: hot take)"
}

${existingTopics.length > 0 ? `Topics already covered (avoid repeating): ${existingTopics.join(', ')}` : ''}
${voiceContext}`

        const userPrompt = `Generate a ${daysToFill}-day content calendar for a ${niche} creator. Platforms: ${platforms.join(', ')}. Goals: ${goals.join(', ')}. Mix content types strategically — don't just repeat "educational post" every day. Include specific titles and hooks so I can execute immediately.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse calendar' }, { status: 500 })

        return NextResponse.json({
          calendar: parsed.calendar || parsed,
          strategyNotes: parsed.strategy_notes,
          weeklyRhythm: parsed.weekly_rhythm,
        })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 4: ANALYZER — Content Autopsy
      // ═══════════════════════════════════════════════════════
      case 'content-autopsy': {
        const { content, platform = 'unknown', metrics = {} } = params

        const systemPrompt = `You are a content forensics expert who reverse-engineers WHY content goes viral. You analyze posts the way a detective analyzes a crime scene — every word, every structure choice, every psychological trigger.

Perform a complete content autopsy.

Return JSON:
{
  "autopsy": {
    "verdict": "VIRAL / HIGH-PERFORMING / AVERAGE / UNDERPERFORMING — and WHY in one sentence",
    "hook_analysis": {
      "technique": "What hook technique was used (pattern interrupt, curiosity gap, etc.)",
      "effectiveness": 8,
      "breakdown": "Line-by-line analysis of the hook. What word choices work? What could be stronger?"
    },
    "emotional_triggers": {
      "primary": "The dominant emotion triggered (fear, desire, anger, surprise, envy, shame, pride, belonging)",
      "secondary": "Secondary emotion if present",
      "intensity": "low / medium / high / extreme",
      "specific_moments": ["Quote specific phrases that trigger emotions and explain which emotion"]
    },
    "narrative_structure": {
      "type": "What structure was used (problem-solution, story arc, listicle, etc.)",
      "pacing": "How the content flows — fast/slow? When does tension build/release?",
      "turning_point": "Is there a key moment where the content shifts? What is it?"
    },
    "cta_analysis": {
      "type": "What type of CTA (soft, direct, authority, scarcity)",
      "placement": "Where in the content is it placed? Is that optimal?",
      "effectiveness": 7,
      "improvement": "How to make the CTA 2x more effective"
    },
    "what_to_steal": [
      "Specific technique 1 you should use in YOUR content and how",
      "Specific technique 2",
      "Specific technique 3"
    ],
    "what_to_avoid": [
      "What this content does that you should NOT copy and why"
    ],
    "rewrite_suggestion": "How YOU would rewrite this content to perform even better, in 2-3 sentences"
  }
}

${voiceContext}`

        const userPrompt = `Perform a complete autopsy on this ${platform} content:\n\n"${content}"\n\n${Object.keys(metrics).length > 0 ? `Performance metrics: ${JSON.stringify(metrics)}` : 'No metrics available — analyze structure/psychology only.'}\n\nBe surgical. I want to understand EXACTLY why this works (or doesn't) at a psychological level.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse autopsy' }, { status: 500 })

        return NextResponse.json({ autopsy: parsed.autopsy || parsed })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 4: ANALYZER — Predict Performance
      // ═══════════════════════════════════════════════════════
      case 'predict-performance': {
        const { content, platform = 'LinkedIn', niche = 'coaching' } = params

        const systemPrompt = `You are a content performance predictor with access to patterns from 1M+ social media posts. You can predict engagement with 85% accuracy by analyzing content structure, hooks, and psychological triggers.

Predict how this content will perform BEFORE it's posted.

Return JSON:
{
  "prediction": {
    "virality_score": 72,
    "confidence": "high / medium / low",
    "predicted_reach_multiplier": "2.5x your average",
    "predicted_engagement_rate": "4.2%",
    "strengths": [
      "Specific strength 1 with explanation",
      "Specific strength 2"
    ],
    "weaknesses": [
      "Specific weakness 1 with fix",
      "Specific weakness 2 with fix"
    ],
    "hook_verdict": "STRONG / WEAK / AVERAGE — because...",
    "cta_verdict": "STRONG / WEAK / MISSING — because...",
    "suggested_improvements": [
      {
        "change": "Exact change to make (reference specific words/lines)",
        "impact": "Expected improvement if implemented",
        "priority": "critical / high / medium / low"
      }
    ],
    "alternative_hook": "A stronger hook if the current one is weak",
    "best_posting_time": "Suggested day and time for maximum reach",
    "overall_verdict": "1-2 sentence honest assessment. Would YOU stop scrolling for this?"
  }
}

Platform: ${platform}. Niche: ${niche}.
${voiceContext}`

        const userPrompt = `Predict the performance of this ${platform} content BEFORE I post it:\n\n"${content}"\n\nBe brutally honest. If it's going to flop, tell me now so I can fix it. If it's viral material, tell me why. Give me specific improvements, not generic advice.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse prediction' }, { status: 500 })

        return NextResponse.json({ prediction: parsed.prediction || parsed })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 4: ANALYZER — Performance Analysis (Enhanced)
      // ═══════════════════════════════════════════════════════
      case 'analyze-performance': {
        const { metrics } = params

        const systemPrompt = `You are a content performance analyst who has analyzed data for 1,000+ creator brands. You are NOT a motivational speaker — you are a strategist who gives surgical, data-driven recommendations.

Analyze the metrics. Be SPECIFIC. Reference the actual numbers. Don't sugarcoat.

Return JSON:
{
  "summary": "2-3 sentence brutally honest assessment. Reference actual numbers.",
  "content_health_score": 72,
  "strengths": ["Specific strength with data reference"],
  "weaknesses": ["Specific weakness with data reference"],
  "recommendations": [
    {
      "action": "Exact, specific action to take THIS WEEK",
      "priority": "critical / high / medium / low",
      "expected_impact": "Quantified expected improvement",
      "timeline": "How long until results show"
    }
  ],
  "benchmarks": {
    "views_vs_avg": "How their views compare to niche average",
    "engagement_vs_avg": "How engagement compares",
    "conversion_vs_avg": "How lead gen compares"
  },
  "content_mix_analysis": "Are they posting the right mix of content types?",
  "next_steps": "Clear, motivating paragraph on the #1 lever to pull. Make it feel like a mentor, not a report."
}
${voiceContext}`

        const userPrompt = `Analyze these content metrics: Views: ${metrics.views}, Watch Time: ${metrics.watch_time_percent}%, Likes: ${metrics.likes}, Comments: ${metrics.comments}, Saves: ${metrics.saves}, Shares: ${metrics.shares || 0}, Leads: ${metrics.leads_generated}. Be brutally honest. What's the single biggest lever?`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const analysis = safeParseJSON(result)
        if (!analysis) return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 })

        await supabase.from('weekly_reports').insert({
          user_id: user.id,
          recommendations: JSON.stringify(analysis),
        })

        return NextResponse.json({ analysis })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 5: MONETIZER — CTA Optimizer (Enhanced)
      // ═══════════════════════════════════════════════════════
      case 'cta-optimize': {
        const {
          offerType = 'coaching',
          offerPrice = '',
          context = '',
          funnelStage = 'mixed',
          platform = 'LinkedIn',
        } = params

        const systemPrompt = `You are a CTA conversion specialist for high-ticket offers ($2k-$25k). You've tested 10,000+ CTAs and know exactly what language converts at each funnel stage.

Generate 6 CTA variations optimized for different scenarios.

Return JSON:
{
  "ctas": {
    "cold_awareness": {
      "cta": "For cold audiences. Low commitment. Build curiosity.",
      "where_to_use": "End of educational/value posts",
      "expected_response_rate": "1-2%",
      "follow_up_action": "What to do when they respond"
    },
    "warm_engagement": {
      "cta": "For engaged followers. Create a small commitment.",
      "where_to_use": "After trust-building content",
      "expected_response_rate": "3-5%",
      "follow_up_action": ""
    },
    "hot_conversion": {
      "cta": "For ready-to-buy audience. Direct, specific, urgent.",
      "where_to_use": "After case studies or results posts",
      "expected_response_rate": "5-10%",
      "follow_up_action": ""
    },
    "story_close": {
      "cta": "Embedded naturally in a story. Feels organic, not salesy.",
      "where_to_use": "After personal stories or transformations",
      "expected_response_rate": "2-4%",
      "follow_up_action": ""
    },
    "scarcity": {
      "cta": "Genuine urgency. Limited spots, deadline, or exclusivity.",
      "where_to_use": "Launch content, limited offers",
      "expected_response_rate": "8-15%",
      "follow_up_action": ""
    },
    "community": {
      "cta": "Drive toward a free community or low-barrier entry point.",
      "where_to_use": "Top-of-funnel, awareness content",
      "expected_response_rate": "5-8%",
      "follow_up_action": ""
    }
  },
  "dm_script": {
    "opener": "What to say when someone DMs you from a CTA",
    "qualify": "How to qualify if they're a good fit (2-3 questions)",
    "transition": "How to transition from DM to call/sale"
  },
  "pro_tips": ["3 expert tips on CTA copywriting that most creators get wrong"]
}

Offer: ${offerType}. ${offerPrice ? `Price: ${offerPrice}.` : ''} Platform: ${platform}. Funnel stage: ${funnelStage}.
${voiceContext}`

        const userPrompt = `Generate 6 high-converting CTAs for a ${offerType} offer${offerPrice ? ` at ${offerPrice}` : ''}. ${context ? `Context: ${context}` : ''} Platform: ${platform}. Include a DM follow-up script.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const ctas = safeParseJSON(result)
        if (!ctas) return NextResponse.json({ error: 'Failed to parse CTAs' }, { status: 500 })

        return NextResponse.json({ ctas })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 5: MONETIZER — Lead Magnet Generator
      // ═══════════════════════════════════════════════════════
      case 'lead-magnet': {
        const {
          topic,
          format = 'pdf-checklist',
          targetAudience = 'coaches and consultants',
          offerTieIn = '',
        } = params

        const systemPrompt = `You are a lead magnet strategist who has created 500+ lead magnets that have collectively generated 2M+ email subscribers and $100M+ in pipeline for coaches and consultants.

Create a complete lead magnet outline that is so valuable people would pay for it.

Return JSON:
{
  "lead_magnet": {
    "title": "Compelling title (uses specific numbers + outcome promise)",
    "subtitle": "Supporting subtitle",
    "format": "${format}",
    "hook": "How to describe this lead magnet in a CTA (1-2 sentences)",
    "landing_page_headline": "Headline for the opt-in page",
    "sections": [
      {
        "title": "Section 1 title",
        "content_outline": "3-5 bullet points of what this section covers",
        "key_takeaway": "The one thing the reader should remember"
      }
    ],
    "bonus_ideas": [
      "Bonus 1 they could add to increase perceived value",
      "Bonus 2"
    ],
    "delivery_sequence": {
      "email_1_subject": "Welcome email subject line",
      "email_1_preview": "What the first email says (tease content + deliver link)",
      "email_2_subject": "Follow-up email 24hrs later",
      "email_2_preview": "What the follow-up covers (additional value + soft pitch)",
      "email_3_subject": "48hrs later",
      "email_3_preview": "Transition to offer conversation"
    },
    "cta_examples": [
      "3 different CTAs to use in posts when promoting this lead magnet"
    ]
  }
}

Topic: ${topic}. Target: ${targetAudience}. Format: ${format}.
${offerTieIn ? `This should naturally lead to the user's paid offer: ${offerTieIn}` : ''}
${voiceContext}`

        const userPrompt = `Create a complete lead magnet about "${topic}" for ${targetAudience}. Format: ${format}. It must be so good that people screenshot it and share it, creating organic reach.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse lead magnet' }, { status: 500 })

        return NextResponse.json({ leadMagnet: parsed.lead_magnet || parsed })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 5: MONETIZER — Sales Script Builder
      // ═══════════════════════════════════════════════════════
      case 'sales-script': {
        const {
          offerName,
          offerPrice = '$5,000',
          offerDescription = '',
          scriptType = 'dm', // dm, call, email-sequence
          targetAudience = 'coaches',
        } = params

        const systemPrompt = `You are a sales copywriter who has written $50M+ in high-ticket sales scripts for coaches and consultants. You write scripts that feel like genuine conversations, not sleazy pitches.

Create a ${scriptType} sales script.

Return JSON:
{
  "script": {
    "type": "${scriptType}",
    "offer": "${offerName}",
    "price": "${offerPrice}",
    ${scriptType === 'dm' ? `
    "dm_sequence": [
      {
        "message_number": 1,
        "timing": "Immediately after they DM",
        "message": "The exact message to send. Conversational, not corporate.",
        "goal": "What this message achieves",
        "if_they_respond": "What to say if they reply positively",
        "if_no_response": "Follow-up message after 24hrs"
      },
      {
        "message_number": 2,
        "timing": "After qualifying",
        "message": "Qualifying questions disguised as genuine curiosity",
        "goal": "Identify if they're a good fit"
      },
      {
        "message_number": 3,
        "timing": "Transition to call",
        "message": "How to naturally suggest a call without being pushy",
        "goal": "Book a call or close in DMs"
      }
    ]` : scriptType === 'call' ? `
    "call_script": {
      "opening": "First 2 minutes. Build rapport, set frame, create safety.",
      "discovery": "5-7 minutes. Questions to uncover pain, goals, urgency. List 5-7 specific questions.",
      "agitation": "2-3 minutes. Reflect their pain back. Make the cost of inaction vivid.",
      "presentation": "3-5 minutes. Present the offer as the bridge between their pain and desired outcome.",
      "objection_handling": {
        "too_expensive": "Word-for-word response",
        "need_to_think": "Word-for-word response",
        "not_the_right_time": "Word-for-word response",
        "tried_before": "Word-for-word response"
      },
      "close": "The exact closing sequence. Multiple closing techniques.",
      "post_call": "What to do after the call (follow-up email, etc.)"
    }` : `
    "email_sequence": [
      {
        "email_number": 1,
        "subject": "Subject line",
        "send_day": "Day 1",
        "body": "Complete email body. 200-400 words.",
        "cta": "What action to take",
        "ps_line": "P.S. line"
      }
    ]`}
  }
}

${voiceContext}`

        const userPrompt = `Create a ${scriptType} sales script for "${offerName}" at ${offerPrice}. Target: ${targetAudience}. ${offerDescription ? `Offer details: ${offerDescription}` : ''} Make it feel like a real conversation between equals, not a used car salesman pitch.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse sales script' }, { status: 500 })

        return NextResponse.json({ salesScript: parsed.script || parsed })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 6: VAULT — AI Auto-Tag
      // ═══════════════════════════════════════════════════════
      case 'vault-tag': {
        const { idea } = params

        const systemPrompt = `You are an idea categorization AI. Given a raw idea, instantly classify it.

Return JSON:
{
  "tags": {
    "topic": "The main topic (1-3 words)",
    "format": "best content format: tweet / thread / reel / carousel / long-form / story / tutorial",
    "urgency": "post-now / this-week / backlog / evergreen",
    "viral_potential": "low / medium / high / viral",
    "goal": "engagement / leads / authority / sales / community",
    "difficulty": "quick-win / medium-effort / deep-work",
    "emotion": "Primary emotion this would trigger"
  },
  "suggested_hook": "A quick hook to get started if they want to turn this into content now",
  "related_angles": ["2-3 other angles they could explore from this same idea"]
}`

        const userPrompt = `Classify this idea: "${idea}". Be fast and accurate. Give me the best format, urgency, and a quick hook to get started.`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ error: 'Failed to parse tags' }, { status: 500 })

        return NextResponse.json({ tags: parsed.tags || parsed, suggestedHook: parsed.suggested_hook, relatedAngles: parsed.related_angles })
      }

      // ═══════════════════════════════════════════════════════
      // PILLAR 6: VAULT — Smart Search
      // ═══════════════════════════════════════════════════════
      case 'vault-search': {
        const { query } = params

        // Fetch all user's vault items
        const { data: vaultItems } = await supabase
          .from('vault_items')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(200)

        // Also fetch ideas and scripts
        const { data: ideas } = await supabase
          .from('content_ideas')
          .select('*')
          .eq('user_id', user.id)
          .limit(100)

        const { data: scripts } = await supabase
          .from('scripts')
          .select('*')
          .eq('user_id', user.id)
          .limit(100)

        const allContent = [
          ...(vaultItems || []).map((v: Record<string, string>) => ({ type: 'vault', ...v })),
          ...(ideas || []).map((i: Record<string, string>) => ({ type: 'idea', ...i })),
          ...(scripts || []).map((s: Record<string, string>) => ({ type: 'script', ...s })),
        ]

        if (allContent.length === 0) {
          return NextResponse.json({ results: [], message: 'No content found in your vault yet.' })
        }

        const systemPrompt = `You are a semantic search engine for a content creator's vault. Given a natural language query and a list of content items, find the most relevant matches.

Return JSON:
{
  "results": [
    {
      "index": 0,
      "relevance_score": 95,
      "reason": "Why this is relevant to the query"
    }
  ],
  "suggestion": "A suggestion for the user based on what they're looking for"
}`

        const userPrompt = `Query: "${query}"\n\nContent library (${allContent.length} items):\n${allContent.slice(0, 50).map((item: Record<string, string>, i: number) => `[${i}] ${item.type}: ${item.title || item.hook || item.content || 'untitled'}`).join('\n')}`

        const result = await generateAIResponse(systemPrompt, userPrompt)
        const parsed = safeParseJSON(result)
        if (!parsed) return NextResponse.json({ results: allContent.slice(0, 10) })

        const matchedResults = (parsed.results || []).map((r: Record<string, number>) => ({
          ...allContent[r.index],
          relevance_score: r.relevance_score,
          reason: r.reason,
        })).filter((r: Record<string, unknown>) => r.type)

        return NextResponse.json({ results: matchedResults, suggestion: parsed.suggestion })
      }

      default:
        return NextResponse.json({ error: `Unknown action type: ${type}` }, { status: 400 })
    }
  } catch (error) {
    console.error('AI API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
