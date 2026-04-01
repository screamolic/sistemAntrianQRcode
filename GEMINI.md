<!-- GSD:project-start source:PROJECT.md -->

## Project

**QueueAutomation - Service Center Queue System**

A **greenfield build** of a QR Code-based Queue Management System for service centers — built with Next.js 15 (App Router), TypeScript, Tailwind CSS + shadcn/ui, PostgreSQL + Drizzle ORM, NextAuth.js for authentication, and Evolution-API for WhatsApp notifications.

**Core Value:** Enable service center customers to join queues via QR code scan and receive automated WhatsApp notifications at every step — reducing wait times, improving customer experience, and giving staff complete queue control.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->

## Technology Stack

# Tech Stack Analysis`n`n**Project:** QueueAutomation - QR Code Queue Management System`n**Analysis Date:** March 31, 2026`n`n## Core Framework`n`n| Technology | Version | Status | Notes |`n|------------|---------|--------|-------|`n| Next.js | 12.0.7 | Outdated | Released Oct 2021 |`n| React | 17.0.2 | Outdated | Released Oct 2020 |`n`n## UI Libraries`n`n| Technology | Version | Status |`n|------------|---------|--------|`n| Bootstrap | 5.1.3 | Outdated |`n| Semantic UI React | 2.0.4 | Outdated |`n| Reactstrap | 9.0.1 | Current |`n`n## Database`n`n| Technology | Version | Status |`n|------------|---------|--------|`n| MongoDB Driver | 4.2.2 | Outdated |`n`n## External Services`n`n| Service | Version | Purpose |`n|---------|---------|---------|`n| Twilio | 3.72.0 | SMS notifications |`n`n## QR Code`n`n| Package | Version |`n|---------|---------|`n| qrcode.react | 1.0.1 |`n| next-qrcode | 1.1.0 |`n`n## Environment Variables`n`n- MONGODB_URI`n- MONGODB_DB`n- TWILIO_ACCOUNT_SID`n- TWILIO_AUTH_TOKEN`n- DOMAIN`n- SUPERADMIN`n`n## Key Issues`n`n1. Next.js 12 is outdated (current: 14/15)`n2. React 17 is outdated (current: 18/19)`n3. Multiple overlapping UI frameworks`n4. No TypeScript`n5. No testing framework`n6. Plain text password storage`n7. Cookie-based auth without security flags`n8. SMS endpoint exposed without rate limiting`n`n## Recommended Modern Stack`n`n- Framework: Next.js 15 App Router`n- Language: TypeScript`n- UI: Tailwind CSS + shadcn/ui`n- Auth: NextAuth.js`n- Testing: Vitest + Playwright

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

# Coding Conventions and Patterns`n`n**Project:** QueueAutomation`n**Analysis Date:** March 31, 2026`n`n## JavaScript/React Conventions`n`n### File Extensions`n`n- .js - All JavaScript files (no TypeScript)`n- .css - All stylesheets`n\n\n### Component Declaration\n\nPattern: Default export function components\n\n```javascript\nexport default function ComponentName({ props }) {\n    return (<div>Content</div>)\n}\n```\n\n### Hooks Usage\n\n**useState:**\n```javascript\nconst [state, setState] = useState(initialValue);\nconst [email, setEmail] = useState("");\n```\n\n**useEffect:**\n```javascript\nuseEffect(() => {\n    setDate();\n}, []);\n```\n\n**useRouter:**\n```javascript\nconst router = useRouter();\nrouter.replace("/");\n```\n\n### Props Handling\n\n```javascript\n// Destructuring pattern\nexport default function Component({ prop1, prop2 }) {}\n\n// Or via props object\nexport default function Nav(props) {\n    console.log(props.cook);\n}\n```\n\n### Event Handlers\n\n**Naming:** handle[Event]\n\n```javascript\nconst handleLogin = async (event) => {\n    event.preventDefault();\n}\n\nconst handleClick = async (event) => {\n    if (validate()) {\n        event.preventDefault();\n    }\n}\n```\n\n### Validation Patterns\n\n```javascript\nconst validate = () => {\n    if (email === "") {\n        alert("Enter Email!");\n        return;\n    }\n    if (fname.search("[A-Za-z]+$") === -1) {\n        alert("First Name is not valid!");\n        return;\n    }\n    return true;\n}\n```\n\n**Validation Rules:**\n\n| Field | Rules |\n|-------|-------|\n| First Name | Required, letters only |\n| Last Name | Required, letters only |\n| Email | Required, valid format |\n| Password | Required, min 6 chars |\n| Phone | Required, 10 digits |\n\n### API Call Patterns\n\n**GET Request:**\n```javascript\nawait fetch(`/api/auth?email=${email}&password=${pass}`, {\n    method: "GET",\n    headers: { "Content-Type": "application/json" },\n})\n.then(async (result) => {\n    await result.json();\n})\n```\n\n**POST Request:**\n```javascript\nconst res = await fetch(`/api/sendMessage`, {\n method: "POST",\n headers: { "Content-Type": "application/json" },\n body: JSON.stringify({ phone, message }),\n});\n`\n\n### CSS/Styling Conventions\n\n**Import Pattern:**\n`javascript\nimport "../styles/globals.css"\nimport "../styles/front.css"\n`\n\n**CDN in Components:**\n`html\n<link href="bootstrap.css" rel="stylesheet">\n`\n\n**Inline Styles:**\n`javascript\nconst styling = {\n backgroundImage: "url(/Images/bg.jpg)",\n};\n<div style={styling}>\n`\n\n### Database Query Patterns\n\n`javascript\nconst { db } = await connectToDatabase();\n\n// FindOne\nawait db.collection("Admin").findOne({ email, password });\n\n// InsertOne\nawait db.collection("Admin").insertOne(data);\n\n// Find\nawait db.collection("Queue").find(data).toArray();\n\n// Delete\nawait db.collection("Queue").deleteOne({ \_id: ObjectId(id) });\n`\n\n### Conditional Rendering\n\n`javascript\n{userInfo == "superadmin_id" \n ? <SuperNav /> \n : <Nav />\n}\n\n{props.cook == "" ? <li></li> : <li>Content</li>}\n`\n\n### Cookie Management\n\n`javascript\n// Set\nCookies.set("user", id, { expires: 1/24 });\n\n// Remove\nCookies.remove("user");\n\n// Read (server-side)\nlet cook = req.cookies.user;\n```\n\n### Code Quality Issues\n\n**Anti-patterns Found:**\n\n1. Async useEffect (missing cleanup)\n2. Missing await on async calls\n3. Magic strings (hardcoded IDs)\n4. Typos ("confilct", "exits")\n5. Commented code blocks\n6. Inconsistent null checks\n7. Loose equality (== vs ===)\n\n### Naming Conventions\n\n| Type | Convention | Examples |\n|------|------------|----------|\n| Components | PascalCase | Nav.js |\n| API Routes | camelCase | newAdmin.js |\n| Variables | camelCase | adminList |\n| Functions | camelCase | handleLogin |\n| CSS Classes | kebab-case | btn-block |\n\n### Summary\n\n| Aspect | Convention | Consistency |\n|--------|------------|-------------|\n| File Extension | .js | Consistent |\n| Component Export | export default function | Consistent |\n| State Management | useState | Consistent |\n| API Calls | fetch with .then() | Consistent |\n| Error Handling | console.log | Minimal |\n| Equality | == and === mixed | Inconsistent |

<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

# Architecture Analysis`n`n**Project:** QueueAutomation`n**Analysis Date:** March 31, 2026`n`n## Architecture Overview`n`nNext.js 12 Pages Router with MongoDB backend and Twilio SMS integration.`n`n## Routing Structure (Pages Router)`n`n### Page Routes`n`n- `/` - Home page (index.js)`n- `/login` - Admin login`n- `/signup` - Admin registration`n- `/registration` - Student queue registration`n- `/superadmin` - Super admin dashboard`n- `/queue/[admin]` - Admin queue management`n- `/queue/[admin]/[date]` - Date-specific queue`n`n### API Routes`n`n- `/api/auth` - Admin authentication`n- `/api/newAdmin` - Create admin`n- `/api/getAdminList` - List all admins`n- `/api/getList` - Get queue entries`n- `/api/registerQ` - Join queue`n- `/api/sendMessage` - Send SMS`n- `/api/userInfo` - Get admin info`n- `/api/deleteList` - Clear queue`n- `/api/deleteAdmin` - Delete admin`n- `/api/deleteObj` - Remove from queue`n`n## Data Flow`n`n### Queue Registration Flow`n`n1. Student scans QR code`n2. Visits /registration page`n3. Enters name and phone`n4. POST to /api/registerQ`n5. MongoDB insert to Queue collection`n6. Redirect to queue view`n`n### Admin Auth Flow`n`n1. User submits credentials to /login`n2. GET /api/auth?email=X&password=Y`n3. MongoDB query Admin collection`n4. If found, store \_id in cookie`n5. Redirect to home`n`n### SMS Notification Flow`n`n1. Queue length >= 3`n2. POST /api/sendMessage`n3. Twilio API call`n4. SMS to 3rd person: "Be ready you are next"`n`n## Component Architecture`n`n### Layout Components`n`n- \_app.js - Root wrapper`n- Nav.js - Standard navigation`n- NavforSuperAdmin.js - Super admin nav`n- Footer.js - Site footer`n- About.js - Landing page content`n- Slider.js - Image carousel (unused)`n`n## Database Schema`n`n### Admin Collection`n`n```javascript`n{`n  _id: ObjectId`n fname: String`n  lname: String`n email: String`n  password: String (PLAIN TEXT)`n number: String`n}`n`` `n`n### Queue Collection`n`n``javascript`n{`n \_id: ObjectId`n  fname: String`n lname: String`n  phone: String`n admin: ObjectId (ref Admin)`n}`n``` `n`n## Authentication`n`n- Method: Cookie-based session`n- Cookie: js-cookie storing admin \_id`n- Expiry: 1 hour`n- Issues: No hashing, no JWT, no CSRF protection`n`n## Queue Workflow`n`n1. Admin creates account`n2. Admin visits /queue/[admin]`n3. QR code generated with URL`n4. Admin downloads/displays QR`n5. Students scan and register`n6. Admin manages queue (FIFO)`n7. SMS sent when queue >= 3`n8. Daily reset via date cookie`n`n## Key Architectural Issues`n`n1. No API authentication`n2. Plain text passwords`n3. No input validation server-side`n4. No error handling`n5. No rate limiting`n6. Tight coupling (components call API directly)`n7. No caching`n8. No real-time updates`n`n## Recommended Modern Architecture`n`n- Next.js 15 App Router`n- TypeScript throughout`n- Server Components for data fetching`n- Server Actions for mutations`n- NextAuth.js for authentication`n- Prisma ORM`n- Tailwind CSS`n- WebSockets for real-time

<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.

<!-- GSD:profile-end -->
