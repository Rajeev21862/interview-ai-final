
const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

// Gemini API configuration
const apiKey = process.env.GEMINI_API_KEY

if (!apiKey) {
    throw new Error(
        "GEMINI_API_KEY is missing from your .env file"
    )
}

const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
        timeout: 60000
    }
})

// Gemini model
const MODEL_NAME = "gemini-3.8-flash"


// Interview report schema
const interviewReportSchema = z.object({

    matchScore: z.number().describe(
        "A score between 0 and 100 indicating how well the candidate matches the job description"
    ),

    technicalQuestions: z.array(
        z.object({
            question: z.string().describe(
                "Technical interview question"
            ),
            intention: z.string().describe(
                "Why the interviewer asks this question"
            ),
            answer: z.string().describe(
                "How the candidate should answer"
            )
        })
    ),

    behavioralQuestions: z.array(
        z.object({
            question: z.string().describe(
                "Behavioral interview question"
            ),
            intention: z.string().describe(
                "Why the interviewer asks this question"
            ),
            answer: z.string().describe(
                "How the candidate should answer"
            )
        })
    ),

    skillGaps: z.array(
        z.object({
            skill: z.string().describe(
                "Skill missing from the candidate profile"
            ),
            severity: z.enum([
                "low",
                "medium",
                "high"
            ]).describe(
                "Importance of the missing skill"
            )
        })
    ),

    preparationPlan: z.array(
        z.object({
            day: z.number().describe(
                "Preparation day number starting from 1"
            ),
            focus: z.string().describe(
                "Main focus for the day"
            ),
            tasks: z.array(
                z.string()
            ).describe(
                "Tasks to complete during the day"
            )
        })
    ),

    title: z.string().describe(
        "Job title for the interview report"
    )

})


// Generate interview report
async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    console.log("=================================")
    console.log("Starting interview report generation")
    console.log("Model:", MODEL_NAME)
    console.log("Resume length:", resume?.length || 0)
    console.log("=================================")

    const prompt = `
Generate a personalized interview report for a candidate.

Candidate Resume:
${resume || "Not provided"}

Self Description:
${selfDescription || "Not provided"}

Job Description:
${jobDescription}

Analyze the candidate's experience, skills and projects.

Generate:
1. A match score between 0 and 100.
2. Relevant technical interview questions.
3. Relevant behavioral interview questions.
4. Important skill gaps.
5. A day-wise interview preparation plan.
6. The job title.

Provide practical, detailed and realistic answers.
`

    try {

        console.log("Sending request to Gemini...")

        const startTime = Date.now()

        const response = await ai.models.generateContent({

            model: MODEL_NAME,

            contents: prompt,

            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(
                    interviewReportSchema
                )
            }

        })

        console.log(
            "Gemini response received in",
            (Date.now() - startTime) / 1000,
            "seconds"
        )

        if (!response.text) {
            throw new Error(
                "Gemini returned an empty response"
            )
        }

        console.log("Parsing Gemini response...")

        const report = JSON.parse(response.text)

        const validatedReport =
            interviewReportSchema.parse(report)

        console.log(
            "Interview report generated successfully"
        )

        return validatedReport

    } catch (error) {

        console.error("=================================")
        console.error("GEMINI API ERROR")
        console.error("Message:", error.message)
        console.error("Status:", error.status)
        console.error("=================================")

        throw error

    }

}


// Convert HTML into PDF
async function generatePdfFromHtml(htmlContent) {

    let browser

    try {

        console.log("Starting PDF generation...")

        browser = await puppeteer.launch({
            headless: true
        })

        const page = await browser.newPage()

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0",
            timeout: 30000
        })

        const pdfBuffer = await page.pdf({

            format: "A4",

            printBackground: true,

            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }

        })

        console.log("PDF generated successfully")

        return pdfBuffer

    } catch (error) {

        console.error(
            "PDF generation error:",
            error.message
        )

        throw error

    } finally {

        if (browser) {
            await browser.close()
        }

    }

}


// Generate optimized resume PDF
async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    console.log("Starting optimized resume generation...")

    const resumePdfSchema = z.object({

        html: z.string().describe(
            "Complete HTML content of the optimized resume"
        )

    })

    const prompt = `
Generate a professional, ATS-friendly resume.

Candidate Resume:
${resume}

Self Description:
${selfDescription}

Job Description:
${jobDescription}

Requirements:

1. Tailor the resume to the job description.
2. Highlight relevant skills and experience.
3. Use professional, natural language.
4. Do not invent qualifications or experience.
5. Keep the resume ideally 1-2 pages long.
6. Make the resume ATS-friendly.
7. Use simple, professional formatting.
8. Generate complete HTML content suitable
   for conversion to PDF.

Return JSON containing one field named "html".
`

    try {

        console.log("Sending resume request to Gemini...")

        const response = await ai.models.generateContent({

            model: MODEL_NAME,

            contents: prompt,

            config: {
                responseMimeType: "application/json",
                responseSchema: zodToJsonSchema(
                    resumePdfSchema
                )
            }

        })

        console.log("Gemini resume response received")

        if (!response.text) {
            throw new Error(
                "Gemini returned an empty resume response"
            )
        }

        const jsonContent = resumePdfSchema.parse(
            JSON.parse(response.text)
        )

        const pdfBuffer = await generatePdfFromHtml(
            jsonContent.html
        )

        console.log("Resume PDF ready")

        return pdfBuffer

    } catch (error) {

        console.error(
            "Resume generation failed:",
            error.message
        )

        throw error

    }

}


module.exports = {
    generateInterviewReport,
    generateResumePdf
}
