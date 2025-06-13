import axios from "axios";

export const REGISTER_USER = async (signUp) => {
    const { name, email, password, confirmPassword } = signUp;

    if (!name || !email || !password || !confirmPassword) {
        return { success: false, message: "All fields are required" };
    }

    if (password !== confirmPassword) {
        return { success: false, message: "Passwords do not match" };
    }

    try {
        const response = await axios.post("/api/auth/register", {
            username: name,
            email,
            password,
        });

        return { success: true, message: response.data.message };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Registration failed",
        };
    }
};

export const LOGIN_USER = async (login) => {
    const { email, password } = login;

    if (!email || !password) {
        return { success: false, message: "All fields are required" };
    }

    try {
        const response = await axios.post("/api/auth/login", {
            email,
            password,
        }, { withCredentials: true });

        if (response.status === 200) {
            window.location.href = "/index.html"; // Redirect after login
        }

        return { success: true, message: "Login successful" };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || "Login failed",
        };
    }
};

export const LOGOUT = async () => {
    try {
        await axios.get("/api/auth/logout", { withCredentials: true });
        window.location.href = "/";
    } catch (error) {
        console.error("Logout failed:", error);
    }
};

export const CHECK_AUTH = async () => {
    try {
        const response = await axios.get("/api/auth/refetch", { withCredentials: true });
        return response.data; // Return user data if authenticated
    } catch (error) {
        return null; // Return null if user is not authenticated
    }
};
