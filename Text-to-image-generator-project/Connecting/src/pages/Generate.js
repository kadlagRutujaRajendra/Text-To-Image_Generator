import React, { useState } from 'react';

function Generate() {
    const [prompt, setPrompt] = useState('');
    const [imagePath, setImagePath] = useState('');

    const handleGenerate = async () => {
        const res = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        setImagePath(data.imagePath);
    };

    return (
        <div>
            <input type="text" value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Enter prompt" />
            <button onClick={handleGenerate}>Generate</button>
            {imagePath && <img src={imagePath} alt="Generated Art" />}
        </div>
    );
}

export default Generate;
