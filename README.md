🖼️ Text-To-Image Generator

A MERN stack application using the Google Gemini API to generate high-quality images from user-input prompts. The platform supports image generation, editing, liking, downloading, and image history with user authentication.

🧩 Features: 

- AI Image Generation (real-time using Google Gemini API)

- Image Storage & Management

- Like & Download Images

- Image Editing Tools

- Secure Authentication (JWT & bcrypt.js)

  
⚙️ System Requirements:

💻 Hardware:

- Processor: Ryzen 3 or above

- RAM: 500MB+

- Storage: 40GB+


🧰 Software :

- OS: Windows 10

- Frontend: HTML, CSS, ReactJS

- Backend: NodeJS, ExpressJS

- Database: MongoDB

- AI API: Google Gemini API


📸 OUTPUT Screens:

🔐 Login Page
![image](https://github.com/user-attachments/assets/a7ee74b9-fc1d-4229-9c57-6c54ac7c135a)


🏠 Home Page
![image](https://github.com/user-attachments/assets/fd682500-bf5e-414b-a77f-38b979a2d1de)


🖌️ Edit Page
![image](https://github.com/user-attachments/assets/4e9872a2-ba7c-479b-a31d-eb08254fbb85)
![image](https://github.com/user-attachments/assets/00eca113-966c-4f4d-87f3-79e8d53183d3)



❤️ Likes Page
![image](https://github.com/user-attachments/assets/fdf22308-e7ce-4b69-995d-cb918d32afcf)


🕓 History Page
![image](https://github.com/user-attachments/assets/fca5342e-8aca-462d-ab86-649b8274f149)


📁 Project Structure

Text-to-image-generator-project/

│

├── Api/                                                             # API utility functions (Axios, fetch)

├── public/                                                          # Static files and assets

├── src/                                                             # Source code including components and logic

├── styles/                                                          # Custom CSS/SCSS files

├── Utils/                                                           # Utility/helper functions

├── views/                                                           # Page views and JSX layout files

├── .env                                                             # Environment variables (API keys etc.)

├── index.js                                                         # Entry point of the app

├── package.json                                                     # Project metadata and dependencies

└── package-lock.json                                                # Exact dependency tree




▶️ How to Run the Project

🛠️ 1. Clone the Repository

git clone https://github.com/Shrutipadwal/Text-to-Image-Generator.git
cd text-to-image-generator
(Replace with your actual repo URL)


📦 2. Install Dependencies
Make sure you have Node.js and npm installed. Then run:

npm install

🔐 3. Set Up Environment Variables

Create a .env file in the root directory and add the required variables:

GEMINI_API_KEY= your_google_gemini_api_key

MONGODB_URI= your_mongodb_connection_string

JWT_SECRET= your_jwt_secret

🚀 4. Run the Development Server

npm run dev
OR You can also use:
npm run start

🌐 5. Access the App

Visit http://localhost:3000 in your browser.

🎯 Scope
- Generate AI images from natural text prompts

- Maintain user image history

- Offer tools to edit and interact with images

- Provide like/download options


🔮 Future Enhancements

- Integrate custom AI image model

- Add brush tools, color filters, layer options

- Enable multi-language prompt inputs

- Add comments, reactions, and trending image filters


🧑‍💻 Author

Developed by SHRUTI PADWAL

M.Sc. Computer Science

LinkedIn: https://www.linkedin.com/in/shruti-padwal-b39054264/
