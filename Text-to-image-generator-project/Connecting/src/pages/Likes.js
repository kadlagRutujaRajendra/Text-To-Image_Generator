import React, { useEffect, useState } from "react";

const Likes = () => {
    const [images, setImages] = useState([]);

    // Fetch liked images
    const fetchLikedImages = async () => {
        try {
            const response = await fetch("/likes"); // Fetch liked images from the backend
            if (!response.ok) throw new Error("Failed to fetch liked images");
            const data = await response.json();
            setImages(data);
        } catch (error) {
            console.error("Error fetching liked images:", error);
        }
    };

    useEffect(() => {
        fetchLikedImages(); // Load liked images on page load
    }, []);

    // Like an image
    const likeImage = async (imageUrl, prompt) => {
        try {
            const response = await fetch(`/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl, prompt }),
            });
            if (!response.ok) throw new Error("Failed to like the image");

            fetchLikedImages(); // Refresh the liked images
        } catch (error) {
            console.error("Error liking image:", error);
        }
    };

    // Dislike (Remove) an image from liked list
    const dislikeImage = async (imageUrl) => {
        try {
            const response = await fetch(`/unlike`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ imageUrl }),
            });
            if (!response.ok) throw new Error("Failed to dislike the image");

            // Remove the disliked image from the state without refreshing the entire page
            setImages(images.filter((image) => image.imageUrl !== imageUrl));
        } catch (error) {
            console.error("Error disliking image:", error);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}>Liked Images</h2>
            <div style={styles.grid}>
                {images.length > 0 ? (
                    images.map((image) => (
                        <div key={image.imageUrl} style={styles.card}>
                            <img src={image.imageUrl} alt={image.prompt} style={styles.image} />
                            <p style={styles.prompt}>{image.prompt}</p>
                            <button onClick={() => dislikeImage(image.imageUrl)} style={styles.button}>
                                Dislike
                            </button>
                        </div>
                    ))
                ) : (
                    <p style={styles.noImagesText}>No liked images found.</p>
                )}
            </div>
        </div>
    );
};

// Styling
const styles = {
    container: {
        textAlign: "center",
        padding: "20px",
        backgroundColor: "#f4f4f4",
        minHeight: "100vh",
    },
    heading: {
        color: "#333",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "15px",
        maxWidth: "1200px",
        margin: "auto",
        justifyContent: "center",
    },
    card: {
        width: "200px",
        height: "250px",
        background: "white",
        padding: "10px",
        borderRadius: "10px",
        boxShadow: "2px 2px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
    image: {
        width: "100%",
        height: "170px",
        objectFit: "cover",
        borderRadius: "8px",
    },
    prompt: {
        fontSize: "14px",
        color: "#666",
        flexGrow: 1, // Ensures text adjusts properly
    },
    button: {
        padding: "8px 12px",
        fontSize: "14px",
        cursor: "pointer",
        backgroundColor: "#ff4d4d",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        marginTop: "5px",
    },
    noImagesText: {
        fontSize: "16px",
        color: "#777",
    },
};

export default Likes;
