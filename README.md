# Interview AI 🎯

**An AI-powered interview preparation platform** that analyzes resumes and job descriptions to generate personalized interview strategies using Google's Gemini AI.

## 🚀 Features

- **Resume Analysis** – Extracts and analyzes information from PDF resumes.
- **Job Matching** – Evaluates candidate profiles against job requirements.
- **AI Interview Questions** – Generates personalized technical and behavioral questions.
- **Skill Gap Analysis** – Identifies areas for improvement.
- **Preparation Roadmap** – Provides tailored interview preparation recommendations.
- **Interview History** – Stores generated reports for future reference.
- **Secure Authentication** – JWT-based authentication with HttpOnly cookies.

## 🛠️ Tech Stack

| Frontend | Backend | Database | AI |
|---|---|---|---|
| React.js | Node.js, Express.js | MongoDB, Mongoose | Google Gemini API |

**Other Technologies:** JavaScript, JWT, Multer, PDF Parse, Puppeteer, Axios

## ⚙️ How It Works

1. Upload a PDF resume and enter the target job description.
2. Provide an optional self-description.
3. The backend extracts resume text and sends the relevant information to Gemini AI.
4. Gemini generates a personalized interview report.
5. View your interview strategy and access previously generated reports.

## 🔐 Security

- JWT-based user authentication.
- HttpOnly cookies for token storage.
- Protected API routes.
- Password hashing and environment-based secret management.

---

**Built with React, Node.js, MongoDB, and Google Gemini AI.**
