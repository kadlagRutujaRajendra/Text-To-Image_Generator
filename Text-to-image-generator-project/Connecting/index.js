const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
var bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true })); 
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.render('login');
})

app.get('/register', (req, res) => {
    res.render('register');
})
// Serve Static Files (Move Below "/" Route)
app.use(express.static(path.join(__dirname, 'views'))); 
app.use(express.static('public'));


// MongoDB Connection
mongoose.connect(process.env.MONGODB_URL, {
    dbName: process.env.MONGODB_APP_NAME,
}).then(() => console.log(`MongoDB Connected: ${process.env.MONGODB_APP_NAME}`))
.catch(err => console.error('MongoDB Connection Error:', err));

// MongoDB Schema Definitions
const ImageSchema = new mongoose.Schema({
    prompt: String,
    size: String,
    style: String,
    imageUrl: String,
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});
const ImageModel = mongoose.model('Image', ImageSchema);

const LikeSchema = new mongoose.Schema({
    imageUrl: String,
    prompt: String,
});
const Like = mongoose.model("Like", LikeSchema);

async function generateImage(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp-image-generation',
            contents: prompt,
            config: { responseModalities: ['Text', 'Image'] },
        });

        const part = response.candidates[0].content.parts.find(p => p.inlineData);
        if (part) {
            const imageData = part.inlineData.data;
            const buffer = Buffer.from(imageData, 'base64');
            const filename = `generated-${Date.now()}.png`;
            const filePath = path.join(__dirname, 'public', filename);
            fs.writeFileSync(filePath, buffer);
            return `/${filename}`;
        }
    } catch (error) {
        console.error("Error generating content:", error);
        return null;
    }
}

//  Generate Image
app.post('/generate', async (req, res) => {
    const { prompt, size, style } = req.body;
    const imagePath = await generateImage(prompt);
    if (imagePath) {
        const newImage = new ImageModel({ prompt, size, style, imageUrl: imagePath });
        await newImage.save();
        res.json({ imagePath });
    } else {
        res.status(500).json({ error: 'Failed to generate image.' });
    }
});

// Get Image History
app.get('/history', (req, res) => {
    const publicDir = path.join(__dirname, 'public');

    fs.readdir(publicDir, (err, files) => {
        if (err) {
            return res.status(500).send('<h2 class="text-red-500">Error loading images</h2>');
        }

        const imageFiles = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));

        const imageTags = imageFiles.map(file => `
            <div class="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                <img src="/${file}" alt="${file}" class="w-full h-40 object-cover rounded-md mb-2">
                <p class="text-gray-300 text-sm mb-4">${file}</p>
                <div class="flex space-x-2">
                    <button onclick="likeImage('${file}')" class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm">
                        Like
                    </button>
                    <button onclick="deleteImage('${file}')" class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        res.send(`
            <html>
              <head>
                <title>Generated Images</title>
                <script src="https://cdn.tailwindcss.com"></script>
              </head>
              <body class="bg-gray-900 text-white min-h-screen">

                <!-- Header with Navigation and Avatar -->
                <header class="bg-gray-800 p-4">
                  <nav class="flex justify-between items-center max-w-7xl mx-auto">
                    <!-- Centered Navigation Links -->
                    <div class="flex-1 flex justify-center">
                      <ul class="flex space-x-12">
                        <li><a href="/generate" class="text-xl text-gray-300 hover:text-white">Home</a></li>
                        <li><a href="/likes" class="text-xl text-gray-300 hover:text-white">Likes</a></li>
                        <li><a href="/history" class="text-xl text-gray-300 hover:text-white">History</a></li>
                        <li><a href="/edit" class="text-xl text-gray-300 hover:text-white">Edit</a></li>
                      </ul>
                    </div>

                    <!-- User Avatar with Dropdown -->
                    <div class="relative">
                      <div id="userAvatar" class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer">U</div>
                      <div id="userDropdown" class="absolute right-0 mt-2 w-64 bg-gray-700 text-white rounded-lg shadow-lg p-4 hidden z-50">
                        <p><strong>Name:</strong> <span id="userName"></span></p>
                        <p><strong>Email:</strong> <span id="userEmail"></span></p>
                        <button id="logoutBtn" class="mt-4 w-full bg-blue-500 hover:bg-red-600 text-white py-2 rounded">Logout</button>
                      </div>
                    </div>
                  </nav>
                </header>

                <!-- Main Content -->
                <main class="p-6">
                  <h2 class="text-2xl font-semibold mb-6 text-center">Generated Images</h2>
                  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    ${imageTags}
                  </div>
                </main>

                <script>
                  async function likeImage(filename) {
                    try {
                      const response = await fetch('/like/' + filename, { method: 'POST' });
                      if (response.ok) {
                        alert("Image liked!");
                        window.location.href = "/likes";
                      } else {
                        alert("Failed to like image.");
                      }
                    } catch (err) {
                      alert("Error occurred while liking the image.");
                    }
                  }

                  async function deleteImage(filename) {
                    if (!confirm("Are you sure you want to delete this image?")) return;

                    try {
                      const response = await fetch('/delete/' + filename, { method: 'POST' });
                      if (response.ok) {
                        alert("Image deleted!");
                        window.location.href = "/history";
                      } else {
                        alert("Failed to delete image.");
                      }
                    } catch (err) {
                      alert("Error occurred while deleting the image.");
                    }
                  }

                  // Avatar dropdown logic
                  const avatar = document.getElementById('userAvatar');
                  const dropdown = document.getElementById('userDropdown');
                  const userName = document.getElementById('userName');
                  const userEmail = document.getElementById('userEmail');
                  const logoutBtn = document.getElementById('logoutBtn');

                  avatar.addEventListener('click', () => {
                    dropdown.classList.toggle('hidden');
                  });

                  logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('token');
                    window.location.href = "/";
                  });

                  async function fetchUserDetails() {
                    const token = localStorage.getItem('token');
                    if (!token) {
                      console.log("No token found");
                      return;
                    }

                    try {
                      const res = await fetch('/api/user/me', {
                        headers: { Authorization: \`Bearer \${token}\` }
                      });

                      const resultText = await res.text();
                      if (!res.ok) throw new Error('Not authorized');

                      const user = JSON.parse(resultText);
                      userName.textContent = user.name;
                      userEmail.textContent = user.email;
                      avatar.textContent = user.name[0]?.toUpperCase() || "U";
                    } catch (error) {
                      console.error('Error fetching user details:', error);
                    }
                  }

                  window.onload = fetchUserDetails;
                </script>
              </body>
            </html>
        `);
    });
});



// Like an Image
app.post("/like", async (req, res) => {
    try {
        const { imageUrl, prompt } = req.body;
        if (!imageUrl) return res.status(400).json({ message: "Image URL required" });

        const existingLike = await Like.findOne({ imageUrl });
        if (existingLike) return res.status(400).json({ message: "Image already liked" });

        const newLike = new Like({ imageUrl, prompt });
        await newLike.save();
        res.status(201).json({ message: "Image liked successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error liking image" });
    }
});

// Dislike an Image (Remove from Likes)
app.post("/unlike", async (req, res) => {
    try {
        const { imageUrl } = req.body;
        await Like.findOneAndDelete({ imageUrl });
        res.json({ message: "Image removed from likes" });
    } catch (error) {
        res.status(500).json({ message: "Error unliking image" });
    }
});

// Fetch All Liked Images
app.get("/likes", async (req, res) => {
    try {
        const likedImages = await Like.find();

        let htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Liked Images</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-900 text-white min-h-screen">

                <!-- Header -->
                <header class="bg-gray-800 p-4">
                    <nav class="flex justify-between items-center max-w-7xl mx-auto">
                        <div class="flex-1 flex justify-center">
                            <ul class="flex space-x-12">
                                <li><a href="/generate" class="text-xl text-gray-300 hover:text-white">Home</a></li>
                                <li><a href="/likes" class="text-xl text-gray-300 hover:text-white">Likes</a></li>
                                <li><a href="/history" class="text-xl text-gray-300 hover:text-white">History</a></li>
                                <li><a href="/edit" class="text-xl text-gray-300 hover:text-white">Edit</a></li>
                            </ul>
                        </div>
                        <div class="relative">
                            <div id="userAvatar" class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer">U</div>
                            <div id="userDropdown" class="absolute right-0 mt-2 w-64 bg-gray-700 text-white rounded-lg shadow-lg p-4 hidden z-50">
                                <p><strong>Name:</strong> <span id="userName"></span></p>
                                <p><strong>Email:</strong> <span id="userEmail"></span></p>
                                <button id="logoutBtn" class="mt-4 w-full bg-blue-500 hover:bg-red-600 text-white py-2 rounded">Logout</button>
                            </div>
                        </div>
                    </nav>
                </header>

                <!-- Main Content -->
                <main class="p-6">
                    <h2 class="text-2xl font-semibold mb-4 text-center">Liked Images</h2>
                    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        `;

        for (const image of likedImages) {
            const imagePath = path.join(__dirname, 'public', path.basename(image.imageUrl));
            if (fs.existsSync(imagePath)) {
                htmlContent += `
                    <div class="bg-gray-800 p-4 rounded-lg shadow-lg">
                        <img src="${image.imageUrl}" alt="Liked Image" class="w-full h-40 object-cover rounded-md mb-2">
                        <div class="flex justify-center">
                            <button 
                                class="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded text-sm mt-2"
                                onclick="dislikeImage('${image._id}')"
                            >
                                Dislike
                            </button>
                        </div>
                    </div>
                `;
            }
        }

        htmlContent += `
                    </div>
                </main>

                <script>
                    async function dislikeImage(id) {
                        if (confirm("Are you sure you want to dislike this image?")) {
                            const response = await fetch('/dislike/' + id, {
                                method: 'POST'
                            });
                            if (response.ok) {
                                alert("Image disliked successfully!");
                                window.location.href = '/likes';
                            } else {
                                alert("Failed to dislike the image.");
                            }
                        }
                    }

                    // Avatar dropdown logic
                    const avatar = document.getElementById('userAvatar');
                    const dropdown = document.getElementById('userDropdown');
                    const userName = document.getElementById('userName');
                    const userEmail = document.getElementById('userEmail');
                    const logoutBtn = document.getElementById('logoutBtn');

                    avatar.addEventListener('click', () => {
                        dropdown.classList.toggle('hidden');
                    });

                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('token');
                        window.location.href = "/";
                    });

                    async function fetchUserDetails() {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            console.log("No token found");
                            return;
                        }

                        try {
                            const res = await fetch('/api/user/me', {
                                headers: { Authorization: \`Bearer \${token}\` }
                            });

                            const resultText = await res.text();
                            if (!res.ok) throw new Error('Not authorized');

                            const user = JSON.parse(resultText);
                            userName.textContent = user.name;
                            userEmail.textContent = user.email;
                            avatar.textContent = user.name[0]?.toUpperCase() || "U";
                        } catch (error) {
                            console.error('Error fetching user details:', error);
                        }
                    }

                    window.onload = fetchUserDetails;
                </script>
            </body>
            </html>
        `;

        res.send(htmlContent);
    } catch (error) {
        console.error(error);
        res.status(500).send('<h2 class="text-red-500">Error fetching liked images</h2>');
    }
});


//to dislike an image
// In your likes route file (or wherever your routes are)
app.post("/dislike/:id", async (req, res) => {
    try {
        await Like.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Disliked successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error while disliking the image" });
    }
});




// MongoDB Schema & Model
const logschema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: Number,
        required: true  
    },
    password: {
        type: String,
        required: true,
    }
});

const collection = mongoose.model("registereduser", logschema);
module.exports = collection;

app.post('/reg', async (req, res) => {
    try {
        const { name, email, mobile, password } = req.body;

        // Check for empty values
        if (!name || !email || !mobile || !password) {
            return res.status(400).send("All fields are required");
        }

        // Save to MongoDB
        const user = new collection({ name, email, mobile, password });
        await user.save();

        // Redirect to login page (EJS)
        res.redirect("/");  // this goes to app.get('/', ...) which renders login.ejs
    } catch (err) {
        console.error("Registration Failed:", err.message);
        res.status(500).send("Registration failed");
    }
});



// Login Route: Check credentials and redirect to index.html
app.post('/log', async (req, res) => {
    try {
        const check = await collection.findOne({ email: req.body.email });
        if (check && check.password === req.body.password) {
            res.sendFile(path.join(__dirname, 'views', 'index.html')); // serve index.html
        } else {
            res.send("Invalid email or password.");
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Login failed.");
    }
});


//for editing an image 
app.get('/edit', (req, res) => {
    const publicDir = path.join(__dirname, 'public');

    fs.readdir(publicDir, (err, files) => {
        if (err) {
            return res.status(500).send('<h2 class="text-red-500">Error loading images</h2>');
        }

        const imageFiles = files.filter(file =>
            /\.(png|jpg|jpeg)$/i.test(file) && !file.startsWith('edited-')
        );

        if (imageFiles.length === 0) {
            return res.send(`
                <html>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                    </head>
                    <body class="bg-gray-900 text-white p-6">
                        <h2 class="text-yellow-500 text-2xl text-center">No generated images found to display.</h2>
                    </body>
                </html>
            `);
        }

        const htmlImages = imageFiles.map(filename => `
            <div class="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col items-center">
                <img src="/${filename}" alt="${filename}" class="w-full h-52 object-cover rounded-md mb-4" />
                <div class="flex justify-center">
                    <form action="/edit/${filename}" method="POST">
                        <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Edit</button>
                    </form>
                </div>
            </div>
        `).join('');

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Edit Images</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body class="bg-gray-900 text-white min-h-screen">

                <!-- Header -->
                <header class="bg-gray-800 p-4">
                    <nav class="flex justify-between items-center max-w-7xl mx-auto">
                        <div class="flex-1 flex justify-center">
                            <ul class="flex space-x-12">
                                <li><a href="/generate" class="text-xl text-gray-300 hover:text-white">Home</a></li>
                                <li><a href="/likes" class="text-xl text-gray-300 hover:text-white">Likes</a></li>
                                <li><a href="/history" class="text-xl text-gray-300 hover:text-white">History</a></li>
                                <li><a href="/edit" class="text-xl text-gray-300 hover:text-white">Edit</a></li>
                            </ul>
                        </div>
                        <div class="relative">
                            <div id="userAvatar" class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer">U</div>
                            <div id="userDropdown" class="absolute right-0 mt-2 w-64 bg-gray-700 text-white rounded-lg shadow-lg p-4 hidden z-50">
                                <p><strong>Name:</strong> <span id="userName"></span></p>
                                <p><strong>Email:</strong> <span id="userEmail"></span></p>
                                <button id="logoutBtn" class="mt-4 w-full bg-blue-500 hover:bg-red-600 text-white py-2 rounded">Logout</button>
                            </div>
                        </div>
                    </nav>
                </header>

                <!-- Main Content -->
                <main class="p-6">
                    <h2 class="text-2xl font-bold mb-6 text-center">All Generated Images</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${htmlImages}
                    </div>
                </main>

                <script>
                    // Avatar dropdown logic
                    const avatar = document.getElementById('userAvatar');
                    const dropdown = document.getElementById('userDropdown');
                    const userName = document.getElementById('userName');
                    const userEmail = document.getElementById('userEmail');
                    const logoutBtn = document.getElementById('logoutBtn');

                    avatar.addEventListener('click', () => {
                        dropdown.classList.toggle('hidden');
                    });

                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('token');
                        window.location.href = "/";
                    });

                    async function fetchUserDetails() {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            console.log("No token found");
                            return;
                        }

                        try {
                            const res = await fetch('/api/user/me', {
                                headers: { Authorization: \`Bearer \${token}\` }
                            });

                            const resultText = await res.text();
                            if (!res.ok) throw new Error('Not authorized');

                            const user = JSON.parse(resultText);
                            userName.textContent = user.name;
                            userEmail.textContent = user.email;
                            avatar.textContent = user.name[0]?.toUpperCase() || "U";
                        } catch (error) {
                            console.error('Error fetching user details:', error);
                        }
                    }

                    window.onload = fetchUserDetails;
                </script>
            </body>
            </html>
        `);
    });
});


app.post('/like/:filename', async (req, res) => {
    const filename = req.params.filename;
    const imageUrl = `/${filename}`;

    try {
        const existing = await Like.findOne({ imageUrl });
        let message = "";

        if (!existing) {
            await Like.create({ imageUrl });
            message = "Image liked successfully!";
        } else {
            message = "You already liked this image!";
        }

        res.send(`
            <html>
                <head>
                    <script>
                        alert("${message}");
                        window.location.href = "/edit";
                    </script>
                </head>
                <body></body>
            </html>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).send(`
            <html>
                <head>
                    <script>
                        alert("Failed to like image.");
                        window.location.href = "/edit";
                    </script>
                </head>
                <body></body>
            </html>
        `);
    }
});


//to edit a specific file 
// app.post('/edit/:filename', async (req, res) => {
//     const filename = req.params.filename;
//     const imagePath = path.join(__dirname, 'public', filename);
//     const prompt = req.body.prompt || "Add a cartoon cat sitting next to the image.";

//     try {
//         if (!fs.existsSync(imagePath)) {
//             return res.status(404).send('<h2 class="text-red-500">Image not found.</h2>');
//         }

//         const imageData = fs.readFileSync(imagePath);
//         const base64Image = imageData.toString('base64');

//         const response = await ai.models.generateContent({
//             model: "gemini-2.0-flash-exp-image-generation",
//             contents: [
//                 { text: prompt },
//                 {
//                     inlineData: {
//                         mimeType: "image/png",
//                         data: base64Image
//                     }
//                 }
//             ],
//             config: {
//                 responseModalities: ["Text", "Image"]
//             }
//         });

//         const part = response.candidates[0]?.content?.parts?.find(p => p.inlineData);
//         if (!part) {
//             return res.status(500).send('<h2 class="text-red-500">Image editing failed.</h2>');
//         }

//         const editedImageBuffer = Buffer.from(part.inlineData.data, 'base64');
//         const editedFilename = `edited-${Date.now()}-${filename}`;
//         const editedPath = path.join(__dirname, 'public', editedFilename);
//         fs.writeFileSync(editedPath, editedImageBuffer);

//         res.send(`
//             <!DOCTYPE html>
//             <html lang="en">
//             <head>
//                 <meta charset="UTF-8">
//                 <title>Edited Image</title>
//                 <script src="https://cdn.tailwindcss.com"></script>
//                 <script>
//     async function likeImage() {
//         try {
//             const response = await fetch('/like/${editedFilename}', {
//                 method: 'POST'
//             });
//             if (response.ok) {
//                 alert("Image liked!");
//                 window.location.href = "/likes";
//             } else {
//                 alert("Failed to like the image.");
//             }
//         } catch (err) {
//             alert("Error occurred while liking the image.");
//         }
//     }
// </script>

//             </head>
//             <body class="bg-gray-900 text-white flex flex-col items-center p-6">
//                 <h2 class="text-2xl font-semibold mb-4">Edited Image</h2>
//                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div class="bg-gray-800 p-4 rounded-lg shadow-lg">
//                         <h3 class="text-center text-sm mb-2">Original</h3>
//                         <img src="/${filename}" class="w-full h-52 object-cover rounded-md" />
//                     </div>
//                     <div class="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
//                         <h3 class="text-center text-sm mb-2">Edited</h3>
//                         <img src="/${editedFilename}" class="w-full h-52 object-cover rounded-md mb-4" />
//                         <button 
//                             onclick="likeImage()"
//                             class="bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded text-sm"
//                         >
//                             Like
//                         </button>
//                     </div>
//                 </div>
//                 <a href="/edit" class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">Back to All Images</a>
//             </body>
//             </html>
//         `);
//     } catch (error) {
//         console.error("Edit Error:", error);
//         res.status(500).send('<h2 class="text-red-500">Something went wrong while editing.</h2>');
//     }
// });



///Second way with prompt 
app.post('/edit/:filename', async (req, res) => {
    const filename = req.params.filename;
    const imagePath = path.join(__dirname, 'public', filename);
    const prompt = req.body.prompt;

    try {
        if (!fs.existsSync(imagePath)) {
            return res.status(404).send('<h2 class="text-red-500">Image not found.</h2>');
        }

        if (!prompt) {
            return res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Edit Image Prompt</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                </head>
                <body class="bg-gray-900 text-white flex flex-col items-center p-6">
                    <h2 class="text-2xl font-semibold mb-4">Edit Image: ${filename}</h2>
                    <img src="/${filename}" class="w-64 h-64 object-cover rounded mb-4 border border-white" />
                    <form action="/edit/${filename}" method="POST" class="w-full max-w-md flex flex-col gap-4">
                        <textarea name="prompt" rows="4" class="p-2 rounded text-black" placeholder="Enter your editing prompt..." required></textarea>
                        <button type="submit" class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">Submit Prompt</button>
                    </form>
                    <a href="/generate" class="mt-4 text-blue-400 underline">Back to Generate image</a>
                </body>
                </html>
            `);
        }

        const imageData = fs.readFileSync(imagePath);
        const base64Image = imageData.toString('base64');

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp-image-generation",
            contents: [
                { text: prompt },
                {
                    inlineData: {
                        mimeType: "image/png",
                        data: base64Image
                    }
                }
            ],
            config: {
                responseModalities: ["Text", "Image"]
            }
        });

        const part = response.candidates[0]?.content?.parts?.find(p => p.inlineData);
        if (!part) {
            return res.status(500).send('<h2 class="text-red-500">Image editing failed.</h2>');
        }

        const editedImageBuffer = Buffer.from(part.inlineData.data, 'base64');
        const editedFilename = `edited-${Date.now()}-${filename}`;
        const editedPath = path.join(__dirname, 'public', editedFilename);
        fs.writeFileSync(editedPath, editedImageBuffer);

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Edited Image</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <script>
    async function likeImage() {
        try {
            const response = await fetch('/like/${editedFilename}', {
                method: 'POST'
            });
            if (response.ok) {
                alert("Image liked!");
                window.location.href = "/likes";
            } else {
                alert("Failed to like the image.");
            }
        } catch (err) {
            alert("Error occurred while liking the image.");
        }
    }
</script>

            </head>
            <body class="bg-gray-900 text-white flex flex-col items-center p-6">
                <h2 class="text-2xl font-semibold mb-4">Edited Image</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-gray-800 p-4 rounded-lg shadow-lg">
                        <h3 class="text-center text-sm mb-2">Original</h3>
                        <img src="/${filename}" class="w-full h-52 object-cover rounded-md" />
                    </div>
                    <div class="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
                        <h3 class="text-center text-sm mb-2">Edited</h3>
                        <img src="/${editedFilename}" class="w-full h-52 object-cover rounded-md mb-4" />
                        <button 
                            onclick="likeImage()"
                            class="bg-green-600 hover:bg-green-700 text-white py-1 px-4 rounded text-sm"
                        >
                            Like
                        </button>
                    </div>
                </div>
                <a href="/edit" class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">Back to All Images</a>
            </body>
            </html>
        `);
    } catch (error) {
        console.error("Edit Error:", error);
        res.status(500).send('<h2 class="text-red-500">Something went wrong while editing.</h2>');
    }
});



//to delete 
app.post('/delete/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'public', filename);

    fs.unlink(filePath, err => {
        if (err) {
            console.error(`Failed to delete ${filename}:`, err);
            return res.status(500).send(`
                <script>
                    alert("Failed to delete image.");
                    window.location.href = "/edit";
                </script>
            `);
        }

        res.send(`
            <script>
                alert("Image deleted successfully!");
                window.location.href = "/edit";
            </script>
        `);
    });
});







//Catch-All Route for React App
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
